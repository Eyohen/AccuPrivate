import { Request, Response } from "express";
import Transaction, { IQueryTransaction, ITransaction } from "../../models/Transaction.model";
import TransactionService from "../../services/Transaction.service";
import { BadRequestError, InternalServerError, NotFoundError } from "../../utils/Errors";
import { Status } from "../../models/Event.model";
import EmailService, { EmailTemplate } from "../../utils/Email";
import { generateRandomToken } from "../../utils/Helper";
import { DISCO_LOGO, NODE_ENV } from "../../utils/Constants";
import PowerUnitService from "../../services/PowerUnit.service";
import ResponseTrimmer from "../../utils/ResponseTrimmer";
import { randomUUID } from "crypto";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import EventService from "../../services/Event.service";
import { RoleEnum } from "../../models/Role.model";
const newrelic= require('newrelic')

interface getTransactionsRequestBody extends ITransaction {
    page: `${number}`
    limit: `${number}`
    status: Status
    startDate: Date
    endDate: Date
    userId: string
    meterId: string
    disco: string
    superagent: 'BUYPOWERNG' | 'BAXI'
}

export default class TransactionController {
    static async getTransactionInfo(req: Request, res: Response) {
        newrelic.setTransactionName('Transaction/Get Transaction Info')
        const { bankRefId, transactionId } = req.query as Record<string, string>

        const transaction: Transaction | null = bankRefId
            ? await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
            : await TransactionService.viewSingleTransaction(transactionId)
        if (!transaction) {
            throw new NotFoundError('Transaction not found')
        }

        const powerUnit = await transaction.$get('powerUnit')

        res.status(200).json({
            status: 'success',
            message: 'Transaction info retrieved successfully',
            data: { transaction: { ...transaction.dataValues, powerUnit } }
        })
    }

    static async getTransactions(req: AuthenticatedRequest, res: Response) {
        newrelic.setTransactionName('Transaction/Get Transaction Info')
        const {
            page, limit, status, startDate, endDate,
            userId, disco, superagent, partnerId
        } = req.query as any as getTransactionsRequestBody

        const query = { where: {} } as IQueryTransaction

        if (status) query.where.status = status
        if (startDate && endDate) query.where.transactionTimestamp = { $between: [startDate, endDate] }
        if (userId) query.where.userId = userId
        if (disco) query.where.disco = disco
        if (superagent) query.where.superagent = superagent
        if (limit) query.limit = parseInt(limit)
        if (page && page != '0' && limit) {
            query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit)
        }
        if (partnerId) query.where.partnerId = partnerId

        const requestWasMadeByAnAdmin = [RoleEnum.Admin].includes(req.user.user.entity.role)
        if (!requestWasMadeByAnAdmin) {
            query.where.partnerId = req.user.user.profile.id
        }

        const transactions: Transaction[] = await TransactionService.viewTransactionsWithCustomQuery(query)
        if (!transactions) {
            throw new NotFoundError('Transactions not found')
        }

        const paginationData = {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount: transactions.length,
            totalPages: Math.ceil(transactions.length / parseInt(limit))
        }

        const response = {
            transactions: transactions
        } as any

        if (page && page != '0' && limit) {
            response['pagination'] = paginationData
        }

        res.status(200).json({
            status: 'success',
            message: 'Transactions retrieved successfully',
            data: response
        })
    }

    static async requeryTimedOutTransaction(req: AuthenticatedRequest, res: Response) {
        newrelic.setTransactionName('Transaction/Requery Transaction Name')
        const { bankRefId }: { bankRefId: string } = req.query as any

        let transactionRecord = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (!transactionRecord) {
            throw new NotFoundError('Transaction record not found')
        }

        if (transactionRecord.superagent === 'BUYPOWERNG') {
            throw new BadRequestError('Transaction cannot be requery for this superagent')
        }

        let powerUnit = await transactionRecord.$get('powerUnit')
        const response = await VendorService.buyPowerRequeryTransaction({ transactionId: transactionRecord.id })
        if (response.status === false) {
            const transactionFailed = response.responseCode === 202
            const transactionIsPending = response.responseCode === 201

            if (transactionFailed) await TransactionService.updateSingleTransaction(transactionRecord.id, { status: Status.FAILED })
            else if (transactionIsPending) await TransactionService.updateSingleTransaction(transactionRecord.id, { status: Status.PENDING })

            res.status(200).json({
                status: 'success',
                message: 'Requery request successful',
                data: {
                    requeryStatusCode: transactionFailed ? 400 : 202,
                    requeryStatusMessage: transactionFailed ? 'Transaction failed' : 'Transaction pending',
                    transaction: ResponseTrimmer.trimTransaction(transactionRecord),
                }
            })

            return
        }

        await EventService.addEvent({
            id: randomUUID(),
            transactionId: transactionRecord.id,
            eventType: 'REQUERY',
            eventText: 'Requery successful',
            eventData: response as unknown as JSON,
            eventTimestamp: new Date(),
            source: 'BUYPOWERNG',
            status: Status.COMPLETE
        })

        await TransactionService.updateSingleTransaction(transactionRecord.id, { status: Status.COMPLETE })
        const user = await transactionRecord.$get('user')
        if (!user) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a user`)
        }

        if (!transactionRecord.userId) {
            throw new InternalServerError(`Timedout transaction ${transactionRecord.id} does not have a user`)
        }

        const meter: Meter | null = await transactionRecord.$get('meter')
        if (!meter) {
            throw new InternalServerError(`Timedout transaction ${transactionRecord.id} does not have a meter`)
        }

        // Power unit will only be created if the transaction has been completed or if a sucessful requery has been don
        const transactionHasBeenAccountedFor = !!powerUnit

        // Add Power Unit to store token if transcation has not been accounted for 
        powerUnit = powerUnit
            ? powerUnit
            : await PowerUnitService.addPowerUnit({
                id: randomUUID(),
                transactionId: transactionRecord.id,
                disco: transactionRecord.disco,
                discoLogo: DISCO_LOGO[transactionRecord.disco.toLowerCase() as keyof typeof DISCO_LOGO],
                amount: transactionRecord.amount,
                meterId: meter.id,
                superagent: transactionRecord.superagent,
                address: meter.address,
                token: NODE_ENV === 'development' ? generateRandomToken() : response.data.token,
                tokenNumber: 0,
                tokenUnits: response.data.token
            })

        // Update Transaction if transaction has not been accounted for
        // TODO: Add request token event to transaction
        transactionRecord = transactionHasBeenAccountedFor ? transactionRecord : await transactionRecord.update({ amount: transactionRecord.amount, status: Status.COMPLETE })

        // TODO: Only send email if transaction has not been completed before
        !transactionHasBeenAccountedFor && EmailService.sendEmail({
            to: user.email,
            subject: 'Token Purchase',
            html: await new EmailTemplate().receipt({
                transaction: transactionRecord,
                meterNumber: meter.meterNumber,
                token: powerUnit.token
            })
        })

        res.status(200).json({
            status: 'success',
            message: 'Requery request successful',
            data: {
                requeryStatusCode: 200,
                requeryStatusMessage: 'Transaction successful',
                transaction: ResponseTrimmer.trimTransaction(transactionRecord),
                powerUnit: ResponseTrimmer.trimPowerUnit(powerUnit)
            }
        })
    }

    static async getYesterdaysTransactions(req: AuthenticatedRequest, res: Response) {
        newrelic.setTransactionName('Transaction/Show Yesterday Transactions')
        const { status } = req.query as any as { status: 'COMPLETED' | 'FAILED' | 'PENDING' }
        const { profile: { id } } = req.user.user

        const partner = await PartnerService.viewSinglePartner(id)
        if (!partner) {
            throw new InternalServerError('Authenticated partner not found')
        }

        const transactions = status
            ? await TransactionService.viewTransactionsForYesterdayByStatus(partner.id, status.toUpperCase() as typeof status)
            : await TransactionService.viewTransactionForYesterday(partner.id)

        const totalAmount = transactions.reduce((acc, curr) => acc + parseInt(curr.amount), 0)

        res.status(200).json({
            status: 'success',
            message: 'Transactions retrieved successfully',
            data: { transactions, totalAmount }
        })
    }
}