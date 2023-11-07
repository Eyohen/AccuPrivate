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
    paymentType: PaymentType;

    // Timestamp of the transaction
    @Column({ type: DataType.DATE, allowNull: false })
    transactionTimestamp: Date;

    // Disco associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    disco: string;

    // Bank Transaction Reference ID associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    bankRefID?: string;

    // Bank Comment Reference ID associated with the transaction
    @Column({ type: DataType.STRING, allowNull: true })
    bankComment?: string;

    // Superagent associated with the transaction
    @Column({ type: DataType.STRING, allowNull: false })
    superagent: string;

    // Foreign key for the associated User
    @ForeignKey(() => User)
    @IsUUID(4)
    @Column
    userId?: string;

    // Belongs to a User
    @BelongsTo(() => User)
    user: User;

    // Foreign key for the associated Partner
    @ForeignKey(() => Partner)
    @IsUUID(4)
    @Column
    partnerId?: string;

    // Belongs to a Partner
    @BelongsTo(() => Partner)
    partner: Partner;

    // Has many associated events
    @HasMany(() => Event)
    events: Event[];

    // Has one associated PowerUnit
    @HasOne(() => PowerUnit)
    powerUnit: PowerUnit;
}


// Define an interface representing a transaction (ITransaction) with various properties.
export interface ITransaction  {
    id: string; // Unique identifier for the transaction
    amount: string; // Amount associated with the transaction
    status: Status; // Status of the transaction (e.g., COMPLETE, PENDING, FAILED)
    paymentType: PaymentType; // Type of payment (e.g., REVERSAL, PAYMENT)
    transactionTimestamp: Date; // Timestamp of the transaction
    disco: string; // Disco associated with the transaction
    bankRefID?: string; // Bank reference ID related to the transaction
    bankComment?: string; // Comments or notes from the bank regarding the transaction
    superagent: string; // Superagent associated with the transaction
    userId?: string; // Unique identifier of the user associated with the transaction
    partnerId?: string; // Unique identifier of the Partner associated with the transaction
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
