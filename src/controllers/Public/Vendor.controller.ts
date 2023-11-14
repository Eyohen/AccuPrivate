import { NextFunction, Request, Response } from "express";
import TransactionService from "../../services/Transaction.service";
import Transaction, { PaymentType, Status } from "../../models/Transaction.model";
import { v4 as uuidv4 } from 'uuid';
import UserService from "../../services/User.service";
import MeterService from "../../services/Meter.service";
import User from "../../models/User.model";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import PowerUnit from "../../models/PowerUnit.model";
import PowerUnitService from "../../services/PowerUnit.service";
import { DEFAULT_ELECTRICITY_PROVIDER, DISCO_LOGO, NODE_ENV } from "../../utils/Constants";
import { BadRequestError, GateWayTimeoutError, InternalServerError, NotFoundError } from "../../utils/Errors";
import { generateRandomToken } from "../../utils/Helper";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer'

interface valideMeterRequestBody {
    meterNumber: string
    superagent: 'BUYPOWERNG' | 'BAXI',
    vendType: 'PREPAID' | 'POSTPAID',
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}


interface vendTokenRequestBody {
    meterNumber: string
    provider: 'BUYPOWERNG' | 'BAXI'
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}

export default class VendorController {

    static async validateMeter(req: Request, res: Response, next: NextFunction) {
        const {
            meterNumber,
            disco,
            phoneNumber,
            email,
            vendType
        }: valideMeterRequestBody = req.body
        const superagent = DEFAULT_ELECTRICITY_PROVIDER // BUYPOWERNG or BAXI
        const transactionId = uuidv4()
        const partnerId = (req as any).key

        // We Check for Meter User *
        const response = superagent != 'BUYPOWERNG'
            ? await VendorService.buyPowerValidateMeter({
                transactionId,
                meterNumber,
                disco,
                vendType
            }).catch(e => { throw new BadRequestError('Meter validation failed') })
            : await VendorService.baxiValidateMeter(disco, meterNumber, vendType)
                .catch(e => { throw new BadRequestError('Meter validation failed') })

        // Add User
        const user: User = await UserService.addUser({
            id: uuidv4(),
            address: response.address,
            email: email,
            name: response.name,
            phoneNumber: phoneNumber,
        })

        const transaction: Transaction = await TransactionService.addTransaction({
            id: transactionId,
            amount: '0',
            status: Status.PENDING,
            superagent: superagent,
            paymentType: PaymentType.PAYMENT,
            transactionTimestamp: new Date(),
            disco: disco,
            userId: user.id,
            partnerId: partnerId,
        })

        const meter: Meter = await MeterService.addMeter({
            id: uuidv4(),
            address: response.address,
            meterNumber: meterNumber,
            userId: user.id,
            disco: disco,
            vendType,
        })

        await transaction.update({ meterId: meter.id })

        const successful = transaction instanceof Transaction && user instanceof User && meter instanceof Meter
        if (!successful) throw new InternalServerError('An error occured while validating meter')

        res.status(200).json({
            status: 'success',
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
                meter: {
                    disco: meter.disco,
                    number: meter.meterNumber,
                    address: meter.address,
                    phone: user.phoneNumber,
                    vendType: meter.vendType,
                    name: user.name,
                }
            }
        })
    }

    static async requestToken(req: Request, res: Response, next: NextFunction) {
        const {
            transactionId,
            bankRefId,
            bankComment,
            amount,
            vendType
        } = req.query as Record<string, any>

        if (!bankRefId) throw new BadRequestError('Transaction reference is required')

        const transactionRecord: Transaction | null = await TransactionService.viewSingleTransaction(transactionId)
        if (!transactionRecord) {
            throw new BadRequestError('Transaction does not exist')
        }

        const disco = transactionRecord.disco

        // Check if Disco is Up
        const checKDisco: boolean | Error = await VendorService.buyPowerCheckDiscoUp(disco)
        if (!checKDisco) throw new BadRequestError('Disco is currently down')

        // Check if bankRefId has been used before
        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (existingTransaction instanceof Transaction) {
            throw new BadRequestError('Bank reference has been used before')
        }

        const transactionHasCompleted = transactionRecord.status === Status.COMPLETE
        if (transactionHasCompleted) {
            throw new BadRequestError('Transaction has been completed before')
        }

        //  Get Meter 
        const meter: Meter | null = await transactionRecord.$get('meter')
        if (!meter) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a meter`)
        }

        const user = await transactionRecord.$get('user')
        if (!user) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a user`)
        }

        // Initiate Purchase for token
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId,
            meterNumber: meter.meterNumber,
            disco,
            amount: amount,
            phone: user.phoneNumber,
            vendType: vendType as 'PREPAID' | 'POSTPAID'
        }).catch(error => error)
        if (tokenInfo instanceof Error) {
            if (tokenInfo.message === 'Transaction timeout') {
                await TransactionService.updateSingleTransaction(transactionId, { status: Status.PENDING, bankComment, bankRefId })
                throw new GateWayTimeoutError('Transaction timeout')
            }

            throw tokenInfo
        }


        const discoLogo = DISCO_LOGO[disco.toLowerCase() as keyof typeof DISCO_LOGO]
        console.log('discoLogo', discoLogo)
        // Add Power Unit to store token 
        const newPowerUnit: PowerUnit = await PowerUnitService.addPowerUnit({
            id: uuidv4(),
            transactionId: transactionId,
            disco: disco,
            discoLogo,
            amount: amount,
            meterId: meter.id,
            superagent: transactionRecord.superagent,
            address: meter.address,
            token: NODE_ENV === 'development' ? generateRandomToken() : tokenInfo.data.token,
            tokenNumber: tokenInfo.token,
            tokenUnits: tokenInfo.units
        })

        // Update Transaction
        // TODO: Add request token event to transaction
        await TransactionService.updateSingleTransaction(transactionId, { amount, bankRefId, bankComment, status: Status.COMPLETE, paymentType: vendType })

        // Update all transactions paymentType to PREPAID
        const transactions = await TransactionService.viewTransactionsWithCustomQuery({ })
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i]
            if (transaction.paymentType === PaymentType.PAYMENT) {
                await transaction.update({ paymentType: vendType })
            }
        }
        EmailService.sendEmail({
            to: user.email,
            subject: 'Token Purchase',
            html: await new EmailTemplate().receipt({
                transaction: transactionRecord,
                meterNumber: meter?.meterNumber,
                token: newPowerUnit.token
            })
        })

        //return PowerUnit
        res.status(200).json({
            status: 'success',
            message: 'Token retrieved successfully',
            data: {
                newPowerUnit: ResponseTrimmer.trimPowerUnit(newPowerUnit)
            }
        })
    }

    static async getDiscos(req: Request, res: Response) {
        let discos: { name: string, serviceType: 'PREPAID' | 'POSTPAID' }[] = []

        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case 'BAXI':
                discos = await VendorService.baxiFetchAvailableDiscos()
                break
            case 'BUYPOWERNG':
                discos = await VendorService.buyPowerFetchAvailableDiscos()
                break
            default:
                discos = []
                break
        }
        res.status(200).json({
            status: 'success',
            message: 'Discos retrieved successfully',
            data: {
                discos: discos
            }
        })
    }

    static async checkDisco(req: Request, res: Response) {
        const { disco } = req.query

        let result = false
        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case 'BAXI':
                result = await VendorService.baxiCheckDiscoUp(disco as string)
                break;
            case 'BUYPOWERNG':
                result = await VendorService.buyPowerCheckDiscoUp(disco as string)
                break;
            default:
                throw new InternalServerError('An error occured')
        }

        res.status(200).json({
            status: 'success',
            message: 'Disco check successful',
            data: {
                discAvailable: result
            }
        })
    }
}