// Import necessary types and the models
import { Transaction } from "sequelize";
import VendorProduct, { IVendorProduct } from "../models/VendorProduct.model";
import Product from "../models/Product.model";
import Vendor from "../models/Vendor.model";
import { NotFoundError } from "../utils/Errors";

// VendorProductService class for handling vendor product-related operations
export default class VendorProductService {
    // Method for adding a new vendor product to the database
    static async addVendorProduct(data: IVendorProduct, transaction?: Transaction): Promise<VendorProduct> {
        const vendorProduct = VendorProduct.build(data);
        transaction ? await vendorProduct.save({ transaction }) : await vendorProduct.save();
        return vendorProduct;
    }

    // Method for updating an existing vendor product
    static async updateVendorProduct(vendorProductId: string, data: Partial<IVendorProduct>, transaction?: Transaction): Promise<VendorProduct> {
        const vendorProduct = await VendorProduct.findByPk(vendorProductId);

        if (!vendorProduct) {
            throw new NotFoundError('Vendor Product not found');
        }

        const dataToUpdate = { ...data };
        if (dataToUpdate.schemaData) {
            dataToUpdate.schemaData = {
                ...vendorProduct.schemaData,
                ...dataToUpdate.schemaData,
            }
        }
        transaction ? await vendorProduct.update(dataToUpdate, { transaction }) : await vendorProduct.update(dataToUpdate);
        return vendorProduct;
    }

    // Method for viewing a single vendor product
    static async viewSingleVendorProduct(vendorProductId: string): Promise<VendorProduct | null> {
        const vendorProduct = await VendorProduct.findByPk(vendorProductId, { include: [Product, Vendor] });
        return vendorProduct;
    }

    // Method for retrieving all vendor products
    static async getAllVendorProducts(): Promise<VendorProduct[]> {
        const vendorProducts = await VendorProduct.findAll();
        return vendorProducts;
    }

    static async viewSingleVendorProductByVendorIdAndProductId(vendorId: string, productId: string): Promise<VendorProduct | null> {
        const vendorProduct = await VendorProduct.findOne({ where: { vendorId, productId } });
        return vendorProduct;
    }
}
