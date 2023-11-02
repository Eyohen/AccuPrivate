// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey } from "sequelize-typescript";
import Transaction  from "./Transaction.model";

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
    Event_timestamp: Date;

    // Status of the event (complete, pending, or failed)
    @Column({ type: DataType.ENUM, values: Object.values(Status), defaultValue: Status.PENDING, allowNull: false })
    Status: Status;

    // Type of the event
    @Column({ type: DataType.STRING, allowNull: false })
    Event_type: string;

    // Text for the event 
    @Column({ type: DataType.STRING, allowNull: false })
    Event_text: string;

    // Source of the event
    @Column({ type: DataType.STRING, allowNull: false })
    Source: string;

    // Data associated with the event (can be a string or JSON)
    @Column({ type: DataType.STRING || DataType.JSON, allowNull: false })
    Event_data: string | JSON;

    // Foreign key for the associated Transaction
    @ForeignKey(() => Transaction)
    @IsUUID(4)
    @Column
    TransactionId: string;

    // Belongs to a Transaction
    @BelongsTo(() => Transaction)
    Transaction: Transaction;
}

// Define an interface representing an event (IEvent) with various properties.
export interface IEvent {
    id: string; // Unique identifier for the event
    Event_timestamp: Date; // Timestamp of the event
    Status: Status; // Status of the event (enum)
    Event_type: string; // Type of the event
    Event_text: string; // Text associated with the event
    Source: string; // Source of the event
    Event_data: string | JSON; // Data associated with the event (can be a string or JSON)
    TransactionId: string; // Identifier for the associated transaction
}

// Define an interface (ICreateEvent) that extends IEvent, typically used for creating new events.
export interface ICreateEvent extends IEvent {
    // This interface inherits all properties from IEvent and does not add any new ones.
}

// Define an interface (IUpdateEvent) for potential updates to an event (intentionally left empty).
export interface IUpdateEvent {
    // This interface is currently empty, but it can be extended with specific properties if needed.
}
