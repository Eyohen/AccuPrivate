// Import necessary modules and dependencies
import { Table, Column, Model, DataType, HasOne, HasMany, IsUUID, PrimaryKey, Unique, BeforeCreate } from "sequelize-typescript";
import VendorRates from './VendorRates.model';
import VendorProduct from "./VendorProduct.model";

// Define the Sequelize model for the "Product" table
@Table
export default class Product extends Model<IProduct | Product> {
    // Unique identifier for the product code
    @IsUUID(4)
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    masterProductCode: string;

    @Column({ type: DataType.ENUM('AIRTIME', 'ELECTRICITY', 'DATA', 'CABLE'), allowNull: false })
    category: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE';

    @Column({ type: DataType.FLOAT, allowNull: true })
    amount: number;

    // Type of the product code (POSTPAID or PREPAID)
    @Column({ type: DataType.ENUM('POSTPAID', 'PREPAID'), allowNull: false })
    type: 'POSTPAID' | 'PREPAID';

    @HasMany(() => VendorProduct)
    vendorProducts: VendorProduct[];
}

// Define an interface representing a product code (IProduct) with various properties.
export interface IProduct {
    id: string;
    masterProductCode: string; // Unique identifier for the product code
    type: 'POSTPAID' | 'PREPAID'; // Type of the product code (POSTPAID or PREPAID)
    category: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE';
    amount: number | undefined;
}
