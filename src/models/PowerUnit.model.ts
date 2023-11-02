// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, ForeignKey, BelongsTo } from "sequelize-typescript";
import  Meter  from "./Meter.model";
import  Transaction  from "./Transaction.model";

// Define the Sequelize model for the "PowerUnit" table
@Table
export default class PowerUnit extends Model<PowerUnit | IPowerUnit> {
    // Unique identifier for the power unit
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Address of the power unit
    @Column({ type: DataType.STRING, allowNull: false })
    Address: string;

    // Disco associated with the power unit
    @Column({ type: DataType.STRING, allowNull: false })
    Disco: string;

    // Superagent associated with the power unit
    @Column({ type: DataType.STRING, allowNull: false })
    Superagent: string;

    // Amount associated with the power unit (with a default value)
    @Column({ type: DataType.STRING, allowNull: false, defaultValue: '0' })
    Amount: string;

    // Token number associated with the power unit (with a default value)
    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    Token_number: number

    // Token units associated with the power unit (with a default value)
    @Column({ type: DataType.STRING, allowNull: false, defaultValue: '0' })
    Token_units: string

    // Foreign key for the associated Meter
    @ForeignKey(() => Meter)
    @IsUUID(4)
    @Column
    MeterId: string;

    // Belongs to a Meter
    @BelongsTo(() => Meter)
    Meter: Meter;

    // Foreign key for the associated Transaction
    @ForeignKey(() => Transaction)
    @IsUUID(4)
    @Column
    TransactionId: string;

    // Belongs to a Transaction
    @BelongsTo(() => Transaction)
    Transaction: Transaction;
}


// Define an interface for a PowerUnit, representing the shape of a PowerUnit object.
export interface IPowerUnit  {
    id: string;               // Unique identifier for the PowerUnit.
    Address: string;         // Address associated with the PowerUnit.
    Disco: string;           // Disco (Distribution Company) associated with the PowerUnit.
    Superagent: string;      // Superagent associated with the PowerUnit.
    Amount: string;          // Amount related to the PowerUnit.
    Token_number: number;    // Token number associated with the PowerUnit.
    Token_units: string;    // Token units associated with the PowerUnit.
    MeterId: string;         // Unique identifier of the Meter associated with the PowerUnit.
    TransactionId: string;  // Unique identifier of the Transaction associated with the PowerUnit.
}

// Define an interface that extends the IPowerUnit interface, representing the shape of a new PowerUnit to be created.
export interface ICreatePowerUnit extends IPowerUnit {
    // This interface includes all the properties of IPowerUnit, as it represents a new PowerUnit to be created.
}

// Define an interface for updating a PowerUnit, allowing only specific properties to be modified.
export interface IUpdatePowerUnit {
    // This interface is currently empty, indicating that it doesn't add any new properties for updating a PowerUnit.
}
