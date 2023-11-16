import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, InternalServerError } from "../../utils/Errors";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer'
import Partner, { IPartner } from "../../models/Entity/Profiles/PartnerProfile.model";
import PartnerService from "../../services/Partner.service";
import { Database } from "../../models/index";
import PasswordService from "../../services/Password.service";
import { AuthUtil, TokenUtil } from "../../utils/Auth/token";
import Validator from "../../utils/Validators";
import logger from "../../utils/Logger";
import ApiKeyService from "../../services/ApiKey.service ";
import Cypher from "../../utils/Cypher";

export default class ApiController {
    static async getActiveAPIKey(req: Request, res: Response, next: NextFunction) {
        const { partner }: { partner: IPartner } = (req as any).user

        const partner_ = await PartnerService.viewSinglePartnerByEmail(partner.email)
        if (!partner_) {
            throw new InternalServerError('Authenticated partner not found')
        }

        const apiKey = await ApiKeyService.viewActiveApiKeyByPartnerId(partner.id)
        if (!apiKey) {
            throw new BadRequestError('API Key not found')
        }

        const secKeyInCache = Cypher.encryptString(partner_.sec)
        await TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher.encryptString(partner_.key) })

        res.status(200).json({
            status: 'success',
            message: 'API Keys retrieved successfully',
            data: {
                apiKey: apiKey.key,
                secretKey: secKeyInCache
            }
        })
    }

    static async generateApiKeys(req: Request, res: Response, next: NextFunction) {
        const { email } = (req as any).user.partner

        const partner: Partner | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        const { key, sec } = await PartnerService.generateKeys(partner)

        const secKeyInCache = Cypher.encryptString(sec)
        await TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher.encryptString(key) })
        await ApiKeyService.setCurrentActiveApiKeyInCache(partner, key)

        res.status(200).json({
            status: 'success',
            message: 'Generated API keys successfully',
            data: {
                apiKey: key,
                secretKey: secKeyInCache
            }
        })
    }
}
