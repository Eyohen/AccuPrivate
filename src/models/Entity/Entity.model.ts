// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasOne, ForeignKey, BelongsTo, NotEmpty, IsIn, BeforeValidate, Unique } from "sequelize-typescript";
import Password from "../Password.model";
import Role from "../Role.model";
import PartnerProfile from "./Profiles/PartnerProfile.model";
import TeamMember from "./Profiles/TeamMemberProfile.model";

// Define the "Entity" table model
@Table({ tableName: 'Entities' })
export default class Entity extends Model<Entity | IEntity> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Define a column for the Entity's email (string type, not nullable)
    @Unique
    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @HasOne(() => Password)
    password: Password;

    @Column({ type: DataType.JSONB, allowNull: false })
    status: {
        activated: boolean;
        emailVerified: boolean;
    }

    @Column({ type: DataType.STRING, allowNull: true })
    profilePicture: string;

    //  Many to one relationship with Role model
    @ForeignKey(() => Role)
    @IsUUID(4)
    @Column({ type: DataType.STRING })
    roleId: string;

    @BelongsTo(() => Role)
    role: Role;

    @ForeignKey(() => TeamMember)
    @IsUUID(4)
    // @NotEmpty
    // @IsIn([['teamMemberProfileId', 'partnerProfileId']])
    @Column({ type: DataType.STRING, allowNull: true })
    teamMemberProfileId: string;

    @ForeignKey(() => PartnerProfile)
    @IsUUID(4)
    // @NotEmpty
    // @IsIn([['teamMemberProfileId', 'partnerProfileId']])
    @Column({ type: DataType.STRING, allowNull: true })
    partnerProfileId: string;

    @BelongsTo(() => PartnerProfile)
    partnerProfile: PartnerProfile | null;

    // Relation to team member profile
    @BelongsTo(() => TeamMember)
    teamMemberProfile: TeamMember | null;

    // Relation to partner profile
    @BeforeValidate
    static ensureProfileIdIsSet(instance: Entity) {
        if (!instance.teamMemberProfileId && !instance.partnerProfileId) {
            throw new Error('Either teamMemberProfileId or partnerProfileId must be set.');
        }
    }
}

// Interface representing the structure of a Entity entity
export interface IEntity {
    id: string;              // Unique identifier for the Entity
    email: string;   // Phone number for contacting the Entity
    status: {
        activated: boolean;
        emailVerified: boolean;
    };
    profilePicture?: string;
    roleId: string;
    partnerProfileId?: string;
    teamMemberProfileId?: string;
}

// Interface representing the structure for creating a new Entity (inherits from IEntity)
export interface ICreateEntity extends IEntity {
    // Inherits the properties from IEntity for creating a new Entity
}

// Interface for updating an existing Entity
export interface IUpdateEntity {
    // You can define specific properties here that are updatable for a Entity
    // This interface is intentionally left empty for flexibility
}
