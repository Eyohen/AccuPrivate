// Import necessary modules and dependencies
import { Table, Column, Model, DataType, HasOne, HasMany, IsUUID, PrimaryKey, Unique } from "sequelize-typescript";
import VendorRates from './VendorRates.model';

// Define the Sequelize model for the "ProductCode" table
@Table
export default class ProductCode extends Model<IProductCode | ProductCode> {
    // Unique identifier for the product code
    @IsUUID(4)
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    productCode: string;

    // Location associated with the product code
    @Column({ type: DataType.STRING, allowNull: false })
    location: string;

    @Column({ type: DataType.ENUM('AIRTIME', 'ELECTRICITY', 'DATA', 'CABLE'), allowNull: false })
    type: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE';

    // Type of the product code (POSTPAID or PREPAID)
    @Column({ type: DataType.ENUM('POSTPAID', 'PREPAID'), allowNull: false })
    vendType: 'POSTPAID' | 'PREPAID';

    // Has many associated VendorRates
    @HasMany(() => VendorRates)
    vendorRates: VendorRates[];
}

// Define an interface representing a product code (IProductCode) with various properties.
export interface IProductCode {
    id: string;
    productCode: string; // Unique identifier for the product code
    location: string; // Location associated with the product code
    vendType: 'POSTPAID' | 'PREPAID'; // Type of the product code (POSTPAID or PREPAID)
    type: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE';
}
