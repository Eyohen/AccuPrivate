import { Transaction } from "sequelize"
import { TeamMemberProfile } from "../../../models/Entity/Profiles"
import { ITeamMemberProfile } from "../../../models/Entity/Profiles/TeamMemberProfile.model"

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

    static async viewTeamMembersWithCustomQuery(query: any): Promise<TeamMemberProfile[]> {
        const teamMembers: TeamMemberProfile[] = await TeamMemberProfile.findAll(query)
        return teamMembers
    }
}