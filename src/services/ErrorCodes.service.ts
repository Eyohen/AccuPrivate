// Import necessary modules and dependencies
import ErrorCode, { ICreateErrorCode, IErrorCode } from "../models/ErrorCodes.model";

// ErrorCodeService class for handling ErrorCode-related operations
export default class ErrorCodeService {
    // Method for adding a new ErrorCode to the database
    static async addErrorCode(errorCodeData: ICreateErrorCode): Promise<ErrorCode> {
        try {
            // Create a new ErrorCode using the ErrorCode model
            const newErrorCode: ErrorCode = await ErrorCode.create(errorCodeData);
            return newErrorCode;
        } catch (error) {
            console.error("Error adding ErrorCode:", error);
            throw error;
        }
    }

    // Method for retrieving all ErrorCodes from the database
    static async getAllErrorCodes(): Promise<ErrorCode[]> {
        try {
            // Retrieve all ErrorCodes from the database
            const errorCodes: ErrorCode[] = await ErrorCode.findAll();
            return errorCodes;
        } catch (error) {
            console.error("Error retrieving ErrorCodes:", error);
            throw error;
        }
    }

    // Method for retrieving a single ErrorCode by its ID
    static async getErrorCodeById(id: string): Promise<ErrorCode | null> {
        try {
            // Retrieve ErrorCode from the database by ID
            const errorCode: ErrorCode | null = await ErrorCode.findByPk(id);
            return errorCode;
        } catch (error) {
            console.error("Error retrieving ErrorCode by ID:", error);
            throw error;
        }
    }

    // Method for updating an existing ErrorCode
    static async updateErrorCode(id: string, updatedData: Partial<IErrorCode>): Promise<ErrorCode | null> {
        try {
            // Find ErrorCode by ID
            const errorCode: ErrorCode | null = await ErrorCode.findByPk(id);
            if (!errorCode) {
                throw new Error("ErrorCode not found");
            }

            // Update ErrorCode with new data
            await errorCode.update(updatedData);
            return errorCode;
        } catch (error) {
            console.error("Error updating ErrorCode:", error);
            throw error;
        }
    }

    // Method for deleting an existing ErrorCode
    static async deleteErrorCode(id: string): Promise<void> {
        try {
            // Find ErrorCode by ID and delete it
            const errorCode: ErrorCode | null = await ErrorCode.findByPk(id);
            if (!errorCode) {
                throw new Error("ErrorCode not found");
            }

            await errorCode.destroy();
        } catch (error) {
            console.error("Error deleting ErrorCode:", error);
            throw error;
        }
    }
}
