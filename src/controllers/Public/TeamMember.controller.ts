import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from "../../utils/Errors";
import { RoleEnum } from "../../models/Role.model";
import { Database } from "../../models";
import TeamMemberProfileService from "../../services/Entity/Profiles/TeamMemberProfile.service";
import EntityService from "../../services/Entity/Entity.service";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import Entity from "../../models/Entity/Entity.model";
import { AuthenticatedRequest } from "../../utils/Interface";

export default class TeamMemberProfileController {
    static async inviteTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        // The partner is the entity that is inviting the team member
        const { entity: { id } } = req.user.user
        const { email } = req.body

        const transaction = await Database.transaction()
        const entity = await EntityService.addEntity({
            id: uuidv4(),
            teamMemberProfileId: uuidv4(),
            email: email,
            status: {
                activated: false,
                emailVerified: false
            },
            role: RoleEnum.TeamMember
        }, transaction)

        const teamMemberProfile = await TeamMemberProfileService.addTeamMemberProfile({
            id: entity.teamMemberProfileId,
            partnerId: entity.id,
            entityId: entity.id
        }, transaction)

        // Commit transaction
        await transaction.commit()

        // Generate token for team member

        res.status(200).json({
            status: 'success',
            message: 'Team member invited successfully',
            data: {
                teamMember: teamMemberProfile
            }
        })
    }

    static async getTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id } } = req.user.user

        const entity = await EntityService.viewSingleEntity(id)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const partner = await PartnerService.viewSinglePartner(entity.id)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        const teamMembers = await TeamMemberProfileService.viewTeamMembersWithCustomQuery({
            where: { partnerId: partner.id },
            include: [{ model: Entity, as: 'entity' }]
        })

        res.status(200).json({
            status: 'success',
            message: 'Team members fetched successfully',
            data: {
                teamMembers: teamMembers
            }
        })
    }
}