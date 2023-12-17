// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne, BelongsTo, ForeignKey } from "sequelize-typescript";
import Transaction from "../../Transaction.model";
import Password from "../../Password.model";
import ApiKey from "../../ApiKey.model";
import Entity from "../Entity.model";
import Partner from "./PartnerProfile.model";
const newrelic = require('newrelic');

// Define the "TeamMember" table model
@Table
export default class TeamMemberProfile extends Model<TeamMemberProfile | ITeamMemberProfile> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @HasOne(() => Entity)
    entity: Entity;

    @Column({ type: DataType.STRING, allowNull: true })
    name: string;
    
    @ForeignKey(() => Partner)
    @IsUUID(4)
    @Column({ type: DataType.STRING, allowNull: false })
    partnerId: string;

    // Has one to one relationship with Partner
    @BelongsTo(() => Partner)
    partner: Partner;
}

// Interface representing the structure of a TeamMember entity
export interface ITeamMemberProfile {
    id: string;              // Unique identifier for the TeamMember
    partnerId: string;
    name: string
}

// Interface representing the structure for creating a new TeamMember (inherits from ITeamMember)
export interface ICreateTeamMemberProfile extends ITeamMemberProfile {
    // Inherits the properties from ITeamMember for creating a new TeamMember
}

// Interface for updating an existing TeamMember
export interface IUpdateTeamMemberProfile {
    // You can define specific properties here that are updatable for a TeamMember
    // This interface is intentionally left empty for flexibility
}
