import { NextFunction, Request, Response } from "express";
import TransactionService from "../../../services/Transaction.service";
import Transaction, {
    PaymentType,
    Status,
    TransactionType,
} from "../../../models/Transaction.model";
import { v4 as uuidv4 } from "uuid";
import UserService from "../../../services/User.service";
import {
    DEFAULT_DATA_PROVIDER,
    DEFAULT_ELECTRICITY_PROVIDER,
    VENDOR_URL,
} from "../../../utils/Constants";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from "../../../utils/Errors";
import { VendorPublisher } from "../../../kafka/modules/publishers/Vendor";
import { CRMPublisher } from "../../../kafka/modules/publishers/Crm";
import { DataTransactionEventService } from "../../../services/TransactionEvent.service";
import { Database } from "../../../models";
import ProductService from "../../../services/Product.service";
import VendorProduct from "../../../models/VendorProduct.model";
import VendorProductService from "../../../services/VendorProduct.service";
import { TokenHandlerUtil } from "../../../kafka/modules/consumers/Token";
import {
    generateRandomString,
    generateRandonNumbers,
} from "../../../utils/Helper";
import ResponseTrimmer from "../../../utils/ResponseTrimmer";
require("newrelic");

class DataValidator {
    static validatePhoneNumber(phoneNumber: string) {
        if (phoneNumber.length !== 11) {
            throw new BadRequestError("Invalid phone number");
        }

        if (phoneNumber[0] !== "0") {
            throw new BadRequestError("Invalid phone number");
        }

        const regex = new RegExp("^[0-9]+$");
        if (!regex.test(phoneNumber)) {
            throw new BadRequestError("Invalid phone number");
        }
    }

    static async validateDataRequest({
        phoneNumber,
        amount,
        disco,
    }: {
        phoneNumber: string;
        amount: string;
        disco: string;
    }) {
        DataValidator.validatePhoneNumber(phoneNumber);
        // Check if amount is a number
        if (isNaN(Number(amount))) {
            throw new BadRequestError("Invalid amount");
        }

        if (parseFloat(amount) < 50) {
            throw new BadRequestError("Amount must be greater than 50");
        }

        const productCode =
            await ProductService.viewSingleProductByMasterProductCode(disco);
        if (!productCode) {
            throw new InternalServerError("Product code not found");
        }
    }

    static async requestData({
        transactionId,
        bankRefId,
        bankComment,
    }: {
        transactionId: string;
        bankRefId: string;
        bankComment: string;
    }) {
        if (!transactionId || !bankRefId || !bankComment) {
            throw new BadRequestError(
                "Transaction ID, bank reference ID, and bank comment are required",
            );
        }

        const transactionRecord =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transactionRecord) {
            throw new NotFoundError("Transaction not found");
        }
    }
}

export class DataVendController {
    static async validateDataRequest(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        console.log({ VENDOR_URL: VENDOR_URL });
        const { phoneNumber, email, vendorProductId } = req.body;
        // TODO: Add request type for request authenticated by API keys
        const partnerId = (req as any).key;

        let disco = req.body.networkProvider;
        // TODO: I'm using this for now to allow the schema validation since product code hasn't been created for airtime
        const existingProductCodeForDisco =
            await ProductService.viewSingleProductByNameAndCategory(
                disco,
                "DATA",
            );
        if (!existingProductCodeForDisco) {
            throw new NotFoundError("Product code not found for disco");
        }

        disco = existingProductCodeForDisco.masterProductCode;

        if (existingProductCodeForDisco.category !== "DATA") {
            throw new BadRequestError("Invalid product code for data");
        }

        const vendorProduct =
            await VendorProductService.viewSingleVendorProduct(vendorProductId);
        if (!vendorProduct) {
            throw new NotFoundError("Vendor product not found");
        }

        const vendor = await vendorProduct.$get("vendor");
        if (!vendor) {
            throw new InternalServerError(
                "Vendor not found for vendor product",
            );
        }

        const superAgent = vendor.name as "IRECHARGE" | "BUYPOWERNG" | "BAXI";

        const reference = generateRandomString(10);
        const amount = vendorProduct.bundleAmount.toString();
        const transaction: Transaction =
            await TransactionService.addTransactionWithoutValidatingUserRelationship(
                {
                    id: uuidv4(),
                    amount: amount,
                    status: Status.PENDING,
                    disco: disco,
                    superagent: superAgent,
                    paymentType: PaymentType.PAYMENT,
                    transactionTimestamp: new Date(),
                    partnerId: partnerId,
                    transactionType: TransactionType.DATA,
                    productCodeId: existingProductCodeForDisco.id,
                    previousVendors: [vendor.name],
                    networkProvider: existingProductCodeForDisco.productName,
                    reference,
                    productType: "DATA",
                    vendorReferenceId:
                        superAgent === "IRECHARGE"
                            ? generateRandonNumbers(12)
                            : reference,
                    retryRecord: [],
                },
            );

        const transactionEventService = new DataTransactionEventService(
            transaction,
            superAgent,
            partnerId,
            phoneNumber,
        );
        await transactionEventService.addPhoneNumberValidationRequestedEvent();

        await DataValidator.validateDataRequest({ phoneNumber, amount, disco });
        await transactionEventService.addPhoneNumberValidationRequestedEvent();

        const userInfo = {
            id: uuidv4(),
            phoneNumber: phoneNumber,
            amount: amount,
            email: email,
        };
        await transactionEventService.addCRMUserInitiatedEvent({
            user: userInfo,
        });
        CRMPublisher.publishEventForInitiatedUser({
            user: userInfo,
            transactionId: transaction.id,
        });

        const sequelizeTransaction = await Database.transaction();
        try {
            const user = await UserService.addUserIfNotExists(
                {
                    id: userInfo.id,
                    email: email,
                    phoneNumber: phoneNumber,
                },
                sequelizeTransaction,
            );

            await transaction.update(
                { userId: user.id },
                { transaction: sequelizeTransaction },
            );
            await sequelizeTransaction.commit();
        } catch (error) {
            await sequelizeTransaction.rollback();
            throw error;
        }

        res.status(200).json({
            message: "Request validated successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        });
    }

    static async requestData(req: Request, res: Response, next: NextFunction) {
        const { transactionId, bankRefId, bankComment } = req.query as Record<
            string,
            string
        >;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get("user");
        if (!user) {
            throw new InternalServerError(
                "User record not found for already validated request",
            );
        }

        const partner = await transaction.$get("partner");
        if (!partner) {
            throw new InternalServerError(
                "Partner record not found for already validated request",
            );
        }

        // Check if transaction is already completed
        if (transaction.status === Status.COMPLETE) {
            throw new BadRequestError("Transaction already completed");
        }

        // Check if reference has been used before
        const existingTransaction: Transaction | null =
            await TransactionService.viewSingleTransactionByBankRefID(
                bankRefId,
            );
        if (existingTransaction) {
            throw new BadRequestError("Duplicate reference");
        }

        const transactionEventService = new DataTransactionEventService(
            transaction,
            transaction.superagent,
            transaction.partnerId,
            user.phoneNumber,
        );
        await transactionEventService.addDataPurchaseInitiatedEvent({
            amount: transaction.amount,
        });

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.PENDING,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publshEventForDataPurchaseInitiate({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        });

        res.status(200).json({
            message: "Data request sent successfully",
            data: {
                transaction: ResponseTrimmer.trimTransactionResponse(transaction.dataValues),
            },
        });
    }

    static async confirmPayment(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const { transactionId, bankRefId, bankComment } = req.body;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get("user");
        if (!user) {
            throw new InternalServerError(
                "User record not found for already validated request",
            );
        }

        const partner = await transaction.$get("partner");
        if (!partner) {
            throw new InternalServerError(
                "Partner record not found for already validated request",
            );
        }

        const transactionEventService = new DataTransactionEventService(
            transaction,
            transaction.superagent,
            transaction.partnerId,
            user.phoneNumber,
        );
        await transactionEventService.addDataPurchaseConfirmedEvent();

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.COMPLETE,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publishEventForDataPurchaseComplete({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        });

        res.status(200).json({
            message: "Data payment confirmed successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        });
    }
}

