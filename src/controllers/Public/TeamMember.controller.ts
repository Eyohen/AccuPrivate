import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from "../../utils/Errors";
import Role, { RoleEnum } from "../../models/Role.model";
import { Database } from "../../models";
import TeamMemberProfileService from "../../services/Entity/Profiles/TeamMemberProfile.service";
import EntityService from "../../services/Entity/Entity.service";
import PartnerService from "../../services/Entity/Profiles/PartnerProfile.service";
import Entity from "../../models/Entity/Entity.model";
import { AuthenticatedRequest } from "../../utils/Interface";
import PasswordService from "../../services/Password.service";
import EmailService, { EmailTemplate } from "../../utils/Email";
import RoleService from "../../services/Role.service";
import { PRIMARY_ROLES } from "../../utils/Constants";

export default class TeamMemberProfileController {
    static async inviteTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        // The partner is the entity that is inviting the team member
        const { entity: { id }, profile } = req.user.user
        const { email, name, roleId } = req.body

        const role = await RoleService.viewRoleById(roleId)
        if (!role) {
            throw new BadRequestError('Role not found')
        }

        if (PRIMARY_ROLES.includes(role.name)) {
            throw new BadRequestError('Invalid role')
        }

        const transaction = await Database.transaction()
        const teamMemberProfile = await TeamMemberProfileService.addTeamMemberProfile({
            id: uuidv4(),
            partnerId: profile.id,
            name
        }, transaction)

        const entity = await EntityService.addEntity({
            id: uuidv4(),
            email: email,
            status: {
                activated: true,
                emailVerified: false
            },
            role: role.name,
            teamMemberProfileId: teamMemberProfile.id,
            notificationSettings: {
                login: false,
                logout: false,
                failedTransactions: false
            }
        }, transaction)

        const entityPasswrod = await PasswordService.addPassword({
            id: uuidv4(),
            password: uuidv4(),
            entityId: entity.id
        }, transaction)

        EmailService.sendEmail({
            to: email,
            subject: 'Team Invitation',
            html: await new EmailTemplate().inviteTeamMember(email)
        })

        // Commit transaction
        await transaction.commit()

        // Generate token for team member
        res.status(200).json({
            status: 'success',
            message: 'Team member invited successfully',
            data: {
                teamMember: { ...teamMemberProfile.dataValues, entity: entity.dataValues },
            }
        })
    }

    static async getTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id }, profile } = req.user.user

        const entity = await EntityService.viewSingleEntity(id)
        if (!entity) {
            throw new BadRequestError('Entity not found')
        }

        const partner = await PartnerService.viewSinglePartner(profile.id)
        if (!partner) {
            throw new BadRequestError('Partner not found')
        }

        const teamMembers = await TeamMemberProfileService.viewTeamMembersWithCustomQuery({
            where: { partnerId: partner.id },
            include: [{ model: Entity, as: 'entity', include: [{ model: Role, as: 'role' }] }]
        })

        res.status(200).json({
            status: 'success',
            message: 'Team members fetched successfully',
            data: {
                teamMembers: teamMembers
            }
        })
    }

    static async getTeamMemberInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id } } = req.user.user
        const { email } = req.query as Record<string, string>

        const teamMemberProfile = await TeamMemberProfileService.viewSingleTeamMemberByEmail(email)
        if (!teamMemberProfile) {
            throw new BadRequestError('Team member not found')
        }

        const fullProfile = await TeamMemberProfileService.viewTeamMemberFullProfile(teamMemberProfile)
        if (!fullProfile) {
            throw new BadRequestError('Team member not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Team members fetched successfully',
            data: {
                teamMember: { ...teamMemberProfile.dataValues, entity: fullProfile.dataValues }
            }
        })
    }
}