import { NextFunction, Response , Request } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, NotFoundError } from "../../utils/Errors";
import { RoleEnum } from "../../models/Role.model";
import { Database } from "../../models";
import EntityService from "../../services/Entity/Entity.service";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import PasswordService from "../../services/Password.service";
import EmailService, { EmailTemplate } from "../../utils/Email";
import RoleService from "../../services/Role.service";
import Cypher from "../../utils/Cypher";
import { TokenUtil } from "../../utils/Auth/Token";
import ApiKeyService from "../../services/ApiKey.service ";
import { PartnerProfile } from "../../models/Entity/Profiles";
import ResponseTrimmer from "../../utils/ResponseTrimmer";
import { IPartnerProfile } from "../../models/Entity/Profiles/PartnerProfile.model";

export default class TeamMemberProfileController {
    static async invitePartner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        // The partner is the entity that is inviting the team member
        const { email } = req.body

        const role = await RoleService.viewRoleByName(RoleEnum.Partner)
        if (!role) {
            throw new BadRequestError('Role not found')
        }

        const existingPartner: PartnerProfile | null = await PartnerService.viewSinglePartnerByEmail(email)
        if (existingPartner) {
            throw new BadRequestError('Email has been used before')
        }

        const transaction = await Database.transaction()

        const newPartner = await PartnerService.addPartner({
            id: uuidv4(),
            email,
        }, transaction)

        const entity = await EntityService.addEntity({
            id: uuidv4(),
            email,
            status: {
                activated: false,
                emailVerified: false
            },
            partnerProfileId: newPartner.id,
            role: RoleEnum.Partner,
            notificationSettings: {
                login: true,
                failedTransactions: true,
                logout: true
            }
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

        const password = uuidv4()
        const partnerPassword = await PasswordService.addPassword({
            id: uuidv4(),
            entityId: entity.id,
            password,
        }, transaction)

        await entity.update({ status: { ...entity.status, emailVerified: true } })

        await EmailService.sendEmail({
            to: newPartner.email,
            subject: 'Partner invitation',
            html: await new EmailTemplate().invitePartner({ email: newPartner.email, password })
        })

        res.status(200).json({
            status: 'success',
            message: 'Partner invited successfully',
            data: {
                partner: ResponseTrimmer.trimPartner({ ...newPartner.dataValues, entity }),
            }
        })
    }

    static async getPartnerInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id } } = req.user.user
        const { email } = req.query as Record<string, string>

        const partnerProfile = await PartnerService.viewSinglePartnerByEmail(email)
        if (!partnerProfile) {
            throw new BadRequestError('Team member not found')
        }

        const entity = await partnerProfile.$get('entity')
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Partner fetched successfully',
            data: {
                partner: { ...partnerProfile.dataValues, entity: entity.dataValues }
            }
        })
    }

    static async getAllPartners(req: AuthenticatedRequest, res: Response, next: NextFunction){
        const {
            page, limit,
        } = req.query as any
        const query = { where: {} } as any
        if (limit) query.limit = parseInt(limit)
        // else query.limit = 10
        if (page && page != '0' && limit) {
            query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit)
        }
        // else query.offset = 0
        
        const _partners : IPartnerProfile [] | void = await PartnerService.viewPartnersWithCustomQuery(query , {
            exclude : ['key', 'sec']
        });
        if(!_partners){
            throw new NotFoundError("Partners Not found")
        }
        const partners: IPartnerProfile [] = _partners.map(item => {
            delete item.key
            delete item.sec
            console.log(item)
            return item
        })
        console.log(partners[0].key , 'Yes')
        res.status(200).json({
            status: 'success',
            message: 'Partners data retrieved successfully',
            data: {
                partners
            }
        })


    }
}