// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey, HasMany } from "sequelize-typescript";
import Transaction  from "./Transaction.model";
import Notification from "./Notification.model";

// Define an enum for the status of events
export enum Status {
    COMPLETE = 'COMPLETE',
    PENDING = 'PENDING',
    FAILED = 'FAILED'
}

// Define the Sequelize model for the "Event" table
@Table
export default class Event extends Model<Event | IEvent> {
    // Unique identifier for the event
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Timestamp of the event
    @Column({ type: DataType.DATE, allowNull: false })
    eventTimestamp: Date;

    // Status of the event (complete, pending, or failed)
    @Column({ type: DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false })
    status: Status;

    // Type of the event
    @Column({ type: DataType.STRING, allowNull: false })
    eventType: string;

    // Text for the event 
    @Column({ type: DataType.STRING, allowNull: false })
    eventText: string;

    // Source of the event
    @Column({ type: DataType.STRING, allowNull: false })
    source: string;

    // Data associated with the event (can be a string or JSON)
    @Column({ type: DataType.STRING || DataType.JSON, allowNull: false })
    eventData: string | JSON;

    // Foreign key for the associated Transaction
    @ForeignKey(() => Transaction)
    @IsUUID(4)
    @Column
    transactionId: string;

    // Belongs to a Transaction
    @BelongsTo(() => Transaction)
    transaction: Transaction;

    @HasMany(() => Notification)
    notifications: Notification[];
}

// Define an interface representing an event (IEvent) with various properties.
export interface IEvent {
    id: string; // Unique identifier for the event
    eventTimestamp: Date; // Timestamp of the event
    status: Status; // Status of the event (enum)
    eventType: string; // Type of the event
    eventText: string; // Text associated with the event
    source: string; // Source of the event
    eventData: string | JSON; // Data associated with the event (can be a string or JSON)
    transactionId: string; // Identifier for the associated transaction
}

// Define an interface (ICreateEvent) that extends IEvent, typically used for creating new events.
export interface ICreateEvent extends IEvent {
    // This interface inherits all properties from IEvent and does not add any new ones.
}

// Define an interface (IUpdateEvent) for potential updates to an event (intentionally left empty).
export interface IUpdateEvent {
    // This interface is currently empty, but it can be extended with specific properties if needed.
}
