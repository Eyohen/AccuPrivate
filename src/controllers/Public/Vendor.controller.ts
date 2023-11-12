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
import { DEFAULT_ELECTRICITY_PROVIDER, NODE_ENV } from "../../utils/Constants";
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import { generateRandomToken } from "../../utils/Helper";
import EmailService, { EmailTemplate } from "../../services/Email.service";
import { userInfo } from "os";

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

        const transaction: Transaction | Error = await TransactionService.addTransaction({
            id: uuidv4(),
            amount: '0',
            status: Status.PENDING,
            superagent: superagent,
            paymentType: PaymentType.PAYMENT,
            transactionTimestamp: new Date(),
            disco: disco,
        })

        let transactionId: string = transaction instanceof Transaction ? transaction.id : ''

        // We Check for Meter User 
        const response = superagent != 'BUYPOWERNG'
            ? await VendorService.buyPowerValidateMeter({
                transactionId,
                meterNumber,
                disco,
                vendType
            })
            : await VendorService.baxiValidateMeter(disco, meterNumber, vendType)

        //Add User
        const user: User | Error = await UserService.addUser({
            id: uuidv4(),
            address: response.address,
            email: email,
            name: response.name,
            phoneNumber: phoneNumber,
        }, transaction)

        let userId: string = ''
        if (user instanceof User && transaction instanceof Transaction) {
            userId = user.id
        }

        //Add Meter 
        const meter: Meter | void = await MeterService.addMeter({
            id: uuidv4(),
            address: response.address,
            meterNumber: meterNumber,
            userId: userId,
            disco: disco,
            vendType
        })

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
            meterNumber,
            transactionId,
            phoneNumber,
            bankRefId,
            bankComment,
            amount,
            disco,
            isDebit,
            vendType
        } = req.query as Record<string, any>

        if (!isDebit) throw new BadRequestError('Missing required field')
        if (!bankRefId) throw new BadRequestError('Transaction reference is required')

        // Check if Disco is Up
        const checKDisco: boolean | Error = await VendorService.buyPowerCheckDiscoUp(disco)
        if (!checKDisco) throw new BadRequestError('Disco is currently down')

        // Check if bankRefId has been used before
        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (existingTransaction instanceof Transaction) {
            throw new BadRequestError('Transaction reference has been used before')
        }

        const transactionRecord: Transaction | null = await TransactionService.viewSingleTransaction(transactionId)
        if (!transactionRecord) {
            throw new BadRequestError('Transaction does not exist')
        }

        const transactionHasCompleted = transactionRecord.status === Status.COMPLETE
        if (transactionHasCompleted) {
            throw new BadRequestError('Transaction has been completed before')
        }

        //  Get Meter 
        const meter: Meter | void | null = await MeterService.viewSingleMeterByMeterNumber(meterNumber)
        let meterId = ''
        let meterAddress = ''
        if (meter instanceof Meter) {
            meterId = meter.id
            meterAddress = meter.address
        }

        // Initiate Purchase for token
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId,
            meterNumber,
            disco,
            amount: amount,
            phone: phoneNumber,
            vendType: vendType as 'PREPAID' | 'POSTPAID'
        })

        const user = await transactionRecord.$get('user')
        if (!user) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a user`)
        }

        // Add Power Unit to store token 
        const newPowerUnit: PowerUnit = await PowerUnitService.addPowerUnit({
            id: uuidv4(),
            transactionId: transactionId,
            disco: disco,
            amount: amount,
            meterId: meterId,
            superagent: transactionRecord.superagent,
            address: meterAddress,
            token: NODE_ENV === 'development' ? generateRandomToken() : tokenInfo.data.token,
            tokenNumber: tokenInfo.token,
            tokenUnits: tokenInfo.units
        })

        // Update Transaction
        // TODO: Add request token event to transaction
        await TransactionService.updateSingleTransaction(transactionId, { amount, bankRefId, bankComment })

        EmailService.sendEmail({
            to: user.email,
            subject: 'Token Purchase',
            html: await new EmailTemplate().receipt({
                transaction: transactionRecord,
                meterNumber,
                token: newPowerUnit.token
            })
        })

        // TODO: Send token to users email

        //return PowerUnit
        res.status(200).json({
            status: 'success',
            message: 'Token retrieved successfully',
            data: {
                newPowerUnit: newPowerUnit.dataValues
            }
        })
    }

    static async completeTransaction(req: Request, res: Response) {
        const {
            bankRefId
        }: { bankRefId: string } = req.body

        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (!existingTransaction) {
            throw new BadRequestError('Transaction does not found')
        }

        const transactionHasCompleted = existingTransaction instanceof Transaction && existingTransaction.status === Status.COMPLETE
        if (transactionHasCompleted) {
            throw new BadRequestError('Transaction is already complete')
        }

        // TODO: Add complete transaction event to transaction
        await TransactionService.updateSingleTransaction(existingTransaction.id, { status: Status.COMPLETE })
        res.status(200).json({
            status: 'success',
            message: 'Transaction has been completed'
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
}