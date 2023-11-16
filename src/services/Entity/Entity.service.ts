import { Transaction } from "sequelize"
import Entity, { IUpdateEntity } from "../../models/Entity/Entity.model"
import { PartnerProfile, TeamMemberProfile } from "../../models/Entity/Profiles"

export default class TeamMemberProfileService {
    static async addTeamMemberProfile(entityData: Entity, transaction?: Transaction): Promise<Entity> {
        const entity: Entity = Entity.build(entityData)
        const _transaction = transaction ? await entity.save({ transaction }) : await entity.save()

        return _transaction
    }

    static async viewEntity(): Promise<Entity[] | void> {
        const entity: Entity[] = await Entity.findAll()
        return entity
    }

    static async viewSingleEntity(id: string): Promise<Entity | null> {
        const entity: Entity | null = await Entity.findByPk(id)

        if (!entity) {
            throw new Error('Entity not found')
        }

        return entity
    }

    static async updateEntity(entity: Entity, dataToUpdate: IUpdateEntity): Promise<Entity> {
        await entity.update(dataToUpdate)

        const updatedEntity = await Entity.findOne({ where: { id: entity.id } })
        if (!updatedEntity) {
            throw new Error('Entity not found')
        }

        return updatedEntity
    }

    static async viewEntityWithCustomQuery(query: any): Promise<Entity[]> {
        const entity: Entity[] = await Entity.findAll(query)
        return entity
    }

    static async getAssociatedProfile(entity: Entity): Promise<PartnerProfile | TeamMemberProfile | null> {
        const partnerProfile = await entity.$get('partnerProfile')
        const teamMemberProfile = await entity.$get('teamMemberProfile')

        return partnerProfile || teamMemberProfile
    }
}