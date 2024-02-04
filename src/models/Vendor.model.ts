// Import necessary modules and dependencies
import { Table, Column, Model, DataType, HasOne, HasMany, IsUUID, PrimaryKey, Unique, BeforeCreate } from "sequelize-typescript";
import VendorRates from './VendorRates.model';
import VendorProduct from "./VendorProduct.model";

// Define the Sequelize model for the "Vendor" table
@Table
export default class Vendor extends Model<IVendor | Vendor> {
    // Unique identifier for the product code
    @IsUUID(4)
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    name: string;

    @Column({ type: DataType.JSONB, allowNull: true })
    schemaData: {
        airtime: Record<string, any>,
        data: Record<string, any>,
        electricity: Record<string, any>,
        cable: Record<string, any>,
    };

    @HasMany(() => VendorProduct)
    vendorProducts: VendorProduct[];

    @BeforeCreate
    static async capitalizeVendorName(instance: Vendor) {
        instance.name = instance.name.toUpperCase();
    }

    @BeforeCreate
    static async trimVendorName(instance: Vendor) {
        instance.name = instance.name.trim();
    }
}

// Define an interface representing a product code (IVendor) with various properties.
export interface IVendor {
    id: string;
    name: string;
    schemaData?: {
        airtime: Record<string, any>,
        data: Record<string, any>,
        electricity: Record<string, any>,
        cable: Record<string, any>
    }
}
