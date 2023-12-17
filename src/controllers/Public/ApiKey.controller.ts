import { NextFunction, Request, Response } from "express";
import { BadRequestError, ForbiddenError, InternalServerError } from "../../utils/Errors";
import Partner, { IPartnerProfile } from "../../models/Entity/Profiles/PartnerProfile.model";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import { TokenUtil } from "../../utils/Auth/Token";
import ApiKeyService from "../../services/ApiKey.service ";
import Cypher from "../../utils/Cypher";
import { AuthenticatedRequest } from "../../utils/Interface";

export default class ApiController {
    static async getActiveAPIKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity, profile } = req.user.user

        if (entity.role !== 'PARTNER') {
            throw new ForbiddenError('Only partners can access this resource')
        }

        const partner_ = await PartnerService.viewSinglePartnerByEmail(entity.email)
        if (!partner_) {
            throw new InternalServerError('Authenticated partner not found')
        }

        const apiKey = await ApiKeyService.viewActiveApiKeyByPartnerId(profile.id)
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

    static async generateApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { email } = req.user.user.entity

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
