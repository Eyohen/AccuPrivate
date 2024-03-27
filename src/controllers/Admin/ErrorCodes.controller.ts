import { NextFunction, Request, Response } from "express";
import ErrorCode, { ICreateErrorCode, IErrorCode } from "../../models/ErrorCodes.model";
import ErrorCodeService from "../../services/ErrorCodes.service";
import { NotFoundError } from "../../utils/Errors";
import { randomUUID } from "crypto";
import { AuthenticatedRequest } from "../../utils/Interface";
import fs from 'fs'

export default class ErrorCodeController {
    static async seedResponsePatsh(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const filePath = __dirname + '/../../models/erro_codes.csv'

        // Read CSV file
        const csvData = fs.readFileSync(filePath, 'utf-8');

        // Parse CSV data
        // It has columns, id, Path, Vendor, AccuvendRefCode, RequestType, description
        const rows = csvData.split('\n');
        const data = rows.map(row => {
            const [httpCode, vend_code, responseCode, category, message, description, accuvendMasterResponseCode, accuvendDescription, request, vendor] = row.split(',');

            return {
                id: randomUUID(),
                httpCode,
                vend_code,
                responseCode,
                category,
                message,
                description,
                accuvendMasterResponseCode,
                accuvendDescription,
                request,
                vendor
            };
        });

        // Seed data
        for (const row of data.slice(1)) {
            const { id, httpCode,
                vend_code,
                responseCode,
                category,
                message,
                description,
                accuvendMasterResponseCode,
                accuvendDescription,
                request,
                vendor } = row;

            console.log({ row })
            await ErrorCodeService.addErrorCode({
                id,
                httpCode: httpCode ? parseInt(httpCode?.toString(), 10) : undefined,
                vend_code,
                response_code: responseCode?.toString(),
                category,
                message,
                description,
                accuvendMasterResponseCode: accuvendMasterResponseCode ? parseInt(accuvendMasterResponseCode?.toString(), 10) : undefined,
                accuvendDescription,
                request,
                vendor: vendor?.toUpperCase().replace('\r', '')
            });
        }
        console.log('Data seeded successfully!');


        res.status(200).send({
            message: 'Success',
            success: true,
            data: {}
        })
    }

    static async createErrorCode(req: Request, res: Response): Promise<void> {
        const {
            httpCode, vend_code, response_code, message, description, accuvendDescription, accuvendMasterResponseCode, request, vendor
        }: ICreateErrorCode = req.body;
        const errorCodeData: ICreateErrorCode = {
            id: randomUUID(), httpCode, vend_code, response_code, message, description, accuvendDescription, accuvendMasterResponseCode, request, vendor
        };
        const newErrorCode = await ErrorCodeService.addErrorCode(errorCodeData);
        res.status(201).send({ success: true, message: "ErrorCode created successfully", data: { errorCode: newErrorCode } });
    }

    static async getAllErrorCodes(req: Request, res: Response): Promise<void> {
        const errorCodes: ErrorCode[] = await ErrorCodeService.getAllErrorCodes();
        res.status(200).send({ success: true, message: "ErrorCodes retrieved successfully", data: errorCodes });
    }

    static async getErrorCodeById(req: Request, res: Response): Promise<void> {
        const { errorCodeId } = req.query as Record<string, string>;
        const errorCode: ErrorCode | null = await ErrorCodeService.getErrorCodeById(errorCodeId);
        if (!errorCode) {
            throw new NotFoundError("ErrorCode not found")
            return;
        }
        res.status(200).send({ success: true, message: "ErrorCode retrieved successfully", data: { errorCode } });
    }

    static async updateErrorCode(req: Request, res: Response): Promise<void> {
        const { errorCodeId, httpCode,
            vend_code,
            responseCode,
            category,
            message,
            description,
            accuvendMasterResponseCode,
            accuvendDescription,
            request,
            vendor } = req.body;
        const updatedData: Partial<IErrorCode> = {
            httpCode, vend_code, response_code: responseCode, category, message, description, accuvendDescription, accuvendMasterResponseCode, request, vendor
        }
        const errorCode: ErrorCode | null = await ErrorCodeService.updateErrorCode(errorCodeId, updatedData);
        if (!errorCode) {
            throw new NotFoundError("ErrorCode not found")
            return;
        }
        res.status(200).send({ success: true, message: "ErrorCode updated successfully", data: { errorCode } });
    }
}
