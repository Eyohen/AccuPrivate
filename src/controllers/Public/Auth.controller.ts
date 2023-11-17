import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer';
import Partner from "../../models/Entity/Profiles/PartnerProfile.model";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import { Database } from "../../models/index";
import PasswordService from "../../services/Password.service";
import { AuthUtil, TokenUtil } from "../../utils/Auth/Token";
import Validator from "../../utils/Validators";
import logger from "../../utils/Logger";
import Cypher from "../../utils/Cypher";
import ApiKeyService from "../../services/ApiKey.service ";
import EntityService from "../../services/Entity/Entity.service";
import Role, { RoleEnum } from "../../models/Role.model";
import { AuthenticatedRequest } from "../../utils/Interface";
import TeamMemberProfileService from "../../services/Entity/Profiles/TeamMemberProfile.service";

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

        const entity = await EntityService.addEntity({
            id: uuidv4(),
            email,
            status: {
                activated: false,
                emailVerified: false
            },
            partnerProfileId: uuidv4(),
            role: RoleEnum.Partner
        }, transaction)
        const newPartner = await PartnerService.addPartner({
            id: entity.partnerProfileId,
            entityId: entity.id,
            email,
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
            entityId: newPartner.id,
            password
        }, transaction)

        await entity.update({ status: { ...entity.status, emailVerified: true } })
        const accessToken = await AuthUtil.generateToken({ type: 'emailverification', entity: { ...entity.dataValues }, profile: newPartner, expiry: 60 * 10 })
        const otpCode = await AuthUtil.generateCode({ type: 'emailverification', entity: { ...entity.dataValues }, expiry: 60 * 10 })
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

    static async verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { otpCode }: { otpCode: string } = req.body

        const partner = await PartnerService.viewSinglePartner((req as any).user.partner.id)
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        const entity = await partner.$get('entity')
        if (!entity) {
            throw new InternalServerError('Partner entity not found')
        }

        if (entity.status.emailVerified) {
            throw new BadRequestError('Email already verified')
        }

        await entity.update({ status: { ...entity.status, emailVerified: true } })

        const validCode = await AuthUtil.compareCode({ entity, tokenType: 'emailverification', token: otpCode })
        if (!validCode) {
            throw new BadRequestError('Invalid otp code')
        }

        await AuthUtil.deleteToken({ entity, tokenType: 'emailverification', tokenClass: 'token' })

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

        const entity = await newPartner.$get('entity')
        if (!entity) {
            throw new InternalServerError('Partner entity not found')
        }

        if (entity.status.emailVerified) {
            throw new BadRequestError('Email already verified')
        }

        const otpCode = await AuthUtil.generateCode({ type: 'emailverification', entity: { ...entity.dataValues}, expiry: 60 * 10 })

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

        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity) {
            throw new BadRequestError('No account exist for this email')
        }

        const profile = await EntityService.getAssociatedProfile(entity)
        if (!profile) {
            throw new InternalServerError('Partner profile not found')
        }

        const accessToken = await AuthUtil.generateToken({ type: 'passwordreset', entity: { ...entity.dataValues}, profile, expiry: 60 * 10 })
        const otpCode = await AuthUtil.generateCode({ type: 'passwordreset', entity: { ...entity.dataValues }, expiry: 60 * 10 })
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

    static async resetPassword(req: AuthenticatedRequest, res: Response) {
        const { entity: { id } } = req.user.user

        const { otpCode, newPassword }: { otpCode: string, newPassword: string } = req.body

        const validPassword = Validator.validatePassword(newPassword)
        if (!validPassword) {
            throw new BadRequestError('Invalid password')
        }

        const entity = await EntityService.viewSingleEntity(id)
        if (!entity) {
            throw new InternalServerError('Partner entity not found')
        }

        const validCode = await AuthUtil.compareCode({ entity, tokenType: 'passwordreset', token: otpCode })
        if (!validCode) {
            throw new BadRequestError('Invalid otp code')
        }

        const password = await entity.$get('password')
        if (!password) {
            throw new InternalServerError('No password found for authneticate partner')
        }

        await PasswordService.updatePassword(entity.id, newPassword)
        await AuthUtil.deleteToken({ entity, tokenType: 'passwordreset', tokenClass: 'token' })

        await EmailService.sendEmail({
            to: entity.email,
            subject: 'Succesful Email Verification',
            html: await new EmailTemplate().awaitActivation(entity.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully',
            data: null
        })
    }

    static async changePassword(req: AuthenticatedRequest, res: Response) {
        const { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body

        const validPassword = Validator.validatePassword(newPassword)
        if (!validPassword) {
            throw new BadRequestError('Invalid password')
        }

        const { entity: { id } } = req.user.user
        const entity = await EntityService.viewSingleEntity(id)
        if (!entity) {
            throw new InternalServerError('Entity not found')
        }

        const profile = await EntityService.getAssociatedProfile(entity)
        if (!profile) {
            throw new InternalServerError('Profile not found')
        }

        const password = await entity.$get('password')
        if (!password) {
            throw new InternalServerError('No password found for authneticate entity')
        }

        const validOldPassword = await PasswordService.comparePassword(oldPassword, password.password)
        if (!validOldPassword) {
            throw new BadRequestError('Invalid old password')
        }

        await PasswordService.updatePassword(entity.id, newPassword)

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
            data: null
        })
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body

        const partner = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Invalid Email or password')
        }

        const entity = await partner.$get('entity')
        if (!entity) {
            throw new InternalServerError('Entity not found')
        }

        const entityPassword = await entity.$get('password')
        if (!entityPassword) {
            throw new InternalServerError('No password found for authneticate entity')
        }

        const validPassword = await PasswordService.comparePassword(password, entityPassword.password)
        if (!validPassword) {
            throw new BadRequestError('Invalid Email or password')
        }

        if (!entity.status.activated) {
            throw new BadRequestError('Account not activated')
        }

        const profile = await EntityService.getAssociatedProfile(entity)
        if (!profile) {
            throw new InternalServerError('Profile not found')
        }

        const accessToken = await AuthUtil.generateToken({ type: 'access', entity, profile, expiry: 60 * 60 * 60 * 60 })
        const refreshToken = await AuthUtil.generateToken({ type: 'refresh', entity, profile, expiry: 60 * 60 * 24 * 30 })

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

    static async logout(req: AuthenticatedRequest, res: Response) {
        const { entity: { id } } = req.user.user
        const entity = await EntityService.viewSingleEntity(id)

        if (!entity) {
            throw new InternalServerError('Entity not found')
        }

        await AuthUtil.deleteToken({ entity, tokenType: 'access', tokenClass: 'token' })
        await AuthUtil.deleteToken({ entity, tokenType: 'refresh', tokenClass: 'token' })

        res.status(200).json({
            status: 'success',
            message: 'Logout successful',
            data: null
        })
    }

    static async getLoggedUserData(req: Request, res: Response) {
        const partner = await PartnerService.viewSinglePartner((req as any).user.partner.id)
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Partner data retrieved successfully',
            data: {
                partner: ResponseTrimmer.trimPartner(partner),
            }
        })
    }
}