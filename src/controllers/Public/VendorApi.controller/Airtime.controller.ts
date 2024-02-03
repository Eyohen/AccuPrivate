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
    DEFAULT_AIRTIME_PROVIDER,
    DEFAULT_ELECTRICITY_PROVIDER,
} from "../../../utils/Constants";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from "../../../utils/Errors";
import { VendorPublisher } from "../../../kafka/modules/publishers/Vendor";
import { CRMPublisher } from "../../../kafka/modules/publishers/Crm";
import { AirtimeTransactionEventService } from "../../../services/TransactionEvent.service";
import { Database } from "../../../models";
import ProductService from "../../../services/Product.service";
import Vendor from "../../../models/Vendor.model";
import VendorProduct, { VendorProductSchemaData } from "../../../models/VendorProduct.model";


class AirtimeValidator {
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

    static async validateAirtimeRequest({ phoneNumber, amount, disco }: { phoneNumber: string, amount: string, disco: string }) {
        AirtimeValidator.validatePhoneNumber(phoneNumber);
        // Check if amount is a number
        if (isNaN(Number(amount))) {
            throw new BadRequestError("Invalid amount");
        }

        if (parseFloat(amount) < 50) {
            throw new BadRequestError("Amount must be greater than 50");
        }

        const productCode = await ProductService.viewSingleProductByMasterProductCode(disco)
        if (!productCode) {
            throw new InternalServerError('Product code not found')
        }
    }

    static async requestAirtime({ transactionId, bankRefId, bankComment }: { transactionId: string, bankRefId: string, bankComment: string }) {
        if (!transactionId || !bankRefId || !bankComment) {
            throw new BadRequestError("Transaction ID, bank reference ID, and bank comment are required");
        }

        const transactionRecord = await TransactionService.viewSingleTransaction(transactionId);
        if (!transactionRecord) {
            throw new NotFoundError("Transaction not found");
        }
    }


}

export class AirtimeVendController {
    static async validateAirtimeRequest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { phoneNumber, amount, email, disco } = req.body;
        const superAgent = DEFAULT_AIRTIME_PROVIDER;
        // TODO: Add request type for request authenticated by API keys
        const partnerId = (req as any).key

        // TODO: I'm using this for now to allow the schema validation since product code hasn't been created for airtime
        const existingProductCodeForDisco = await ProductService.viewSingleProductByMasterProductCode(disco)
        if (!existingProductCodeForDisco) {
            throw new NotFoundError('Product code not found for disco')
        }

        if (existingProductCodeForDisco.category !== 'AIRTIME') {
            throw new BadRequestError('Invalid product code for airtime')
        }

        const transaction: Transaction =
            await TransactionService.addTransactionWithoutValidatingUserRelationship({
                id: uuidv4(),
                amount: amount,
                status: Status.PENDING,
                disco: disco,
                superagent: superAgent,
                paymentType: PaymentType.PAYMENT,
                transactionTimestamp: new Date(),
                partnerId: partnerId,
                transactionType: TransactionType.AIRTIME,
                productCodeId: existingProductCodeForDisco.id,
                previousVendors: [DEFAULT_AIRTIME_PROVIDER],
            });

        const transactionEventService = new AirtimeTransactionEventService(transaction, superAgent, partnerId, phoneNumber);
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        AirtimeValidator.validateAirtimeRequest({ phoneNumber, amount, disco });
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        const userInfo = {
            id: uuidv4(),
            phoneNumber: phoneNumber,
            amount: amount,
            email: email,
        }
        await transactionEventService.addCRMUserInitiatedEvent({ user: userInfo })
        CRMPublisher.publishEventForInitiatedUser({ user: userInfo, transactionId: transaction.id })

        const sequelizeTransaction = await Database.transaction()
        try {
            const user = await UserService.addUserIfNotExists({
                id: userInfo.id,
                email: email,
                phoneNumber: phoneNumber,
            }, sequelizeTransaction);

            await transaction.update({ userId: user.id }, { transaction: sequelizeTransaction })
            await sequelizeTransaction.commit()
        } catch (error) {
            await sequelizeTransaction.rollback()
            throw error
        }

        res.status(200).json({
            message: "Request validated successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        })
    }

    static async requestAirtime(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { transactionId, bankRefId, bankComment } = req.query as Record<string, string>;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User record not found for already validated request')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner record not found for already validated request')
        }

        // Check if transaction is already completed    
        if (transaction.status === Status.COMPLETE) {
            throw new BadRequestError("Transaction already completed");
        }

        // Check if reference has been used before
        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId);
        if (existingTransaction) {
            throw new BadRequestError("Duplicate reference");
        }

        const transactionEventService = new AirtimeTransactionEventService(transaction, transaction.superagent, transaction.partnerId, user.phoneNumber);
        await transactionEventService.addAirtimePurchaseInitiatedEvent({ amount: transaction.amount })

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.PENDING,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publshEventForAirtimePurchaseInitiate({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        })

        res.status(200).json({
            message: "Airtime request sent successfully",
            data: {
                transaction,
            },
        })
    }

    static async confirmPayment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { transactionId, bankRefId, bankComment } = req.body;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User record not found for already validated request')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner record not found for already validated request')
        }

        const transactionEventService = new AirtimeTransactionEventService(transaction, transaction.superagent, transaction.partnerId, user.phoneNumber);
        await transactionEventService.addAirtimePurchaseConfirmedEvent()

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.COMPLETE,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publishEventForAirtimePurchaseComplete({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        })

        res.status(200).json({
            message: "Airtime payment confirmed successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        })
    }
}