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
import { BadRequestError, GateWayTimeoutError, InternalServerError, NotFoundError } from "../../utils/Errors";
import { generateRandomToken } from "../../utils/Helper";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer'
import Partner from "../../models/Partner.model";
import PartnerService from "../../services/Partner.service";
import { Database, Sequelize } from "../../models/index";
import PasswordService from "../../services/Password.service";
import { AuthUtil } from "../../utils/Auth/token";
import Validator from "../../utils/Validators";
import logger from "../../utils/Logger";

export default class AuthController {

    static async signup(req: Request, res: Response, next: NextFunction) {
        const {
            email,
            password,
        } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const validPassword = Validator.validatePassword(password)
        if (!validPassword) {
            throw new BadRequestError('Invalid password')
        }

        const existingPartner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (existingPartner) {
            throw new BadRequestError('Email has been used before')
        }

        const transaction = await Database.transaction()
        const newPartner = await PartnerService.addPartner({
            id: uuidv4(),
            email,
            status: {
                activated: false,
                emailVerified: false
            }
        }, transaction)

        const partnerPassword = await PasswordService.addPassword({
            id: uuidv4(),
            partnerId: newPartner.id,
            password
        }, transaction)

        console.log(newPartner.dataValues)
        console.log(partnerPassword.dataValues)

        const accessToken = await AuthUtil.generateToken({ type: 'access', partner: newPartner.dataValues, expiry: 60 * 10 })
        const otpCode = await AuthUtil.generateCode({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 })
        await transaction.commit()

        logger.info(otpCode)
        EmailService.sendEmail({
            to: newPartner.email,
            subject: 'Verify Email',
            html: await new EmailTemplate().emailVerification({
                partnerEmail: newPartner.email,
                otpCode: otpCode
            })
        })

        res.status(201).json({
            status: 'success',
            message: 'Partner created successfully',
            data: {
                partner: ResponseTrimmer.trimPartner(newPartner),
                accessToken,
            }
        })
    }

    static async verifyEmail(req: Request, res: Response, next: NextFunction) {
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
                id: uuidv4(),
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

    static async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
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


        // Add Power Unit to store token 
        const newPowerUnit: PowerUnit = await PowerUnitService.addPowerUnit({
            id: uuidv4(),
            transactionId: transactionId,
            disco: disco,
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
        await TransactionService.updateSingleTransaction(transactionId, { amount, bankRefId, bankComment, status: Status.COMPLETE })

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

    static async forgotPassword(req: Request, res: Response) {
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

    static async resetPassword(req: Request, res: Response) {
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

    static async login(req: Request, res: Response) {
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