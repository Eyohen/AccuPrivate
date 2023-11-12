// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne } from "sequelize-typescript";
import Transaction from "./Transaction.model";
import Password from "./Password.model";

// Define the "Partner" table model
@Table
export default class Partner extends Model<Partner | IPartner> {

    // Define a primary key field with a UUID (Universally Unique Identifier) as its type
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Define a column for the Partner's email (string type, not nullable)
    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @HasOne(() => Password)
    password: Password;

    @Column({ type: DataType.JSONB, allowNull: false })
    status: {
        activated: boolean;
        emailVerified: boolean;
    }

    // Establish a "HasMany" association with the "Transaction" model
    @HasMany(() => Transaction)
    transactions: Transaction[];
}

// Interface representing the structure of a Partner entity
export interface IPartner {
    id: string;              // Unique identifier for the Partner
    email: string;   // Phone number for contacting the Partner
    status: {
        activated: boolean;
        emailVerified: boolean;
    }
}

// Interface representing the structure for creating a new Partner (inherits from IPartner)
export interface ICreatePartner extends IPartner {
    // Inherits the properties from IPartner for creating a new Partner
}

// Interface for updating an existing Partner
export interface IUpdatePartner {
    // You can define specific properties here that are updatable for a Partner
    // This interface is intentionally left empty for flexibility
}
