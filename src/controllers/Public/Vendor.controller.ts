import { NextFunction, Request, Response } from "express";
import TransactionService from "../../services/Transaction.service";
import Transaction, {
    PaymentType,
    Status,
} from "../../models/Transaction.model";
import { v4 as uuidv4 } from "uuid";
import UserService from "../../services/User.service";
import MeterService from "../../services/Meter.service";
import User from "../../models/User.model";
import Meter, { IMeter } from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import PowerUnit from "../../models/PowerUnit.model";
import PowerUnitService from "../../services/PowerUnit.service";
import {
    DEFAULT_ELECTRICITY_PROVIDER,
    DISCO_LOGO,
    NODE_ENV,
} from "../../utils/Constants";
import {
    BadRequestError,
    GateWayTimeoutError,
    InternalServerError,
    NotFoundError,
} from "../../utils/Errors";
import { generateRandomToken } from "../../utils/Helper";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from "../../utils/ResponseTrimmer";
import NotificationUtil from "../../utils/Notification";
import Entity from "../../models/Entity/Entity.model";
import NotificationService from "../../services/Notification.service";
import EventService from "../../services/Event.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import Event from "../../models/Event.model";
import { VendorPublisher } from "../../kafka/modules/publishers/Vendor";
import { CRMPublisher } from "../../kafka/modules/publishers/Crm";
import TokenConsumer from "../../kafka/modules/consumers/Token";
import { TOPICS } from "../../kafka/Constants";
import { PublisherEventAndParameters, Registry } from "../../kafka/modules/util/Interface";
import { randomUUID } from "crypto";
import ConsumerFactory from "../../kafka/modules/util/Consumer";
import MessageProcessorFactory from "../../kafka/modules/util/MessageProcessor";
import logger from "../../utils/Logger";
import { error } from "console";

interface valideMeterRequestBody {
    meterNumber: string;
    superagent: "BUYPOWERNG" | "BAXI";
    vendType: "PREPAID" | "POSTPAID";
    disco: string;
    phoneNumber: string;
    partnerName: string;
    email: string;
}

interface vendTokenRequestBody {
    meterNumber: string;
    provider: "BUYPOWERNG" | "BAXI";
    disco: string;
    phoneNumber: string;
    partnerName: string;
    email: string;
}

interface RequestTokenValidatorParams {
    bankRefId: string;
    transactionId: string;
}

interface RequestTokenValidatorResponse {
    user: User;
    meter: Meter;
    transaction: Transaction;
    partnerEntity: Entity;
}
class VendorTokenHandler implements Registry {
    private tokenSent = false
    private transaction: Transaction
    private response: () => Response

    private async handleTokenReceived(data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR]) {
        this.response().status(200).send({
            status: 'success',
            message: 'Token purchase initiated successfully',
            data: {
                transaction: this.transaction,
                meter: data.meter,
                token: data.meter.token
            }
        })

        this.tokenSent = true
    }

    constructor(transaction: Transaction, response: Response) {
        this.transaction = transaction
        this.response = () => response
        return this
    }

    public getTokenState() {
        return this.tokenSent
    }

    public registry = {
        [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleTokenReceived.bind(this)
    }
}


class VendorTokenReceivedSubscriber extends ConsumerFactory {
    private tokenHandler: VendorTokenHandler

    constructor(transaction: Transaction, response: Response) {
        const tokenHandler = new VendorTokenHandler(transaction, response)
        const messageProcessor = new MessageProcessorFactory(tokenHandler.registry, randomUUID())
        super(messageProcessor)
        this.tokenHandler = tokenHandler
    }

    public getTokenSentState() {
        return this.tokenHandler.getTokenState()
    }
}

// Validate request parameters for each controller
class VendorControllerValdator {
    static validateMeter() { }

    static async requestToken({
        bankRefId,
        transactionId,
    }: RequestTokenValidatorParams): Promise<RequestTokenValidatorResponse> {
        if (!bankRefId)
            throw new BadRequestError("Transaction reference is required");

        const transactionRecord: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transactionRecord) {
            throw new BadRequestError("Transaction does not exist");
        }

        // Check if Disco is Up
        const checKDisco: boolean | Error =
            await VendorService.buyPowerCheckDiscoUp(transactionRecord.disco);
        if (!checKDisco) throw new BadRequestError("Disco is currently down");

        // Check if bankRefId has been used before
        const existingTransaction: Transaction | null =
            await TransactionService.viewSingleTransactionByBankRefID(bankRefId);
        if (existingTransaction instanceof Transaction) {
            throw new BadRequestError("Bank reference has been used before");
        }

        const transactionHasCompleted =
            transactionRecord.status === Status.COMPLETE;
        if (transactionHasCompleted) {
            throw new BadRequestError("Transaction has been completed before");
        }

        //  Get Meter
        const meter: Meter | null = await transactionRecord.$get("meter");
        if (!meter) {
            throw new InternalServerError(
                `Transaction ${transactionRecord.id} does not have a meter`
            );
        }

        const user = await transactionRecord.$get("user");
        if (!user) {
            throw new InternalServerError(
                `Transaction ${transactionRecord.id} does not have a user`
            );
        }

        const partner = await transactionRecord.$get("partner");
        const entity = await partner?.$get("entity");
        if (!entity) {
            throw new InternalServerError("Entity not found");
        }

        return {
            user,
            meter,
            transaction: transactionRecord,
            partnerEntity: entity,
        };
    }

    static getDiscos() { }

    static checkDisco() { }
}

export default class VendorController {
    static async validateMeter(req: Request, res: Response, next: NextFunction) {
        const {
            meterNumber,
            disco,
            phoneNumber,
            email,
            vendType,
        }: valideMeterRequestBody = req.body;
        const superagent = DEFAULT_ELECTRICITY_PROVIDER; // BUYPOWERNG or BAXI
        const partnerId = (req as any).key;

        const transaction: Transaction =
            await TransactionService.addTransactionWithoutValidatingUserRelationship({
                id: uuidv4(),
                amount: "0",
                status: Status.PENDING,
                superagent: superagent,
                paymentType: PaymentType.PAYMENT,
                transactionTimestamp: new Date(),
                disco: disco,
                partnerId: partnerId,
            });

        const transactionEventService = new EventService.transactionEventService(
            transaction, { meterNumber, disco, vendType }
        );

        await transactionEventService.addMeterValidationRequestedEvent();
        VendorPublisher.publishEventForMeterValidationRequested({
            meter: { meterNumber, disco, vendType },
            transactionId: transaction.id,
        });

        // We Check for Meter User *
        const response =
            superagent == "BUYPOWERNG"
                ? await VendorService.buyPowerValidateMeter({
                    transactionId: transaction.id,
                    meterNumber,
                    disco,
                    vendType,
                }).catch((e) => {
                    console.log(e)
                    throw new BadRequestError("Meter validation failed");
                })
                : await VendorService.baxiValidateMeter(
                    disco,
                    meterNumber,
                    vendType
                ).catch((e) => {
                    console.log(e)
                    throw new BadRequestError("Meter validation failed");
                });

        const userInfo = {
            name: response.name,
            email: email,
            address: response.address,
            phoneNumber: phoneNumber,
            id: uuidv4(),
        };

        await transactionEventService.addMeterValidationReceivedEvent({ user: userInfo });
        VendorPublisher.publishEventForMeterValidationReceived({
            meter: { meterNumber, disco, vendType },
            transactionId: transaction.id,
            user: userInfo,
        });

        await transactionEventService.addCRMUserInitiatedEvent({ user: userInfo });
        CRMPublisher.publishEventForInitiatedUser({
            user: userInfo,
            transactionId: transaction.id,
        })

        // Add User if no record of user in db
        const user = await UserService.addUserIfNotExists({
            id: userInfo.id,
            address: response.address,
            email: email,
            name: response.name,
            phoneNumber: phoneNumber,
        });

        await transaction.update({ userId: user.id });
        await transactionEventService.addCRMUserConfirmedEvent({ user: userInfo });
        CRMPublisher.publishEventForConfirmedUser({
            user: userInfo,
            transactionId: transaction.id,
        })

        // Check if disco is up
        const discoUp =
            superagent === "BUYPOWERNG"
                ? await VendorService.buyPowerCheckDiscoUp(disco).catch((e) => e)
                : await VendorService.baxiCheckDiscoUp(disco).catch((e) => e);

        const discoUpEvent = discoUp instanceof Boolean ? await transactionEventService.addDiscoUpEvent() : false
        discoUpEvent && VendorPublisher.publishEventForDiscoUpCheckConfirmedFromVendor({
            transactionId: transaction.id,
            meter: { meterNumber, disco, vendType },
        })

        // TODO: Publish event for disco up to kafka

        const meter: Meter = await MeterService.addMeter({
            id: uuidv4(),
            address: response.address,
            meterNumber: meterNumber,
            userId: user.id,
            disco: disco,
            vendType,
        });

        await transaction.update({ meterId: meter.id });

        const successful =
            transaction instanceof Transaction &&
            user instanceof User &&
            meter instanceof Meter;
        if (!successful)
            throw new InternalServerError("An error occured while validating meter");

        res.status(200).json({
            status: "success",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
                meter: {
                    disco: meter.disco,
                    number: meter.meterNumber,
                    address: meter.address,
                    phone: user.phoneNumber,
                    vendType: meter.vendType,
                    name: user.name,
                },
            },
        });

        await transactionEventService.addMeterValidationSentEvent(meter.id);
        VendorPublisher.publishEventForMeterValidationSentToPartner({
            transactionId: transaction.id,
            meter: { meterNumber, disco, vendType, id: meter.id },
        })
    }

    static async requestToken(req: Request, res: Response, next: NextFunction) {
        const { transactionId, bankRefId, bankComment, amount, vendType } =
            req.query as Record<string, any>;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const meter = await transaction.$get("meter");
        if (!meter) {
            throw new InternalServerError("Transaction does not have a meter");
        }

        const meterInfo = {
            meterNumber: meter.meterNumber,
            disco: transaction.disco,
            vendType: meter.vendType,
            id: meter.id,
        }
        const transactionEventService = new EventService.transactionEventService(transaction, meterInfo);
        await transactionEventService.addPowerPurchaseInitiatedEvent(bankRefId, amount);

        const { user, partnerEntity } = await VendorControllerValdator.requestToken({ bankRefId, transactionId });
        await TransactionService.updateSingleTransaction(
            transactionId,
            {
                bankRefId,
                bankComment,
                amount,
                status: Status.PENDING,
            });

        const vendorTokenConsumer = new VendorTokenReceivedSubscriber(transaction, res)
        await vendorTokenConsumer.start()
        try {
            const response = await VendorPublisher.publishEventForInitiatedPowerPurchase({
                transactionId: transaction.id,
                user: {
                    name: user.name as string,
                    email: user.email,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                },
                partner: {
                    email: partnerEntity.email,
                },
                meter: meterInfo
            })

            if (response instanceof Error) {
                throw error
            }

            const tokenHasBeenSentFromVendorConsumer = vendorTokenConsumer.getTokenSentState()
            if (!tokenHasBeenSentFromVendorConsumer) {
                res.status(200).json({
                    status: "success",
                    message: "Token purchase initiated successfully",
                    data: {
                        transaction: transaction,
                    },
                });

                return
            }

            await transactionEventService.addTokenSentToPartnerEvent();

            return
        } catch (error) {
            logger.error('SuttingDown vendor token consumer of id')
            await vendorTokenConsumer.shutdown()
        }
    }

    static async getDiscos(req: Request, res: Response) {
        let discos: { name: string; serviceType: "PREPAID" | "POSTPAID" }[] = [];

        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case "BAXI":
                discos = await VendorService.baxiFetchAvailableDiscos();
                break;
            case "BUYPOWERNG":
                discos = await VendorService.buyPowerFetchAvailableDiscos();
                break;
            default:
                discos = [];
                break;
        }

        res.status(200).json({
            status: "success",
            message: "Discos retrieved successfully",
            data: {
                discos: discos,
            },
        });
    }

    static async checkDisco(req: Request, res: Response) {
        const { disco } = req.query;

        let result = false;
        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case "BAXI":
                result = await VendorService.baxiCheckDiscoUp(disco as string);
                break;
            case "BUYPOWERNG":
                result = await VendorService.buyPowerCheckDiscoUp(disco as string);
                break;
            default:
                throw new InternalServerError("An error occured");
        }

        res.status(200).json({
            status: "success",
            message: "Disco check successful",
            data: {
                discAvailable: result,
            },
        });
    }

    static async confirmPayment(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) {
        const { bankRefId } = req.body;

        const transaction =
            await TransactionService.viewSingleTransactionByBankRefID(bankRefId);
        if (!transaction) throw new NotFoundError("Transaction not found");

        const meter = await transaction.$get("meter");
        if (!meter)
            throw new InternalServerError("Transaction does not have a meter");

        const partner = await transaction.$get("partner");
        const entity = await partner?.$get("entity");
        if (!entity) throw new InternalServerError("Entity not found");

        // Check event for request token
        const requestTokenEvent = await Event.findOne({
            where: { transactionId: transaction.id, eventType: "POWER_PURCHASE_INITIATED_BY_CUSTOMER" },
        });

        if (!requestTokenEvent) {
            throw new BadRequestError("Request token event not found");
        }

        new EventService.transactionEventService(transaction, {
            meterNumber: meter.meterNumber,
            disco: transaction.disco,
            vendType: meter.vendType as IMeter["vendType"],
        }).addPartnerTransactionCompleteEvent();

        res.status(200).json({
            status: "success",
            message: "Payment confirmed successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
                meter: {
                    disco: meter.disco,
                    number: meter.meterNumber,
                    address: meter.address,
                    phone: meter.userId,
                    vendType: meter.vendType,
                    name: meter.userId,
                },
            },
        });
    }
}
