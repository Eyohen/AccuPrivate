import { NextFunction, Request, Response } from "express";
import TransactionService from "../../../services/Transaction.service";
import Transaction, {
    PaymentType,
    Status,
    TransactionType,
} from "../../../models/Transaction.model";
import { v4 as uuidv4 } from "uuid";
import UserService from "../../../services/User.service";
import MeterService from "../../../services/Meter.service";
import User from "../../../models/User.model";
import Meter, { IMeter } from "../../../models/Meter.model";
import VendorService from "../../../services/Vendor.service";
import {
    DEFAULT_ELECTRICITY_PROVIDER,
    discoProductMapping,
} from "../../../utils/Constants";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from "../../../utils/Errors";
import Entity from "../../../models/Entity/Entity.model";
import EventService from "../../../services/Event.service";
import { AuthenticatedRequest } from "../../../utils/Interface";
import Event, { TokenRetryEventPayload } from "../../../models/Event.model";
import { VendorPublisher } from "../../../kafka/modules/publishers/Vendor";
import { CRMPublisher } from "../../../kafka/modules/publishers/Crm";
import { TokenHandlerUtil } from "../../../kafka/modules/consumers/Token";
import { TOPICS } from "../../../kafka/Constants";
import { PublisherEventAndParameters, Registry, TransactionErrorCause } from "../../../kafka/modules/util/Interface";
import { randomUUID } from "crypto";
import ConsumerFactory from "../../../kafka/modules/util/Consumer";
import MessageProcessorFactory from "../../../kafka/modules/util/MessageProcessor";
import logger from "../../../utils/Logger";
import { error } from "console";
import TransactionEventService from "../../../services/TransactionEvent.service";
import WebhookService from "../../../services/Webhook.service";
import { AirtimeVendController } from "./Airtime.controller";
import ProductCode from "../../../models/ProductCode.model";
import ProductService from "../../../services/ProductCode.service";
import VendorRates from "../../../models/VendorRates.model";

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
    private consumerInstance: ConsumerFactory

    private async handleTokenReceived(data: PublisherEventAndParameters[TOPICS.TOKEN_RECIEVED_FROM_VENDOR]) {
        try {
            if (this.consumerInstance) {
                this.consumerInstance.shutdown()
            }

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
        } catch (error) {
            logger.error('Error sending token to user')
        }
    }

    constructor(transaction: Transaction, response: Response) {
        this.transaction = transaction
        this.response = () => response
        return this
    }

    public getTokenState() {
        return this.tokenSent
    }

    public setConsumerInstance(consumerInstance: ConsumerFactory) {
        this.consumerInstance = consumerInstance
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

    public setConsumerInstance(consumerInstance: ConsumerFactory) {
        this.tokenHandler.setConsumerInstance(consumerInstance)
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

        const productCode = await ProductService.viewSingleProductCodeByCode(transactionRecord.disco, true)
        if (!productCode) {
            throw new NotFoundError('Product code not found')
        }


        const vendorDiscoCode = productCode.vendorRates.find((vendorRate) => {
            return vendorRate.vendorName === transactionRecord.superagent
        })?.discoCode

        if (!vendorDiscoCode) {
            throw new InternalServerError('Vendor disco code not found')
        }

        // Check if Disco is Up
        const checKDisco: boolean | Error =
            await VendorService.buyPowerCheckDiscoUp(vendorDiscoCode);
        if (!checKDisco && transactionRecord.superagent === 'BUYPOWERNG') throw new BadRequestError("Disco is currently down");

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


interface UserInfo {
    name: string,
    email: string,
    phoneNumber: string,
    id: string
}

interface ValidateMeterParams extends valideMeterRequestBody {
    transaction: Transaction,
    userInfo: UserInfo
}

interface RequestTokenUtilParams {
    transaction: Transaction,
    meterInfo: {
        meterNumber: string,
        disco: string,
        vendType: 'PREPAID' | 'POSTPAID',
        id: string,
    },
    previousRetryEvent: Event
}
class VendorControllerUtil {
    static async replayRequestToken({ transaction, meterInfo, previousRetryEvent }: RequestTokenUtilParams) {
        const transactionEventService = new TransactionEventService(
            transaction, meterInfo, transaction.superagent, transaction.partner.email
        )

        const eventPayload = JSON.parse(previousRetryEvent.payload) as TokenRetryEventPayload
        await TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor(
            {
                eventService: transactionEventService,
                eventData: {
                    meter: {
                        meterNumber: meterInfo.meterNumber,
                        disco: transaction.disco,
                        vendType: meterInfo.vendType,
                        id: meterInfo.id,
                    },
                    transactionId: transaction.id,
                    error: {
                        code: 100,
                        cause: TransactionErrorCause.UNKNOWN
                    },
                },
                tokenInResponse: null,
                transactionTimedOutFromBuypower: false,
                superAgent: transaction.superagent,
                retryCount: eventPayload.retryCount + 1
            }
        )
    }

    static async replayWebhookNotification({ transaction, meterInfo }: { transaction: Transaction, meterInfo: { meterNumber: string, disco: string, vendType: 'PREPAID' | 'POSTPAID', id: string } }) {
        const transactionEventService = new TransactionEventService(
            transaction, meterInfo, transaction.superagent,
            transaction.partner.email
        )

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User not found')
        }

        const powerUnit = await transaction.$get('powerUnit')
        if (!powerUnit) {
            throw new BadRequestError('Can not replay transaction if no powerunit')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        const webhook = await WebhookService.viewWebhookByPartnerId(partner.id)
        if (!webhook) {
            throw new InternalServerError('Webhook not found')
        }

        await transactionEventService.addWebHookNotificationRetryEvent({
            retryCount: 1,
            timeStamp: new Date(),
            url: webhook.url
        })
        await VendorPublisher.publishEventForWebhookNotificationToPartnerRetry({
            meter: { ...meterInfo, token: powerUnit.token },
            user: {
                name: user.name as string,
                ...user.dataValues
            },
            transactionId: transaction.id,
            partner: partner,
            retryCount: 1,
            superAgent: transaction.superagent,
        })
    }

    static async replayTokenSent({ transaction }: { transaction: Transaction }) {
        const powerUnit = await transaction.$get('powerUnit')
        if (!powerUnit) {
            throw new InternalServerError('Power unit not found')
        }

        const meter = await powerUnit.$get('meter')
        if (!meter) {
            throw new InternalServerError('Meter not found')
        }

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User not found')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner not found')
        }

        const transactionEventService = new TransactionEventService(
            transaction, {
            meterNumber: powerUnit.meter.meterNumber,
            disco: transaction.disco,
            vendType: powerUnit.meter.vendType as IMeter['vendType'],
        }, transaction.superagent, partner.email
        )

        await transactionEventService.addTokenSentToPartnerRetryEvent()
        await VendorPublisher.publishEventForTokenSentToPartnerRetry({
            meter: {
                meterNumber: meter.meterNumber,
                disco: transaction.disco,
                vendType: meter.vendType as IMeter['vendType'],
                id: meter.id,
                token: powerUnit.token
            },
            user: {
                name: user.name as string,
                ...user.dataValues
            },
            partner: partner,
            transactionId: transaction.id,
        })
    }

    static async validateMeter({ meterNumber, disco, vendType, transaction }: {
        meterNumber: string, disco: string, vendType: 'PREPAID' | 'POSTPAID', transaction: Transaction
    }) {
        if (transaction.superagent === 'BUYPOWERNG') {
            return await VendorService.buyPowerValidateMeter({
                transactionId: transaction.id,
                meterNumber,
                disco,
                vendType,
            })
        } else if (transaction.superagent === 'BAXI') {
            return await VendorService.baxiValidateMeter(disco, meterNumber, vendType)
        } else if (transaction.superagent === 'IRECHARGE') {
            const response = await VendorService.irechargeValidateMeter(disco, meterNumber, transaction.reference)
            return {
                name: response.customer.address,
                address: response.customer.address,
                access_token: response.access_token
            }
        } else {
            throw new BadRequestError('Invalid superagent')
        }
    }
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

        const existingProductCodeForDisco = await ProductService.viewSingleProductCodeByCode(disco, true)
        if (!existingProductCodeForDisco) {
            throw new NotFoundError('Product code not found for disco')
        }

        if (existingProductCodeForDisco.type !== 'ELECTRICITY') {
            throw new BadRequestError('Invalid product code for electricity')
        }

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
                transactionType: TransactionType.ELECTRICITY,
                productCodeId: existingProductCodeForDisco.id,
                previousVendors: [DEFAULT_ELECTRICITY_PROVIDER]
            });

        const transactionEventService = new EventService.transactionEventService(
            transaction, { meterNumber, disco, vendType }, superagent, transaction.partner.email
        );

        await transactionEventService.addMeterValidationRequestedEvent();
        await VendorPublisher.publishEventForMeterValidationRequested({
            meter: { meterNumber, disco, vendType },
            transactionId: transaction.id,
            superAgent: superagent
        });

        const vendorDiscoCode = existingProductCodeForDisco.vendorRates.find((vendorRate) => {
            console.log({ vendorRate: vendorRate.dataValues })
            return vendorRate.vendorName === DEFAULT_ELECTRICITY_PROVIDER
        })?.discoCode

        if (!vendorDiscoCode) {
            throw new InternalServerError('Vendor disco code not found')
        }

        // We Check for Meter User *
        const response = await VendorControllerUtil.validateMeter({ meterNumber, disco: vendorDiscoCode, vendType, transaction })
        const userInfo = {
            name: response.name,
            email: email,
            address: response.address,
            phoneNumber: phoneNumber,
            id: uuidv4(),
        };

        await transactionEventService.addMeterValidationReceivedEvent({ user: userInfo });
        await VendorPublisher.publishEventForMeterValidationReceived({
            meter: { meterNumber, disco, vendType },
            transactionId: transaction.id,
            user: userInfo,
        });

        await transactionEventService.addCRMUserInitiatedEvent({ user: userInfo });
        await CRMPublisher.publishEventForInitiatedUser({
            user: userInfo,
            transactionId: transaction.id,
        })

        // // Add User if no record of user in db
        const user = await UserService.addUserIfNotExists({
            id: userInfo.id,
            address: response.address,
            email: email,
            name: response.name,
            phoneNumber: phoneNumber,
        });


        if (!user)
            throw new InternalServerError("An error occured while validating meter");


        await transaction.update({ userId: user?.id, irecharge_token: (response as any).access_token });
        await transactionEventService.addCRMUserConfirmedEvent({ user: userInfo });
        await CRMPublisher.publishEventForConfirmedUser({
            user: userInfo,
            transactionId: transaction.id,
        })

        // Check if disco is up
        const discoUp =
            superagent === "BUYPOWERNG"
                ? await VendorService.buyPowerCheckDiscoUp(vendorDiscoCode).catch((e) => e)
                : await VendorService.baxiCheckDiscoUp(vendorDiscoCode).catch((e) => e);

        const discoUpEvent = discoUp instanceof Boolean ? await transactionEventService.addDiscoUpEvent() : false
        discoUpEvent && await VendorPublisher.publishEventForDiscoUpCheckConfirmedFromVendor({
            transactionId: transaction.id,
            meter: { meterNumber, disco, vendType },
        })

        // // TODO: Publish event for disco up to kafka

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
        await VendorPublisher.publishEventForMeterValidationSentToPartner({
            transactionId: transaction.id,
            meter: { meterNumber, disco, vendType, id: meter.id },
        })
    }

    static async requestToken(req: Request, res: Response, next: NextFunction) {
        const { transactionId, bankComment, amount, vendType } =
            req.query as Record<string, any>;
        console.log({ transactionId, bankComment, amount, vendType })
        const bankRefId = process.env.LOAD_TEST_MODE ? randomUUID() : req.body.bankRefId;
        if (parseInt(amount) < 500) {
            throw new BadRequestError("Amount must be greater than 500");
        }

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const meter = await transaction.$get("meter");
        if (!meter) {
            throw new InternalServerError("Transaction does not have a meter");
        }


        const productCode = await ProductService.viewSingleProductCodeByCode(transaction.disco, true)
        if (!productCode) {
            throw new NotFoundError('Product code not found')
        }

        const vendorDiscoCode = productCode.vendorRates.find((vendorRate) => {
            return vendorRate.vendorName === transaction.superagent
        })?.discoCode

        if (!vendorDiscoCode) {
            throw new InternalServerError('Vendor disco code not found')
        }

        const meterInfo = {
            meterNumber: meter.meterNumber,
            disco: vendorDiscoCode,
            vendType: meter.vendType,
            id: meter.id,
        }
        const transactionEventService = new EventService.transactionEventService(transaction, meterInfo, transaction.superagent, transaction.partner.email);
        await transactionEventService.addPowerPurchaseInitiatedEvent(bankRefId, amount);

        const { user, partnerEntity } = await VendorControllerValdator.requestToken({ bankRefId, transactionId });
        await transaction.update({
            bankRefId: bankRefId,
            bankComment,
            amount,
            status: Status.PENDING,
        });

        const vendorTokenConsumer = new VendorTokenReceivedSubscriber(transaction, res)
        await vendorTokenConsumer.start()
        vendorTokenConsumer.setConsumerInstance(vendorTokenConsumer)
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
                meter: meterInfo,
                superAgent: transaction.superagent,
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
                        transaction: await TransactionService.viewSingleTransaction(transactionId),
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

    private static getTransactionStage(events: Event[]) {
        /**
         * The events are in groups, if the last event in the group is not complete, then the transaction is still in that stage
         * 
         * METER_VALIDATION stage - METER_VALIDATION_REQUEST_SENT_TO_VENDOR, METER_VALIDATION_RECIEVED_FROM_VENDOR
         * CREATE_USER stage - CREATE_USER_INITIATED, CREATE_USER_CONFIRMED
         * POWER_PURCHASE stage - POWER_PURCHASE_INITIATED_BY_CUSTOMER, TOKEN_RECIEVED_FROM_VENDOR
         *      Power purchase has other stages that may occur due to error
         *      GET_TRANSACTION_TOKEN stage - GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED, GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY, GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR
         * 
         * WEBHOOK_NOTIFICATION stage - WEBHOOK_NOTIFICATION_SENT_TO_PARTNER, WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER
         * TOKEN_SENT stage - TOKEN_SENT_TO_PARTNER, TOKEN_SENT_TO_EMAIL, TOKEN_SENT_TO_NUMBER
         * PARTNER_TRANSACTION_COMPLETE stage - PARTNER_TRANSACTION_COMPLETE
         */

        /**
         * Find the stage that the transaction is in, then continue from there
         * 
         * If transaction is in power purchase stage, check if it is in the GET_TRANSACTION_TOKEN stage
         */

        const stages = {
            METER_VALIDATION: [
                TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR, TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR, TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR,
            ],
            CREATE_USER: [
                TOPICS.CREATE_USER_INITIATED, TOPICS.CREATE_USER_CONFIRMED
            ],
            POWER_PURCHASE: [
                TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER, TOPICS.TOKEN_RECIEVED_FROM_VENDOR
            ],
            GET_TRANSACTION_TOKEN: [
                TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED, TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY, TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR
            ],
            WEBHOOK_NOTIFICATION: [
                TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER, TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER
            ],
            TOKEN_SENT: [
                TOPICS.TOKEN_SENT_TO_PARTNER, TOPICS.TOKEN_SENT_TO_EMAIL, TOPICS.TOKEN_SENT_TO_NUMBER
            ],
            PARTNER_TRANSACTION_COMPLETE: [
                TOPICS.PARTNER_TRANSACTION_COMPLETE
            ]
        }

        const stagesKeys = Object.keys(stages) as (keyof typeof stages)[]

        // Sort events by timestamp
        const sortedEvents = events.sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime()
        })

        // Get the last event for the transaction
        const lastEventInTransaction = sortedEvents[sortedEvents.length - 1]

        // Find the stage that the latest event belongs to
        const stage = stagesKeys.find((stage) => {
            const stageEvents = stages[stage]
            return stageEvents.includes(lastEventInTransaction.eventType)
        })

        return { stage, lastEventInTransaction }
    }

    static async replayTransaction(req: Request, res: Response, next: NextFunction) {
        const { eventId } = req.body

        const event = await EventService.viewSingleEvent(eventId)
        if (!event) {
            throw new NotFoundError('Event not found')
        }

        const transaction = await TransactionService.viewSingleTransaction(event.transactionId)
        if (!transaction) {
            throw new NotFoundError('Transaction not found')
        }

        const { stage, lastEventInTransaction } = this.getTransactionStage(await transaction.$get('events'))

        const meter = await transaction.$get('meter')
        if (!meter) {
            throw new InternalServerError('Meter not found for replayed transaction')
        }

        switch (stage) {
            case 'GET_TRANSACTION_TOKEN':
                await VendorControllerUtil.replayRequestToken({
                    transaction,
                    meterInfo: {
                        meterNumber: meter.meterNumber,
                        disco: transaction.disco,
                        vendType: meter.vendType,
                        id: meter.id,
                    },
                    previousRetryEvent: lastEventInTransaction
                })
                break
            case 'WEBHOOK_NOTIFICATION':
                await VendorControllerUtil.replayWebhookNotification({
                    meterInfo: {
                        meterNumber: meter.meterNumber,
                        disco: transaction.disco,
                        vendType: meter.vendType,
                        id: meter.id,
                    },
                    transaction,
                })
                break
            case 'TOKEN_SENT':
                await VendorControllerUtil.replayTokenSent({
                    transaction,
                })
            default:
                throw new BadRequestError('Transaction cannot be replayed')
        }

        res.status(200).json({
            status: 'success',
            message: 'Transaction replayed successfully',
            data: {
                transaction: await TransactionService.viewSingleTransaction(transaction.id)
            }
        })

    }

    static async getDiscos(req: Request, res: Response) {
        const productCodes = await ProductService.getAllProductCodes(true);

        res.status(200).json({
            status: "success",
            message: "Discos retrieved successfully",
            data: {
                productCodes,
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

        if (transaction.transactionType === TransactionType.AIRTIME) {
            return await AirtimeVendController.confirmPayment(req, res, next)
        }

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
        }, transaction.superagent, transaction.partner.email).addPartnerTransactionCompleteEvent();

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
