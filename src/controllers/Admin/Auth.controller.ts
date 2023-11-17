import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import Partner from "../../models/Entity/Profiles/PartnerProfile.model";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import Validator from "../../utils/Validators";
import { AuthenticatedRequest } from "../../utils/Interface";

export default class AuthController {
    static async activatePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const partner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        const entity = await partner.$get('entity')
        if (!entity) {
            throw new InternalServerError('Partner entity not found')
        }

        await entity.update({ status: { ...entity.status, activated: true } })

        await EmailService.sendEmail({
            to: partner.email,
            subject: 'Account Activation',
            html: await new EmailTemplate().accountActivation(partner.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Activated partner successfully',
            data: null
        })
    }

    static async deactivatePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const partner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        const entity = await partner.$get('entity')
        if (!entity) {
            throw new InternalServerError('Partner entity not found')
        }

        await entity.update({ status: { ...entity.status, activated: true } })


        await EmailService.sendEmail({
            to: partner.email,
            subject: 'Account Activation',
            html: await new EmailTemplate().accountActivation(partner.email)
        })

        res.status(200).json({
            status: 'success',
            message: 'Deactivated partner successfully',
            data: null
        })
    }
}