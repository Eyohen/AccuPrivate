// Import necessary modules and dependencies
import { Table, Column, Model, DataType, BelongsTo, ForeignKey, IsUUID, PrimaryKey } from "sequelize-typescript";
import ProductCode from "./ProductCode.model";

// Define the Sequelize model for the "VendorRates" table
@Table
export default class VendorRates extends Model<IVendorRates | VendorRates> {
    // Unique identifier for the vendor rates
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    // Vendor name (e.g., Baxi, BuyPower, iRecharge)
    @Column({ type: DataType.STRING, allowNull: false })
    vendorName: string;

    // Disco code associated with the vendor
    @Column({ type: DataType.STRING, allowNull: false })
    discoCode: string;

    // Commission rate for the vendor
    @Column({ type: DataType.FLOAT, allowNull: false })
    commission: number;

    // Foreign key for the associated ProductCode
    @ForeignKey(() => ProductCode)
    @IsUUID(4)
    @Column
    productCodeId: string;

    // Belongs to a ProductCode
    @BelongsTo(() => ProductCode)
    productCode: ProductCode;
}

// Define an interface representing vendor rates (IVendorRates) with various properties.
export interface IVendorRates {
    id: string; // Unique identifier for the vendor rates
    vendorName: string; // Vendor name (e.g., Baxi, BuyPower, iRecharge)
    discoCode: string; // Disco code associated with the vendor
    commission: number; // Commission rate for the vendor
    productCodeId: string; // Unique identifier of the associated ProductCode
}
