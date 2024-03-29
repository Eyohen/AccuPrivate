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

    // Type of the product code (POSTPAID or PREPAID)
    @Column({ type: DataType.ENUM('POSTPAID', 'PREPAID'), allowNull: true })
    type?: 'POSTPAID' | 'PREPAID';

    @Column({ type: DataType.STRING, allowNull: false })
    productName: string;

    @HasMany(() => VendorProduct)
    vendorProducts: VendorProduct[];

    @BeforeCreate
    static async checkIfProductNameIsValidForDataAndAirtime(instance: Product) {
        if (instance.category === 'DATA' || instance.category === 'AIRTIME') {
            if (!['MTN', 'GLO', 'AIRTEL', '9MOBILE'].includes(instance.productName)) {
                throw new Error(`Master code for data must contain either MTN, GLO, AIRTEL, or 9MOBILE`);
            }
        }
    }
}

// Define an interface representing a product code (IProduct) with various properties.
export interface IProduct {
    id: string;
    masterProductCode: string; // Unique identifier for the product code
    type?: 'POSTPAID' | 'PREPAID'; // Type of the product code (POSTPAID or PREPAID)
    category: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE';
    productName?: string;
}


export interface IUpdateProduct {
    masterProductCode?: string;
    type?: 'POSTPAID' | 'PREPAID';
    productName: string;
}