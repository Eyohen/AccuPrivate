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
import { DEFAULT_ELECTRICITY_PROVIDER } from "../../utils/Constants";
import logger from "../../utils/Logger";
import { BadRequestError } from "../../utils/Errors";

interface valideMeterRequestBody {
    meterNumber: string
    venderType: 'BUYPOWERNG' | 'BAXI'
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}


interface vendTokenRequestBody {
    meterNumber: string
    venderType: 'BUYPOWERNG' | 'BAXI'
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}


export default class VendorController {

    static async validateMeter(req: Request, res: Response, next: NextFunction) {
        const {
            meterNumber,
            venderType,
            disco,
            phoneNumber,
            email,
        }: valideMeterRequestBody = req.body
        const transaction: Transaction | Error = await TransactionService.addTransaction({
            id: uuidv4(),
            amount: '0',
            status: Status.PENDING,
            venderType: venderType,
            paymentType: PaymentType.PAYMENT,
            transactionTimestamp: new Date(),
            disco: disco,
            superagent: "BUYPOWERNG",
        })

        let transactionId: string = transaction instanceof Transaction ? transaction.id : ''

        // We Check for Meter User 
        const response = DEFAULT_ELECTRICITY_PROVIDER != 'BUYPOWERNG'
            ? await VendorService.buyPowerValidateMeter({
                transactionId,
                meterNumber,
                disco,
            })
            : await VendorService.baxiValidateMeter(disco, meterNumber)

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
            disco: disco
        })

        const successful = transaction instanceof Transaction && user instanceof User && meter instanceof Meter
        if (!successful) throw Error()

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
                    name: user.name
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
            isDebit
        } = req.query as Record<string, string>

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

        const existingSuccessfulTransaction = await TransactionService.viewSingleTransaction(transactionId)
        const transactionHasCompleted = existingSuccessfulTransaction instanceof Transaction && existingSuccessfulTransaction.status === Status.COMPLETE
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

        // request token
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId,
            meterNumber,
            disco,
            amount: amount,
            phone: phoneNumber,
        })

        const newPowerUnit: PowerUnit = await PowerUnitService.addPowerUnit({
            id: uuidv4(),
            transactionId: transactionId,
            disco: disco,
            amount: amount,
            meterId: meterId,
            superagent: 'BUYPOWER',
            address: meterAddress,
            token: tokenInfo.data.token,
            tokenNumber: tokenInfo.token,
            tokenUnits: tokenInfo.units
        })

        //update Transaction
        // TODO: Add request token event to transaction
        await TransactionService.updateSingleTransaction(transactionId, { amount, bankRefId, bankComment })

        // TODO: Send token to users email

        //return PowerUnit
        res.status(200).json({
            newPowerUnit: newPowerUnit.dataValues
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
        try {
            if (!['baxi', 'buypower'].includes(req.query.provider as string)) {
                return res.status(400).json({
                    status: 'error',
                    error: true,
                    message: 'Invalid provider'
                })
            }

            const discos = req.query.provider === 'baxi'
                ? await VendorService.baxiFetchAvailableDiscos().then(r => r.data.providers)
                : await VendorService.buyPowerFetchAvailableDiscos()

            res.status(200).json({
                discos: discos
            })
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: true,
                message: 'Something went wrong'
            })
        }

    }
}