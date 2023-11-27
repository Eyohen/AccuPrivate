import { NextFunction, Response } from "express";
import { BadRequestError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import Validator from "../../utils/Validators";
import { AuthenticatedRequest } from "../../utils/Interface";
import EntityService from "../../services/Entity/Entity.service";

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
}