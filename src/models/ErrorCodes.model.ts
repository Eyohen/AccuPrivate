// Import necessary modules and dependencies
import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey, HasMany, BelongsToMany, BeforeConnect, BeforeCreate, BeforeValidate, AllowNull } from "sequelize-typescript";
import User from "./User.model";
import PowerUnit from "./PowerUnit.model";
import Transaction from "./Transaction.model";
import Product from "./Product.model";
import VendorProduct from "./VendorProduct.model";
import Vendor from "./Vendor.model";

// Define the Sequelize model for the "ErrorCode" table
@Table
export default class ErrorCode extends Model<ErrorCode | IErrorCode> {
    // Unique identifier for the meter
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    httpCode: number

    @Column({ type: DataType.STRING, allowNull: true })
    vend_code: string

    @Column({ type: DataType.STRING, allowNull: true })
    category: string

    @Column({ type: DataType.STRING, allowNull: true })
    response_code: string

    @Column({ type: DataType.STRING, allowNull: true })
    message: string

    @Column({ type: DataType.STRING, allowNull: true })
    description: string

    @Column({ type: DataType.STRING, allowNull: true })
    accuvendDescription: string

    @Column({ type: DataType.INTEGER, allowNull: true })
    accuvendMasterResponseCode?: Number

    @Column({ type: DataType.STRING, allowNull: true })
    request: string

    @Column({ type: DataType.STRING, allowNull: true })
    vendor: string
}

// Interface to represent a ErrorCode object with specific properties
export interface IErrorCode {
    id: string
    httpCode?: number
    vend_code?: string
    response_code?: string
    message?: string
    description?: string
    accuvendDescription?: string
    accuvendMasterResponseCode?: number
    category?: string
    request?: string
    vendor?: string
}

// Interface to represent thep structure of data for creating a new ErrorCode
export interface ICreateErrorCode extends IErrorCode {
    // (You can add specific properties here if needed when creating a new meter)
}

// Interface to represent the structure of data for updating an existing ErrorCode
export interface IUpdateErrorCode {
    // (You can add specific properties here if needed when updating an existing meter)
}