// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, ForeignKey, BelongsTo, HasMany, HasOne } from "sequelize-typescript";
import User  from "./User.model";
import Partner from "./Partner.model";
import Event  from "./Event.model";
import PowerUnit from "./PowerUnit.model";

// Define enums for status and payment type
export enum Status {
    COMPLETE = 'COMPLETE',
    PENDING = 'PENDING',
    FAILED = 'FAILED'
}

export enum PaymentType {
    REVERSAL = 'REVERSAL',
    PAYMENT = 'PAYMENT'
}

// Define the Sequelize model for the "Transaction" table
@Table
export default class Transaction extends Model<ITransaction | Transaction> {
    // Unique identifier for the transaction
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Amount associated with the transaction
    @Column({ type: DataType.STRING, allowNull: false, defaultValue: '0' })
    Amount: string;

    // Status of the transaction (complete, pending, or failed)
    @Column({ type: DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false })
    Status: Status;

    // Type of payment (reversal or payment)
    @Column({ type: DataType.ENUM, values: Object.values(PaymentType), defaultValue: PaymentType.PAYMENT, allowNull: false })
    Payment_type: PaymentType;

    // Timestamp of the transaction
    @Column({ type: DataType.DATE, allowNull: false })
    Transaction_timestamp: Date;

    // Disco associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    Disco: string;

    // Bank Transaction Reference ID associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    BankRefID?: string;

    // Bank Comment Reference ID associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    BankComment?: string;

    // Superagent associated with the transaction
    @Column({ type: DataType.STRING, allowNull: false })
    Superagent: string;

    // Foreign key for the associated User
    @ForeignKey(() => User)
    @IsUUID(4)
    @Column
    UserId?: string;

    // Belongs to a User
    @BelongsTo(() => User)
    User: User;

    // Foreign key for the associated Partner
    @ForeignKey(() => Partner)
    @IsUUID(4)
    @Column
    PartnerId?: string;

    // Belongs to a Partner
    @BelongsTo(() => Partner)
    Partner: Partner;

    // Has many associated events
    @HasMany(() => Event)
    Events: Event[];

    // Has one associated PowerUnit
    @HasOne(() => PowerUnit)
    PowerUnit: PowerUnit;
}


// Define an interface representing a transaction (ITransaction) with various properties.
export interface ITransaction  {
    id: string; // Unique identifier for the transaction
    Amount: string; // Amount associated with the transaction
    Status: Status; // Status of the transaction (e.g., COMPLETE, PENDING, FAILED)
    Payment_type: PaymentType; // Type of payment (e.g., REVERSAL, PAYMENT)
    Transaction_timestamp: Date; // Timestamp of the transaction
    Disco: string; // Disco associated with the transaction
    BankRefID?: string; // Bank reference ID related to the transaction
    BankComment?: string; // Comments or notes from the bank regarding the transaction
    Superagent: string; // Superagent associated with the transaction
    UserId?: string; // Unique identifier of the user associated with the transaction
    PartnerId?: string; // Unique identifier of the Partner associated with the transaction
}

// Define an interface representing the creation of a transaction (ICreateTransaction).
// This extends the ITransaction interface, inheriting its properties.
export interface ICreateTransaction extends ITransaction {
    // Additional properties can be defined if needed for creating a new transaction.
}

// Define an interface representing the update of a transaction (IUpdateTransaction).
// This interface does not include any specific properties, but it can be extended as needed.
export interface IUpdateTransaction {
    // Properties for updating a transaction can be added here.
}
