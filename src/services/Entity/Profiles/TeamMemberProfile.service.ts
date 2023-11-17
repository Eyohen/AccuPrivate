import { Model, Transaction } from "sequelize"
import TeamMemberProfile, { ITeamMemberProfile } from "../../../models/Entity/Profiles/TeamMemberProfile.model"
import EntityService from "../Entity.service"
import Entity, { IEntity } from "../../../models/Entity/Entity.model"
import Role, { IRole } from "../../../models/Role.model"

export default class TeamMemberProfileService {
    static async addTeamMemberProfile(teamMember: ITeamMemberProfile, transaction?: Transaction): Promise<TeamMemberProfile> {
        const newTeamMember: TeamMemberProfile = TeamMemberProfile.build(teamMember)
        const result = transaction ? await newTeamMember.save({ transaction }) : await newTeamMember.save()

        return result
    }

    static async viewTeamMembers(): Promise<TeamMemberProfile[] | void> {
        const teamMembers: TeamMemberProfile[] = await TeamMemberProfile.findAll()
        return teamMembers
    }

    static async viewSingleTeamMember(uuid: string): Promise<TeamMemberProfile | null> {
        const teamMember: TeamMemberProfile | null = await TeamMemberProfile.findByPk(uuid)
        return teamMember
    }

    static async viewTeamMemberFullProfile(teamMember: TeamMemberProfile): Promise<Entity & { role: Role }> {
        const entity = await Entity.findOne({ where: { teamMemberProfileId: teamMember.id }, include: [Role] }) as Entity & { role: Role }
        if (!entity) {
            throw new Error('Entity not found')
        }

        return entity
    }

    static async viewSingleTeamMemberByEmail(email: string): Promise<TeamMemberProfile | null> {
        const entity = await EntityService.viewSingleEntityByEmail(email)
        if (!entity || !entity.teamMemberProfileId) {
            return null
        }

        const teamMember: TeamMemberProfile | null = await TeamMemberProfileService.viewSingleTeamMember(entity.teamMemberProfileId)
        return teamMember
    }

    static async viewTeamMembersWithCustomQuery(query: any): Promise<TeamMemberProfile[]> {
        const teamMembers: TeamMemberProfile[] = await TeamMemberProfile.findAll(query)
        return teamMembers
    }
}