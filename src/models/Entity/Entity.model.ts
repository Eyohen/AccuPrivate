// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne, ForeignKey, BelongsTo } from "sequelize-typescript";
import Transaction from "../Transaction.model";
import Password from "../Password.model";
import Role from "./Role.model";

// Define the "Entity" table model
@Table
export default class Entity extends Model<Entity | IEntity> {
    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Define a column for the Entity's email (string type, not nullable)
    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @HasOne(() => Password)
    password: Password;

    @Column({ type: DataType.JSONB, allowNull: false })
    status: {
        activated: boolean;
        emailVerified: boolean;
    }

    //  Many to one relationship with Role model
    @ForeignKey(() => Role)
    @IsUUID(4)
    @Column({ type: DataType.STRING })
    roleId: string;

    @BelongsTo(() => Role)
    role: Role;
}

// Interface representing the structure of a Entity entity
export interface IEntity {
    id: string;              // Unique identifier for the Entity
    email: string;   // Phone number for contacting the Entity
    status: {
        activated: boolean;
        emailVerified: boolean;
    };
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
