// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne } from "sequelize-typescript";
import Transaction from "../../Transaction.model";
import Password from "../../Password.model";
import ApiKey from "../../ApiKey.model";

// Define the "TeamMember" table model
@Table
export default class TeamMember extends Model<TeamMember | ITeamMember> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Define a column for the TeamMember's email (string type, not nullable)
    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @Column({ type: DataType.STRING, allowNull: true })
    profilePicture: string;

    @Column({ type: DataType.STRING, allowNull: false })
    
}

// Interface representing the structure of a TeamMember entity
export interface ITeamMember {
    id: string;              // Unique identifier for the TeamMember
    email: string;   // Phone number for contacting the TeamMember
    key: string;
    sec: string;
    profilePicture?: string;
}

// Interface representing the structure for creating a new TeamMember (inherits from ITeamMember)
export interface ICreateTeamMember extends ITeamMember {
    // Inherits the properties from ITeamMember for creating a new TeamMember
}

// Interface for updating an existing TeamMember
export interface IUpdateTeamMember {
    // You can define specific properties here that are updatable for a TeamMember
    // This interface is intentionally left empty for flexibility
}
