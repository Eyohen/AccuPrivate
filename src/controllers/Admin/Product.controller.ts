import { NextFunction, Request, Response } from "express";
import ProductService from "../../services/Product.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import { BadRequestError, NotFoundError } from "../../utils/Errors";
import { randomUUID } from "crypto";

export default class ProductController {

    static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { masterProductCode, category, type, amount } = req.body as {
            masterProductCode: string,
            category: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE',
            type: 'POSTPAID' | 'PREPAID',
            amount?: number,
        };

        if (!masterProductCode || !category || !type) {
            throw new BadRequestError('Master Product Code, Category, and Type are required');
        }

        const data = { masterProductCode, category, type, amount, id: randomUUID() };
        const product = await ProductService.addProduct(data);

        res.status(201).json({
            status: 'success',
            data: {
                product,
            },
        });
    }

    static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { productId, masterProductCode, category, type, amount } = req.body as {
            productId: string,
            masterProductCode?: string,
            category?: 'AIRTIME' | 'ELECTRICITY' | 'DATA' | 'CABLE',
            type?: 'POSTPAID' | 'PREPAID',
            amount?: number,
        };

        if (!productId) {
            throw new BadRequestError('Product ID is required');
        }

        const data = { masterProductCode, category, type, amount };
        const updatedProduct = await ProductService.updateProduct(productId, data);

        if (!updatedProduct) {
            throw new NotFoundError('Product not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProduct,
            },
        });
    }

    static async getAllProducts(req: Request, res: Response, next: NextFunction) {
        const products = await ProductService.getAllProducts();

        res.status(200).json({
            status: 'success',
            data: {
                products,
            },
        });
    }

    static async getProductInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { productId } = req.query as { productId: string };

        const product = await ProductService.viewSingleProduct(productId);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        });
    }
}
