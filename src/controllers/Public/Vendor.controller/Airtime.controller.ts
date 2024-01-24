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


class AirtimeValidator {
    static async validatePhoneNumber(phoneNumber: string) {
        if (phoneNumber.length !== 11) {
            throw new BadRequestError("Invalid phone number");
        }
    }

    static validateAirtimeRequest({ phoneNumber, amount }: { phoneNumber: string, amount: string }) {
        AirtimeValidator.validatePhoneNumber(phoneNumber);
        if (amount.length < 3 || amount.length > 5) {
            throw new BadRequestError("Invalid amount");
        }

        // Check if amount is a number
        if (isNaN(Number(amount))) {
            throw new BadRequestError("Invalid amount");
        }
    }
}

export class AirtimeVendController {
    static async validateAirtimeRequest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { phoneNumber, amount, email } = req.body;
        const superAgent = DEFAULT_ELECTRICITY_PROVIDER;
        // TODO: Add request type for request authenticated by API keys
        const partnerId = (req as any).key

        const transaction: Transaction =
            await TransactionService.addTransactionWithoutValidatingUserRelationship({
                id: uuidv4(),
                amount: "0",
                status: Status.PENDING,
                superagent: superAgent,
                paymentType: PaymentType.PAYMENT,
                transactionTimestamp: new Date(),
                partnerId: partnerId,
                transactionType: TransactionType.ELECTRICITY
            });

        const transactionEventService = new AirtimeTransactionEventService(transaction, superAgent, partnerId, phoneNumber);
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        await AirtimeValidator.validateAirtimeRequest({ phoneNumber, amount });
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        const userInfo = {
            id: uuidv4(),
            phoneNumber: phoneNumber,
            amount: amount,
            email: email,
        }
        await transactionEventService.addCRMUserInitiatedEvent({ user: userInfo })
        CRMPublisher.publishEventForInitiatedUser({ user: userInfo, transactionId: transaction.id })

        const user = await UserService.addUserIfNotExists({
            id: userInfo.id,
            email: email,
            phoneNumber: phoneNumber,
        });

        if (!user) {
            throw new InternalServerError("Error creating user");
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
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
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