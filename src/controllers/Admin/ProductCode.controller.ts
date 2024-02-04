import { NextFunction, Request, Response } from "express";
import ProductService from "../../services/ProductCode.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import { BadRequestError, NotFoundError } from "../../utils/Errors";
import { randomUUID } from "crypto";
require('newrelic');

export default class ProductController {

    static async createProductCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { location, type, code } = req.body as {code: string, location: string, type: 'POSTPAID' | 'PREPAID' };

        if (!location || !type) {
            throw new BadRequestError('Location and type are required');
        }

        const data = { location, type, productCode: code, id: randomUUID() };
        const productCode = await ProductService.addProductCode(data);

        res.status(201).json({
            status: 'success',
            data: {
                productCode,
            },
        });
    }

    static async updateProductCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { location, type, productCodeId } = req.body as {productCodeId: string, location?: string, type?: 'POSTPAID' | 'PREPAID' };

        if (!location && !type) {
            throw new BadRequestError('Location or type is required');
        }

        const data = { location, type };
        const updatedProductCode = await ProductService.updateProductCode(productCodeId, data);

        if (!updatedProductCode) {
            throw new NotFoundError('Product code not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                productCode: updatedProductCode,
            },
        });
    }

    static async getAllProductCodes(req: Request, res: Response, next: NextFunction) {
        const productCodes = await ProductService.getAllProductCodes();

        res.status(200).json({
            status: 'success',
            data: {
                productCodes,
            },
        });
    }

    static async getInfoForProductCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { productCodeId } = req.query as { productCodeId: string };

        const productCode = await ProductService.viewSingleProductCode(productCodeId, true);

        if (!productCode) {
            throw new NotFoundError('Product code not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                productCode,
            },
        });
    }
}
