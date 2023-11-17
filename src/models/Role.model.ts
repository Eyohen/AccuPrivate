// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne, ForeignKey } from "sequelize-typescript";
import Password from "./Password.model";
import Entity from "./Entity/Entity.model";

// Roles for each entity
// One to one relationship with entity
export enum RoleEnum {
    Admin = 'ADMIN',
    Partner = 'PARTNER',
    TeamMember = 'TEAMMEMBER'
}

@Table
export default class Role extends Model<IRole | Role> {
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column({ type: DataType.ENUM, unique: true, values: Object.values(RoleEnum), allowNull: false })
    name: RoleEnum;

    // One to many with Entity
    @HasMany(() => Entity)
    entities: Entity[];

    @Column({ type: DataType.STRING, allowNull: false })
    description: string;
}

// Interface representing the structure of a Entity entity
export interface IRole {
    id: string;                 // Unique identifier for the Entity
    name: RoleEnum;            // Phone number for contacting the Entity
    description: string;
}

export interface IUpdateRole {
    name: RoleEnum;            // Phone number for contacting the Entity
    description: string;
}