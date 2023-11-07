// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey, HasMany } from "sequelize-typescript";
import User from "./User.model";
import PowerUnit from "./PowerUnit.model";

// Define the Sequelize model for the "Meter" table
@Table
export default class Meter extends Model<Meter | IMeter> {
    // Unique identifier for the meter
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // address associated with the meter
    @Column({ type: DataType.STRING, allowNull: false })
    address: string;

    // Meter number for identification
    @Column({ type: DataType.STRING, allowNull: false })
    meterNumber: string;

    // Meter number for identification
    @Column({ type: DataType.STRING, allowNull: false })
    disco: string;

    // Foreign key for the associated User
    @ForeignKey(() => User)
    @IsUUID(4)
    @Column
    userId: string;

    // Belongs to a User
    @BelongsTo(() => User)
    user: User;

    // Has many associated PowerUnits
    @HasMany(() => PowerUnit)
    powerUnits: PowerUnit[];
}

// Interface to represent a Meter object with specific properties
export interface IMeter {
    id: string;          // Unique identifier for the meter
    address: string;     // address associated with the meter
    meterNumber: string; // Meter number for identification
    userId: string;      // Identifier of the associated user
    disco: string;      // Disco name for meter 
}

// Interface to represent the structure of data for creating a new Meter
export interface ICreateMeter extends IMeter {
    // (You can add specific properties here if needed when creating a new meter)
}

// Interface to represent the structure of data for updating an existing Meter
export interface IUpdateMeter {
    // (You can add specific properties here if needed when updating an existing meter)
}