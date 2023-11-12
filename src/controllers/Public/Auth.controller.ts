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
import { AuthUtil, TokenUtil } from "../../utils/Auth/token";
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

        const accessToken = await AuthUtil.generateToken({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 })
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
        const { otpCode }: { otpCode: string } = req.body

        const partner = await PartnerService.viewSinglePartner((req as any).user.partner.id)
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        if (partner.status.emailVerified) {
            throw new BadRequestError('Email already verified')
        }

        const validCode = await AuthUtil.compareCode({ partner: partner.dataValues, tokenType: 'emailverification', token: otpCode })
        if (!validCode) {
            throw new BadRequestError('Invalid otp code')
        }

        await partner.update({ status: { ...partner.status, emailVerified: true } })
        await AuthUtil.deleteToken({ partner, tokenType: 'emailverification', tokenClass: 'token' })

        await EmailService.sendEmail({
            to: partner.email,
            subject: 'Succesful Email Verification',
            html: await new EmailTemplate().awaitActivation(partner.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
            data: null
        })
    }

    static async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
        const email = req.query.email as string

        const newPartner = await PartnerService.viewSinglePartnerByEmail(email)
        console.log(newPartner)
        if (!newPartner) {
            throw new InternalServerError('Authenticate partner record not found')
        }

        if (newPartner.status.emailVerified) {
            throw new BadRequestError('Email already verified')
        }

        const otpCode = await AuthUtil.generateCode({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 })

        EmailService.sendEmail({
            to: newPartner.email,
            subject: 'Verify Email',
            html: await new EmailTemplate().emailVerification({
                partnerEmail: newPartner.email,
                otpCode: otpCode
            })
        })

        res.status(200).json({
            status: 'success',
            message: 'Verification code sent successfully',
            data: {
                partner: ResponseTrimmer.trimPartner(newPartner),
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