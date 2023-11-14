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
import Cypher from "../../utils/Cypher";
import ApiKeyService from "../../services/ApiKey.service ";

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
                emailVerified: false,
            },
        }, transaction)

        const apiKey = await ApiKeyService.addApiKey({
            partnerId: newPartner.id,
            key: newPartner.key,
            active: true,
            id: uuidv4()
        }, transaction)

        const secKeyInCache = Cypher.encryptString(newPartner.sec)
        await TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher.encryptString(newPartner.key) })
        await ApiKeyService.setCurrentActiveApiKeyInCache(newPartner, apiKey.key.toString())

        const partnerPassword = await PasswordService.addPassword({
            id: uuidv4(),
            partnerId: newPartner.id,
            password
        }, transaction)

        await newPartner.update({ status: { ...newPartner.status, emailVerified: true } })
        const accessToken = await AuthUtil.generateToken({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 })
        const otpCode = await AuthUtil.generateCode({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 })
        await transaction.commit()

        logger.info(otpCode)
        await EmailService.sendEmail({
            to: newPartner.email,
            subject: 'Succesful Email Verification',
            html: await new EmailTemplate().awaitActivation(newPartner.email)
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

        await partner.update({ status: { ...partner.status, emailVerified: true } })
        if (partner.status.emailVerified) {
            throw new BadRequestError('Email already verified')
        }

        const validCode = await AuthUtil.compareCode({ partner: partner.dataValues, tokenType: 'emailverification', token: otpCode })
        if (!validCode) {
            throw new BadRequestError('Invalid otp code')
        }

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
        const { email } = req.body

        const partner = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('No account exist for this email')
        }

        const accessToken = await AuthUtil.generateToken({ type: 'passwordreset', partner: partner.dataValues, expiry: 60 * 10 })
        const otpCode = await AuthUtil.generateCode({ type: 'passwordreset', partner: partner.dataValues, expiry: 60 * 10 })
        EmailService.sendEmail({
            to: email,
            subject: 'Forgot password',
            html: await new EmailTemplate().forgotPassword({ email, otpCode })
        })

        res.status(200).json({
            status: 'success',
            message: 'Otpcode sent to users email',
            data: {
                accessToken
            }
        })
    }

    static async resetPassword(req: Request, res: Response) {
        const { otpCode, newPassword }: { otpCode: string, newPassword: string } = req.body

        const validPassword = Validator.validatePassword(newPassword)
        if (!validPassword) {
            throw new BadRequestError('Invalid password')
        }

        const partner = await PartnerService.viewSinglePartner((req as any).user.partner.id)
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        const validCode = await AuthUtil.compareCode({ partner: partner.dataValues, tokenType: 'passwordreset', token: otpCode })
        if (!validCode) {
            throw new BadRequestError('Invalid otp code')
        }

        const password = await partner.$get('password')
        if (!password) {
            throw new InternalServerError('No password found for authneticate partner')
        }

        await PasswordService.updatePassword(partner.id, newPassword)
        await AuthUtil.deleteToken({ partner, tokenType: 'passwordreset', tokenClass: 'token' })

        await EmailService.sendEmail({
            to: partner.email,
            subject: 'Succesful Email Verification',
            html: await new EmailTemplate().awaitActivation(partner.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully',
            data: null
        })
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body

        const partner = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Invalid Email or password')
        }

        const partnerPassword = await partner.$get('password')
        if (!partnerPassword) {
            throw new BadRequestError('Invalid Email or password')
        }

        const validPassword = await PasswordService.comparePassword(password, partnerPassword.password)
        if (!validPassword) {
            throw new BadRequestError('Invalid Email or password')
        }

        if (!partner.status.activated) {
            throw new BadRequestError('Account not activated')
        }

        const accessToken = await AuthUtil.generateToken({ type: 'access', partner: partner.dataValues, expiry: 60 * 60 * 60 * 60 })
        const refreshToken = await AuthUtil.generateToken({ type: 'refresh', partner: partner.dataValues, expiry: 60 * 60 * 24 * 30 })

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                partner: ResponseTrimmer.trimPartner(partner),
                accessToken,
                refreshToken
            }
        })
    }
}