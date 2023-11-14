import { Request, Response } from "express";
import Transaction, { ITransaction } from "../../models/Transaction.model";
import TransactionService from "../../services/Transaction.service";
import { BadRequestError, InternalServerError, NotFoundError } from "../../utils/Errors";
import { Status } from "../../models/Event.model";
import EmailService, { EmailTemplate } from "../../utils/Email";
import { generateRandomToken } from "../../utils/Helper";
import { NODE_ENV } from "../../utils/Constants";
import PowerUnitService from "../../services/PowerUnit.service";
import { UUIDV4 } from "sequelize";
import ResponseTrimmer from "../../utils/ResponseTrimmer";
import { randomUUID } from "crypto";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";

interface getTransactionInfoRequestBody {
    bankRefId: string
}

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
        const { bankRefId } = req.query as Record<string, string>

        const transaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
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

    static async getTransactions(req: Request, res: Response) {
        const {
            page, limit, status, startDate, endDate,
            userId, disco, superagent
        } = req.query as any as getTransactionsRequestBody

        const query = { where: {} } as any
        if (status) query.where.status = status
        if (startDate && endDate) query.where.transactionTimestamp = { $between: [startDate, endDate] }
        if (userId) query.where.userId = userId
        if (disco) query.where.disco = disco
        if (superagent) query.where.superagent = superagent
        if (limit) query.limit = limit
        if (page && page != '0' && limit) {
            query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit)
        }

        const transactions: Transaction[] = await TransactionService.viewTransactionsWithCustomQuery(query)
        if (!transactions) {
            throw new NotFoundError('Transactions not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Transactions retrieved successfully',
            data: { transactions }
        })
    }

    static async requeryTimedOutTransaction(req: Request, res: Response) {
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

            return res.status(200).json({
                status: 'success',
                message: 'Requery request successful',
                data: {
                    requeryStatusCode: transactionFailed ? 400 : 202,
                    requeryStatusMessage: transactionFailed ? 'Transaction failed' : 'Transaction pending',
                    transaction: ResponseTrimmer.trimTransaction(transactionRecord),
                }
            })
        }

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
}