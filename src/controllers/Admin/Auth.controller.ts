import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer'
import Partner from "../../models/Entity/Profiles/PartnerProfile.model";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import { Database } from "../../models/index";
import PasswordService from "../../services/Password.service";
import { AuthUtil } from "../../utils/Auth/token";
import Validator from "../../utils/Validators";
import logger from "../../utils/Logger";

export default class AuthController {
    static async activatePartner(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const partner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        await partner.update({ status: { ...partner.status, activated: true } })

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

    static async deactivatePartner(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body

        const validEmail = Validator.validateEmail(email)
        if (!validEmail) {
            throw new BadRequestError('Invalid email')
        }

        const partner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        await partner.update({ status: { ...partner.status, activated: false } })

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