import { NextFunction, Response, Request } from "express";
import { AuthenticatedRequest } from "../../utils/Interface";
import ResponsePathService from "../../services/ResponsePath.service";
import { randomUUID } from "crypto";
import VendorService from "../../services/Vendor.service";
import fs from 'fs'

export default class ResponsePathController {
    static async seedResponsePatsh(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const filePath = __dirname + '/../../models/response_path.csv'

        // Read CSV file
        const csvData = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV data
        // It has columns, id, Path, Vendor, AccuvendRefCode, RequestType, description
        const rows = csvData.split('\n');
        const data = rows.map(row => {
            const [id, path, vendorName, accuvendRefCode, requestType, description] = row.split(',');

            return {
                id,
                path,
                vendorName: vendorName as 'IRECHARGE' | 'BUYPOWERNG' | 'BAXI',
                accuvendRefCode,
                requestType,
                description
            };
        });

        // Get all vendors
        const irechargeVendor = await VendorService.viewSingleVendorByName('IRECHARGE');
        const buypowerNg = await VendorService.viewSingleVendorByName('BUYPOWERNG');
        const baxi = await VendorService.viewSingleVendorByName('BAXI');

        if (!irechargeVendor || !buypowerNg || !baxi) {
            console.log('Vendors not found');
            return;
        }

        const vendorIds = {
            IRECHARGE: irechargeVendor.id,
            BUYPOWERNG: buypowerNg.id,
            BAXI: baxi.id,
        }

        // Seed data
        for (const row of data) {
            const { id, path, vendorName, accuvendRefCode, requestType, description } = row;
            const vendorId = vendorIds[vendorName];

            if (!vendorId) {
                console.log(`Vendor with name ${vendorName} not found`);
                continue;
            }

            await ResponsePathService.addResponsePath({
                id,
                path,
                vendorId,
                accuvendRefCode,
                requestType,
                description
            });
        }
        console.log('Data seeded successfully!');
    }
    static async createResponsePath(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const {
            path, accuvendRefCode, description, requestType, vendorId
        } = req.body

        const existingVendor = await VendorService.viewSingleVendor(vendorId)
        if (!existingVendor) {
            res.status(400).send({
                success: false,
                message: "Vendor does not exist",
                data: {},
            });
            return
        }
        const responsePath = await ResponsePathService.addResponsePath({
            path, accuvendRefCode, description, requestType, id: randomUUID(), vendorId: vendorId
        })

        res.status(200).send({
            success: true,
            message: "Response path created successfully",
            data: { responsePath },
        });
    }

    static async getResponsePaths(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const responsePaths = await ResponsePathService.viewAllResponsePaths()

        res.status(200).send({
            success: true,
            message: "Response path fetched successfully",
            data: { responsePaths },
        });
    }

    static async getResponsePathInfo(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const responsePathId = req.query.responsePathId as string;
        const responsePath = await ResponsePathService.viewSingleResponsePathById(responsePathId, { include: true })

        res.status(200).send({
            success: true,
            message: "Response path fetched successfully",
            data: { responsePath },
        });
    }

    static async updateResponsePath(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const {
            path, accuvendRefCode, description, requestType
        } = req.body
        const responsePathId = req.body.responsePathId;
        const responsePath = await ResponsePathService.updateResponsePath(responsePathId, {
            path, accuvendRefCode, description, requestType
        })

        res.status(200).send({
            success: true,
            message: "Response path updated successfully",
            data: { responsePath },
        });
    }
}

async function seedDataFromCSV(filePath: string) {
    try {

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

