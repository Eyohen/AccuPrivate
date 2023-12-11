import { Request as ExpressApiRequest, NextFunction, Response } from "express"
import { PartnerProfile } from "../../models/Entity/Profiles";
import { PartnerProfileService } from "../../services/Entity/Profiles";
import { InternalServerError } from "../../utils/Errors";
import { AuthenticatedRequest, AuthenticatedAsyncController } from "../../utils/Interface";
import { IPartnerProfile } from "../../models/Entity/Profiles/PartnerProfile.model";

export default class PartnerController {
    static async getSinglePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { partnerId } = req.query as any
        const partner: IPartnerProfile | null = await PartnerProfileService.viewSinglePartner(partnerId);
        if (!partner) {
            throw new InternalServerError("Partner Not found")
        }

        delete partner?.key
        delete partner?.sec
        res.status(200).json({
            status: 'success',
            message: 'Partners data retrieved successfully',
            data: {
                partner
            }
        })
    }

    static async getAllPartners(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const {
            page, limit,
        } = req.query as any
        const query = { where: {} } as any
        if (limit) query.limit = parseInt(limit)
        else query.limit = 10
        if (page && page != '0' && limit) {
            query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit)
        } else {
            query.offset = 0
        }
        const _partners: IPartnerProfile[] | void = await PartnerProfileService.viewPartnersWithCustomQuery(query);
        if (!_partners) {
            throw new InternalServerError("Partners Not found")
        }
        const partners: IPartnerProfile[] = _partners.map(item => {
            delete item.key
            delete item.sec
            return item
        })

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount: partners.length,
            totalPages: Math.ceil(partners.length / parseInt(limit))
        }

        const response = {
            partners
        } as any

        if (page && page != '0' && limit) {
            response['paginationData'] = pagination
        }

        res.status(200).json({
            status: 'success',
            message: 'Partners data retrieved successfully',
            data: response
        })


    }
}