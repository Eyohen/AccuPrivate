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
    venderType: string
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}


interface vendTokenRequestBody {
    meterNumber: string
    venderType: string
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}


export default class VendorController {

    static async validateMeter(req: Request, res: Response, next: NextFunction) {
        console.log('insid')
        const {
            meterNumber,
            venderType,
            disco,
            partnerName,
            phoneNumber,
            email,
        }: valideMeterRequestBody = req.body
        const transaction: Transaction | Error = await TransactionService.addTransaction({
            id: uuidv4(),
            amount: '0',
            status: Status.PENDING,
            paymentType: PaymentType.PAYMENT,
            transactionTimestamp: new Date(),
            disco: disco,
            superagent: "BUYPOWERNG",
        })

        let transactionId: string = transaction instanceof Transaction ? transaction.id : ''

        // We Check for Meter User 
        const response = DEFAULT_ELECTRICITY_PROVIDER != 'buypower'
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

        throw new BadRequestError('Meter already exists')
        // const successful = transaction instanceof Transaction && user instanceof User && meter instanceof Meter
        // if (!successful) throw Error()

        // res.status(200).json({
        //     status: 'success',
        //     data: {
        //         transaction: {
        //             transactionId: transaction.id,
        //             status: transaction.Status,
        //         },
        //         meter: {
        //             disco: meter.disco,
        //             number: meter.meterNumber,
        //             address: meter.address,
        //             phone: user.phoneNumber,
        //             name: user.name
        //         }
        //     }
        // })
    }

    static async requestToken(req: Request, res: Response) {
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

        if (!isDebit) return res.status(400).json({ status: 'error', error: true, message: 'Transaction must be completed' })
        if (!bankRefId) return res.status(400).json({ status: 'error', error: true, message: 'Transaction reference is required' })

        try {
            //Check if Disco is Up
            const checKDisco: boolean | Error = await VendorService.buyPowerCheckDiscoUp(disco)
            if (!checKDisco) return res.status(400).json({ status: 'error', error: true, message: 'Disco is currently down' })

            //request token

            const tokenInfo = await VendorService.buyPowerVendToken({
                transactionId,
                meterNumber,
                disco,
                amount: amount,
                phone: phoneNumber,
            })


            logger.info(tokenInfo)

            //Get Meter 
            logger.info('pre')
            const meter: Meter | void | null = await MeterService.veiwSingleMeterByMeterNumber(meterNumber)
            logger.info('post')
            let meterId = ''
            let meterAddress = ''
            logger.info('meter', meter)
            if (meter instanceof Meter) {
                meterId = meter.id
                meterAddress = meter.address
            }


            // add PowerUnit 
            const newPowerUnit: PowerUnit | void = await PowerUnitService.addPowerUnit({
                id: uuidv4(),
                transactionId: transactionId,
                disco: disco,
                amount: amount,
                meterId: meterId,
                superagent: 'BUYPOWER',
                address: meterAddress,
                tokenNumber: tokenInfo.token,
                tokenUnits: tokenInfo.units
            })

            //update Transaction
            await TransactionService.updateSingleTransaction(transactionId, { amount })

            //return PowerUnit
            res.status(200).json({
                newPowerUnit: { ...newPowerUnit, token: '0000-0000-0000-0000' }
            })

        } catch (err: any) {
            logger.info(err)
            res.status(400).json(
                {
                    status: 'error',
                    error: true,
                    message: err?.response.data.message
                }
            )
        }




    }

    static async completeTransaction(req: Request, res: Response) {

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