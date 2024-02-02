import { NextFunction, Request, Response } from "express";
import VendorProductService from "../../services/VendorProduct.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import { BadRequestError, NotFoundError } from "../../utils/Errors";
import { randomUUID } from "crypto";

export default class VendorProductController {
    static async createVendorProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { vendorId, productId, commission, bonus, schemaData, vendorHttpUrl, amount } = req.body as {
            vendorId: string,
            productId: string,
            commission: number,
            bonus: number,
            schemaData: Record<string, any>,
            vendorHttpUrl: string,
            amount: number,
        };

        if (!vendorId || !productId || !commission || !bonus || !schemaData || !vendorHttpUrl) {
            throw new BadRequestError('Vendor ID, Product ID, Commission, Bonus, Schema Data, and Vendor HTTP URL are required');
        }

        const docWithSameVendorIdAndProductId = await VendorProductService.viewSingleVendorProductByVendorIdAndProductId(vendorId, productId);
        if (docWithSameVendorIdAndProductId) {
            throw new BadRequestError('Vendor Product with same Vendor ID and Product ID already exists');
        }
        
        const data = { vendorId, productId, commission, bonus, amount, schemaData, vendorHttpUrl, id: randomUUID() };
        const vendorProduct = await VendorProductService.addVendorProduct(data);

        res.status(201).json({
            status: 'success',
            data: {
                vendorProduct,
            },
        });
    }

    static async updateVendorProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { vendorProductId, commission, bonus, schemaData, vendorHttpUrl } = req.body as {
            vendorProductId: string,
            commission?: number,
            bonus?: number,
            schemaData?: Record<string, any>,
            vendorHttpUrl?: string,
        };

        if (!vendorProductId) {
            throw new BadRequestError('Vendor Product ID is required');
        }

        const data = { commission, bonus, schemaData, vendorHttpUrl };
        const updatedVendorProduct = await VendorProductService.updateVendorProduct(vendorProductId, data);

        if (!updatedVendorProduct) {
            throw new NotFoundError('Vendor Product not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                vendorProduct: updatedVendorProduct,
            },
        });
    }

    static async getAllVendorProducts(req: Request, res: Response, next: NextFunction) {
        const vendorProducts = await VendorProductService.getAllVendorProducts();

        res.status(200).json({
            status: 'success',
            data: {
                vendorProducts,
            },
        });
    }

    static async getVendorProductInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { vendorProductId } = req.query as { vendorProductId: string };

        const vendorProduct = await VendorProductService.viewSingleVendorProduct(vendorProductId);

        if (!vendorProduct) {
            throw new NotFoundError('Vendor Product not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                vendorProduct,
            },
        });
    }
}
