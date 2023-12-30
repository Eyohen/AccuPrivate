import { NextFunction, Response, Request } from "express";
import { BadRequestError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import Validator from "../../utils/Validators";
import { AuthenticatedRequest } from "../../utils/Interface";
import EntityService from "../../services/Entity/Entity.service";
import { AuthUtil } from "../../utils/Auth/Token";
import { SU_HOST_EMAIL_1, SU_HOST_EMAIL_2, SU_HOST_EMAIL_3 } from "../../utils/Constants";
import { randomUUID } from "crypto";

class AuthControllerValidator {
    static async activatePartner() {

    }


}

export default class AuthController {
    static async activatePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        await entity.update({ status: { ...entity.status, activated: true } })

        await EmailService.sendEmail({
            to: entity.email,
            subject: 'Account Activation',
            html: await new EmailTemplate().accountActivation(entity.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Activated user successfully',
            data: null
        })
    }

    static async deactivatePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        await entity.update({ status: { ...entity.status, activated: true } })

        await EmailService.sendEmail({
            to: entity.email,
            subject: 'Account Activation',
            html: await new EmailTemplate().accountActivation(entity.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Deactivated user successfully',
            data: null
        })
    }

    static async requestSuperAdminActivation(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const activationCode = await AuthUtil.generateCode({ type: 'su_activation', entity, expiry: 5 * 60 * 60 })
        const [activationCode1, activationCode2, activationCode3] = activationCode.split(':') as ReturnType<typeof randomUUID>[]

        // Send activation code to 3 Admins
        EmailService.sendEmail({
            to: SU_HOST_EMAIL_1,
            html: await (new EmailTemplate().suAccountActivation({
                email: SU_HOST_EMAIL_1,
                authorizationCode: activationCode1,
            })),
            subject: 'Super Admin account activation request'
        })

        EmailService.sendEmail({
            to: SU_HOST_EMAIL_2,
            html: await (new EmailTemplate().suAccountActivation({
                email: SU_HOST_EMAIL_2,
                authorizationCode: activationCode2,
            })),
            subject: 'Super Admin account activation request'
        })

        EmailService.sendEmail({
            to: SU_HOST_EMAIL_3,
            html: await (new EmailTemplate().suAccountActivation({
                email: SU_HOST_EMAIL_3,
                authorizationCode: activationCode3,
            })),
            subject: 'Super Admin account activation request'
        })

        const accessToken = await AuthUtil.generateToken({ type: 'su_activation', entity, profile: entity, expiry: 5 * 60 * 60 })

        res.status(200).json({
            status: 'success',
            message: 'Activation request sent successfully',
            data: {
                accessToken
            }
        })
    }

    static async completeSuperAdminActivationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { authorizationCode1, authorizationCode2, authorizationCode3 } = req.body

        const authorizationCode = `${authorizationCode1}:${authorizationCode2}:${authorizationCode3}`

        const entity = await EntityService.viewSingleEntityByEmail(req.user.user.entity.email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const validCode = await AuthUtil.compareCode({ entity, tokenType: 'su_activation', token: authorizationCode })
        if (!validCode) {
            throw new BadRequestError('Invalid authorization code')
        }

        await entity.update({ status: { ...entity.status, activated: true } })

        await EmailService.sendEmail({
            to: entity.email,
            subject: 'Account Activation',
            html: await new EmailTemplate().accountActivation(entity.email)
        })
    }

    static async completeSuperAdminDeActivationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { authorizationCode1, authorizationCode2, authorizationCode3 } = req.body

        const authorizationCode = `${authorizationCode1}:${authorizationCode2}:${authorizationCode3}`

        const entity = await EntityService.viewSingleEntityByEmail(req.user.user.entity.email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const validCode = await AuthUtil.compareCode({ entity, tokenType: 'su_activation', token: authorizationCode })
        if (!validCode) {
            throw new BadRequestError('Invalid authorization code')
        }

        await entity.update({ status: { ...entity.status, activated: false } })

        await EmailService.sendEmail({
            to: entity.email,
            subject: 'Account Deactivation',
            html: await new EmailTemplate().accountActivation(entity.email)
        })
    }

    static async requestSuperAdminDeActivation(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const deactivationCode = await AuthUtil.generateCode({ type: 'su_activation', entity, expiry: 5 * 60 * 60 })
        const [deactivationCode1, deactivationCode2, deactivationCode3] = deactivationCode.split(':') as ReturnType<typeof randomUUID>[]

        // Send activation code to 3 Admins
        EmailService.sendEmail({
            to: SU_HOST_EMAIL_1,
            html: await (new EmailTemplate().suDeAccountActivation({
                email: SU_HOST_EMAIL_1,
                authorizationCode: deactivationCode1,
            })),
            subject: 'Super Admin account deactivation request'
        })

        EmailService.sendEmail({
            to: SU_HOST_EMAIL_2,
            html: await (new EmailTemplate().suDeAccountActivation({
                email: SU_HOST_EMAIL_2,
                authorizationCode: deactivationCode2,
            })),
            subject: 'Super Admin account deactivation request'
        })

        EmailService.sendEmail({
            to: SU_HOST_EMAIL_3,
            html: await (new EmailTemplate().suDeAccountActivation({
                email: SU_HOST_EMAIL_3,
                authorizationCode: deactivationCode3,
            })),
            subject: 'Super Admin account deactivation request'
        })

        const accessToken = await AuthUtil.generateToken({ type: 'su_activation', entity, profile: entity, expiry: 5 * 60 * 60 })

        res.status(200).json({
            status: 'success',
            message: 'Deactivation request sent successfully',
            data: {
                accessToken
            }
        })
    }
}