// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, HasMany, HasOne, Is, ForeignKey, BelongsTo } from "sequelize-typescript";
import Transaction from "../../Transaction.model";
import Password from "../../Password.model";
import ApiKey from "../../ApiKey.model";
import Entity from "../Entity.model";

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

    @Column({ type: DataType.STRING, allowNull: true })
    profilePicture: string;

    @ForeignKey(() => Entity)
    @IsUUID(4)
    @Column({ type: DataType.STRING, allowNull: false })
    entityId: string;

    @BelongsTo(() => Entity)
    entity: Entity;

    // Establish a "HasMany" association with the "Transaction" model
    @HasMany(() => Transaction)
    transactions: Transaction[];

    @HasMany(() => ApiKey)
    apiKeys: ApiKey[];

    @Column({ type: DataType.STRING, allowNull: false })
    key: string;

    @Column({ type: DataType.STRING, allowNull: false })
    sec: string;
}

// Interface representing the structure of a Partner entity
export interface IPartner {
    id: string;              // Unique identifier for the Partner
    email: string;   // Phone number for contacting the Partner
    key: string;
    sec: string;
    profilePicture?: string;
    entityId: string;
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
