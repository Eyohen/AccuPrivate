import { NextFunction, Request, Response } from "express";
import ProductService from "../../services/ProductCode.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import { BadRequestError, NotFoundError } from "../../utils/Errors";
import { randomUUID } from "crypto";

export default class VendorRatesController {

    static async createVendorRate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { productCodeId, vendorName, discoCode, commission } = req.body as { productCodeId: string, vendorName: string, discoCode: string, commission: number };

        if (!productCodeId || !vendorName || !discoCode || !commission) {
            throw new BadRequestError('Product code ID, vendor name, disco code, and commission are required');
        }

        const data = { productCodeId, vendorName, discoCode, commission, id: randomUUID() };
        const vendorRate = await ProductService.addVendorRate(data);

        res.status(201).json({
            status: 'success',
            data: {
                vendorRate,
            },
        });
    }

    static async updateVendorRate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { vendorRateId } = req.query as { vendorRateId: string };
        const { discoCode, commission } = req.body as { discoCode?: string, commission?: number };

        if (!discoCode && !commission) {
            throw new BadRequestError('At least one of disco code or commission is required for update');
        }

        const data = { discoCode, commission };
        const updatedVendorRate = await ProductService.updateVendorRate(vendorRateId, data);

        if (!updatedVendorRate) {
            throw new NotFoundError('Vendor rate not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                vendorRate: updatedVendorRate,
            },
        });
    }

    static async getAllVendorRates(req: Request, res: Response, next: NextFunction) {
        const vendorRates = await ProductService.getAllVendorRates();

        res.status(200).json({
            status: 'success',
            data: {
                vendorRates,
            },
        });
    }

    static async getInfoForVendorRate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { vendorRateId } = req.query as { vendorRateId: string };

        const vendorRate = await ProductService.viewSingleVendorRate(vendorRateId);

        if (!vendorRate) {
            throw new NotFoundError('Vendor rate not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                vendorRate,
            },
        });
    }
}
