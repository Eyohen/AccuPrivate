"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_service_1 = __importDefault(require("../../services/Transaction.service"));
const Transaction_model_1 = __importStar(require("../../models/Transaction.model"));
const uuid_1 = require("uuid");
const User_service_1 = __importDefault(require("../../services/User.service"));
const Meter_service_1 = __importDefault(require("../../services/Meter.service"));
const User_model_1 = __importDefault(require("../../models/User.model"));
const Meter_model_1 = __importDefault(require("../../models/Meter.model"));
const Vendor_service_1 = __importDefault(require("../../services/Vendor.service"));
const Constants_1 = require("../../utils/Constants");
const Errors_1 = require("../../utils/Errors");
const Event_service_1 = __importDefault(require("../../services/Event.service"));
const Event_model_1 = __importDefault(require("../../models/Event.model"));
const Vendor_1 = require("../../kafka/modules/publishers/Vendor");
const Crm_1 = require("../../kafka/modules/publishers/Crm");
const Token_1 = require("../../kafka/modules/consumers/Token");
const Constants_2 = require("../../kafka/Constants");
const Interface_1 = require("../../kafka/modules/util/Interface");
const crypto_1 = require("crypto");
const Consumer_1 = __importDefault(require("../../kafka/modules/util/Consumer"));
const MessageProcessor_1 = __importDefault(require("../../kafka/modules/util/MessageProcessor"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
const console_1 = require("console");
const TransactionEvent_service_1 = __importDefault(require("../../services/TransactionEvent.service"));
const Webhook_service_1 = __importDefault(require("../../services/Webhook.service"));
class VendorTokenHandler {
    handleTokenReceived(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.response().status(200).send({
                status: 'success',
                message: 'Token purchase initiated successfully',
                data: {
                    transaction: this.transaction,
                    meter: data.meter,
                    token: data.meter.token
                }
            });
            this.tokenSent = true;
        });
    }
    constructor(transaction, response) {
        this.tokenSent = false;
        this.registry = {
            [Constants_2.TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: this.handleTokenReceived.bind(this)
        };
        this.transaction = transaction;
        this.response = () => response;
        return this;
    }
    getTokenState() {
        return this.tokenSent;
    }
}
class VendorTokenReceivedSubscriber extends Consumer_1.default {
    constructor(transaction, response) {
        const tokenHandler = new VendorTokenHandler(transaction, response);
        const messageProcessor = new MessageProcessor_1.default(tokenHandler.registry, (0, crypto_1.randomUUID)());
        super(messageProcessor);
        this.tokenHandler = tokenHandler;
    }
    getTokenSentState() {
        return this.tokenHandler.getTokenState();
    }
}
// Validate request parameters for each controller
class VendorControllerValdator {
    static validateMeter() { }
    static requestToken({ bankRefId, transactionId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bankRefId)
                throw new Errors_1.BadRequestError("Transaction reference is required");
            const transactionRecord = yield Transaction_service_1.default.viewSingleTransaction(transactionId);
            if (!transactionRecord) {
                throw new Errors_1.BadRequestError("Transaction does not exist");
            }
            // Check if Disco is Up
            const checKDisco = yield Vendor_service_1.default.buyPowerCheckDiscoUp(transactionRecord.disco);
            if (!checKDisco)
                throw new Errors_1.BadRequestError("Disco is currently down");
            // Check if bankRefId has been used before
            const existingTransaction = yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId);
            if (existingTransaction instanceof Transaction_model_1.default) {
                throw new Errors_1.BadRequestError("Bank reference has been used before");
            }
            const transactionHasCompleted = transactionRecord.status === Transaction_model_1.Status.COMPLETE;
            if (transactionHasCompleted) {
                throw new Errors_1.BadRequestError("Transaction has been completed before");
            }
            //  Get Meter
            const meter = yield transactionRecord.$get("meter");
            if (!meter) {
                throw new Errors_1.InternalServerError(`Transaction ${transactionRecord.id} does not have a meter`);
            }
            const user = yield transactionRecord.$get("user");
            if (!user) {
                throw new Errors_1.InternalServerError(`Transaction ${transactionRecord.id} does not have a user`);
            }
            const partner = yield transactionRecord.$get("partner");
            const entity = yield (partner === null || partner === void 0 ? void 0 : partner.$get("entity"));
            if (!entity) {
                throw new Errors_1.InternalServerError("Entity not found");
            }
            return {
                user,
                meter,
                transaction: transactionRecord,
                partnerEntity: entity,
            };
        });
    }
    static getDiscos() { }
    static checkDisco() { }
}
class VendorControllerUtil {
    static replayRequestToken({ transaction, meterInfo, previousRetryEvent }) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionEventService = new TransactionEvent_service_1.default(transaction, meterInfo, transaction.superagent, transaction.partner.email);
            const eventPayload = JSON.parse(previousRetryEvent.payload);
            yield Token_1.TokenHandlerUtil.triggerEventToRequeryTransactionTokenFromVendor({
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
                        cause: Interface_1.TransactionErrorCause.UNKNOWN
                    },
                },
                tokenInResponse: null,
                transactionTimedOutFromBuypower: false,
                superAgent: transaction.superagent,
                retryCount: eventPayload.retryCount + 1
            });
        });
    }
    static replayWebhookNotification({ transaction, meterInfo }) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionEventService = new TransactionEvent_service_1.default(transaction, meterInfo, transaction.superagent, transaction.partner.email);
            const user = yield transaction.$get('user');
            if (!user) {
                throw new Errors_1.InternalServerError('User not found');
            }
            const powerUnit = yield transaction.$get('powerUnit');
            if (!powerUnit) {
                throw new Errors_1.BadRequestError('Can not replay transaction if no powerunit');
            }
            const partner = yield transaction.$get('partner');
            if (!partner) {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            const webhook = yield Webhook_service_1.default.viewWebhookByPartnerId(partner.id);
            if (!webhook) {
                throw new Errors_1.InternalServerError('Webhook not found');
            }
            yield transactionEventService.addWebHookNotificationRetryEvent({
                retryCount: 1,
                timeStamp: new Date(),
                url: webhook.url
            });
            yield Vendor_1.VendorPublisher.publishEventForWebhookNotificationToPartnerRetry({
                meter: Object.assign(Object.assign({}, meterInfo), { token: powerUnit.token }),
                user: Object.assign({ name: user.name }, user.dataValues),
                transactionId: transaction.id,
                partner: partner,
                retryCount: 1,
                superAgent: transaction.superagent,
            });
        });
    }
    static replayTokenSent({ transaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnit = yield transaction.$get('powerUnit');
            if (!powerUnit) {
                throw new Errors_1.InternalServerError('Power unit not found');
            }
            const meter = yield powerUnit.$get('meter');
            if (!meter) {
                throw new Errors_1.InternalServerError('Meter not found');
            }
            const user = yield transaction.$get('user');
            if (!user) {
                throw new Errors_1.InternalServerError('User not found');
            }
            const partner = yield transaction.$get('partner');
            if (!partner) {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            const transactionEventService = new TransactionEvent_service_1.default(transaction, {
                meterNumber: powerUnit.meter.meterNumber,
                disco: transaction.disco,
                vendType: powerUnit.meter.vendType,
            }, transaction.superagent, partner.email);
            yield transactionEventService.addTokenSentToPartnerRetryEvent();
            yield Vendor_1.VendorPublisher.publishEventForTokenSentToPartnerRetry({
                meter: {
                    meterNumber: meter.meterNumber,
                    disco: transaction.disco,
                    vendType: meter.vendType,
                    id: meter.id,
                    token: powerUnit.token
                },
                user: Object.assign({ name: user.name }, user.dataValues),
                partner: partner,
                transactionId: transaction.id,
            });
        });
    }
    static validateMeter({ meterNumber, disco, vendType, transaction }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transaction.superagent === 'BUYPOWERNG') {
                return yield Vendor_service_1.default.buyPowerValidateMeter({
                    transactionId: transaction.id,
                    meterNumber,
                    disco,
                    vendType,
                });
            }
            else if (transaction.superagent === 'BAXI') {
                return yield Vendor_service_1.default.baxiValidateMeter(disco, meterNumber, vendType);
            }
            else if (transaction.superagent === 'IRECHARGE') {
                return yield Vendor_service_1.default.irechargeValidateMeter(disco, meterNumber, transaction.reference);
            }
            else {
                throw new Errors_1.BadRequestError('Invalid superagent');
            }
        });
    }
}
class VendorController {
    static validateMeter(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { meterNumber, disco, phoneNumber, email, vendType, } = req.body;
            const superagent = Constants_1.DEFAULT_ELECTRICITY_PROVIDER; // BUYPOWERNG or BAXI
            const partnerId = req.key;
            const transaction = yield Transaction_service_1.default.addTransactionWithoutValidatingUserRelationship({
                id: (0, uuid_1.v4)(),
                amount: "0",
                status: Transaction_model_1.Status.PENDING,
                superagent: superagent,
                paymentType: Transaction_model_1.PaymentType.PAYMENT,
                transactionTimestamp: new Date(),
                disco: disco,
                partnerId: partnerId,
            });
            const transactionEventService = new Event_service_1.default.transactionEventService(transaction, { meterNumber, disco, vendType }, superagent, transaction.partner.email);
            yield transactionEventService.addMeterValidationRequestedEvent();
            Vendor_1.VendorPublisher.publishEventForMeterValidationRequested({
                meter: { meterNumber, disco, vendType },
                transactionId: transaction.id,
                superAgent: superagent
            });
            // We Check for Meter User *
            const response = yield VendorControllerUtil.validateMeter({ meterNumber, disco, vendType, transaction });
            const userInfo = {
                name: response.name,
                email: email,
                address: response.address,
                phoneNumber: phoneNumber,
                id: (0, uuid_1.v4)(),
            };
            yield transactionEventService.addMeterValidationReceivedEvent({ user: userInfo });
            Vendor_1.VendorPublisher.publishEventForMeterValidationReceived({
                meter: { meterNumber, disco, vendType },
                transactionId: transaction.id,
                user: userInfo,
            });
            yield transactionEventService.addCRMUserInitiatedEvent({ user: userInfo });
            Crm_1.CRMPublisher.publishEventForInitiatedUser({
                user: userInfo,
                transactionId: transaction.id,
            });
            // Add User if no record of user in db
            const user = yield User_service_1.default.addUserIfNotExists({
                id: userInfo.id,
                address: response.address,
                email: email,
                name: response.name,
                phoneNumber: phoneNumber,
            });
            if (!user)
                throw new Errors_1.InternalServerError("An error occured while validating meter");
            yield transaction.update({ userId: user === null || user === void 0 ? void 0 : user.id });
            yield transactionEventService.addCRMUserConfirmedEvent({ user: userInfo });
            Crm_1.CRMPublisher.publishEventForConfirmedUser({
                user: userInfo,
                transactionId: transaction.id,
            });
            // Check if disco is up
            const discoUp = superagent === "BUYPOWERNG"
                ? yield Vendor_service_1.default.buyPowerCheckDiscoUp(disco).catch((e) => e)
                : yield Vendor_service_1.default.baxiCheckDiscoUp(disco).catch((e) => e);
            const discoUpEvent = discoUp instanceof Boolean ? yield transactionEventService.addDiscoUpEvent() : false;
            discoUpEvent && Vendor_1.VendorPublisher.publishEventForDiscoUpCheckConfirmedFromVendor({
                transactionId: transaction.id,
                meter: { meterNumber, disco, vendType },
            });
            // TODO: Publish event for disco up to kafka
            const meter = yield Meter_service_1.default.addMeter({
                id: (0, uuid_1.v4)(),
                address: response.address,
                meterNumber: meterNumber,
                userId: user.id,
                disco: disco,
                vendType,
            });
            yield transaction.update({ meterId: meter.id });
            const successful = transaction instanceof Transaction_model_1.default &&
                user instanceof User_model_1.default &&
                meter instanceof Meter_model_1.default;
            if (!successful)
                throw new Errors_1.InternalServerError("An error occured while validating meter");
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
            yield transactionEventService.addMeterValidationSentEvent(meter.id);
            Vendor_1.VendorPublisher.publishEventForMeterValidationSentToPartner({
                transactionId: transaction.id,
                meter: { meterNumber, disco, vendType, id: meter.id },
            });
        });
    }
    static requestToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transactionId, bankRefId, bankComment, amount, vendType } = req.query;
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(transactionId);
            if (!transaction) {
                throw new Errors_1.NotFoundError("Transaction not found");
            }
            const meter = yield transaction.$get("meter");
            if (!meter) {
                throw new Errors_1.InternalServerError("Transaction does not have a meter");
            }
            const meterInfo = {
                meterNumber: meter.meterNumber,
                disco: transaction.disco,
                vendType: meter.vendType,
                id: meter.id,
            };
            const transactionEventService = new Event_service_1.default.transactionEventService(transaction, meterInfo, transaction.superagent, transaction.partner.email);
            yield transactionEventService.addPowerPurchaseInitiatedEvent(bankRefId, amount);
            const { user, partnerEntity } = yield VendorControllerValdator.requestToken({ bankRefId, transactionId });
            yield Transaction_service_1.default.updateSingleTransaction(transactionId, {
                bankRefId,
                bankComment,
                amount,
                status: Transaction_model_1.Status.PENDING,
            });
            const vendorTokenConsumer = new VendorTokenReceivedSubscriber(transaction, res);
            yield vendorTokenConsumer.start();
            try {
                const response = yield Vendor_1.VendorPublisher.publishEventForInitiatedPowerPurchase({
                    transactionId: transaction.id,
                    user: {
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                    },
                    partner: {
                        email: partnerEntity.email,
                    },
                    meter: meterInfo,
                    superAgent: transaction.superagent,
                });
                if (response instanceof Error) {
                    throw console_1.error;
                }
                const tokenHasBeenSentFromVendorConsumer = vendorTokenConsumer.getTokenSentState();
                if (!tokenHasBeenSentFromVendorConsumer) {
                    res.status(200).json({
                        status: "success",
                        message: "Token purchase initiated successfully",
                        data: {
                            transaction: yield Transaction_service_1.default.viewSingleTransaction(transactionId),
                        },
                    });
                    return;
                }
                yield transactionEventService.addTokenSentToPartnerEvent();
                return;
            }
            catch (error) {
                Logger_1.default.error('SuttingDown vendor token consumer of id');
                yield vendorTokenConsumer.shutdown();
            }
        });
    }
    static getTransactionStage(events) {
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
                Constants_2.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR, Constants_2.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR, Constants_2.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR,
            ],
            CREATE_USER: [
                Constants_2.TOPICS.CREATE_USER_INITIATED, Constants_2.TOPICS.CREATE_USER_CONFIRMED
            ],
            POWER_PURCHASE: [
                Constants_2.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER, Constants_2.TOPICS.TOKEN_RECIEVED_FROM_VENDOR
            ],
            GET_TRANSACTION_TOKEN: [
                Constants_2.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED, Constants_2.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY, Constants_2.TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR
            ],
            WEBHOOK_NOTIFICATION: [
                Constants_2.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER, Constants_2.TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER
            ],
            TOKEN_SENT: [
                Constants_2.TOPICS.TOKEN_SENT_TO_PARTNER, Constants_2.TOPICS.TOKEN_SENT_TO_EMAIL, Constants_2.TOPICS.TOKEN_SENT_TO_NUMBER
            ],
            PARTNER_TRANSACTION_COMPLETE: [
                Constants_2.TOPICS.PARTNER_TRANSACTION_COMPLETE
            ]
        };
        const stagesKeys = Object.keys(stages);
        // Sort events by timestamp
        const sortedEvents = events.sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
        // Get the last event for the transaction
        const lastEventInTransaction = sortedEvents[sortedEvents.length - 1];
        // Find the stage that the latest event belongs to
        const stage = stagesKeys.find((stage) => {
            const stageEvents = stages[stage];
            return stageEvents.includes(lastEventInTransaction.eventType);
        });
        return { stage, lastEventInTransaction };
    }
    static replayTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { eventId } = req.body;
            const event = yield Event_service_1.default.viewSingleEvent(eventId);
            if (!event) {
                throw new Errors_1.NotFoundError('Event not found');
            }
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(event.transactionId);
            if (!transaction) {
                throw new Errors_1.NotFoundError('Transaction not found');
            }
            const { stage, lastEventInTransaction } = this.getTransactionStage(yield transaction.$get('events'));
            const meter = yield transaction.$get('meter');
            if (!meter) {
                throw new Errors_1.InternalServerError('Meter not found for replayed transaction');
            }
            switch (stage) {
                case 'GET_TRANSACTION_TOKEN':
                    yield VendorControllerUtil.replayRequestToken({
                        transaction,
                        meterInfo: {
                            meterNumber: meter.meterNumber,
                            disco: transaction.disco,
                            vendType: meter.vendType,
                            id: meter.id,
                        },
                        previousRetryEvent: lastEventInTransaction
                    });
                    break;
                case 'WEBHOOK_NOTIFICATION':
                    yield VendorControllerUtil.replayWebhookNotification({
                        meterInfo: {
                            meterNumber: meter.meterNumber,
                            disco: transaction.disco,
                            vendType: meter.vendType,
                            id: meter.id,
                        },
                        transaction,
                    });
                    break;
                case 'TOKEN_SENT':
                    yield VendorControllerUtil.replayTokenSent({
                        transaction,
                    });
                default:
                    throw new Errors_1.BadRequestError('Transaction cannot be replayed');
            }
            res.status(200).json({
                status: 'success',
                message: 'Transaction replayed successfully',
                data: {
                    transaction: yield Transaction_service_1.default.viewSingleTransaction(transaction.id)
                }
            });
        });
    }
    static getDiscos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let discos = [];
            switch (Constants_1.DEFAULT_ELECTRICITY_PROVIDER) {
                case "BAXI":
                    discos = yield Vendor_service_1.default.baxiFetchAvailableDiscos();
                    break;
                case "BUYPOWERNG":
                    discos = yield Vendor_service_1.default.buyPowerFetchAvailableDiscos();
                    break;
                case 'IRECHARGE':
                    discos = yield Vendor_service_1.default.irechargeFetchAvailableDiscos();
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
        });
    }
    static checkDisco(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { disco } = req.query;
            let result = false;
            switch (Constants_1.DEFAULT_ELECTRICITY_PROVIDER) {
                case "BAXI":
                    result = yield Vendor_service_1.default.baxiCheckDiscoUp(disco);
                    break;
                case "BUYPOWERNG":
                    result = yield Vendor_service_1.default.buyPowerCheckDiscoUp(disco);
                    break;
                default:
                    throw new Errors_1.InternalServerError("An error occured");
            }
            res.status(200).json({
                status: "success",
                message: "Disco check successful",
                data: {
                    discAvailable: result,
                },
            });
        });
    }
    static confirmPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankRefId } = req.body;
            const transaction = yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId);
            if (!transaction)
                throw new Errors_1.NotFoundError("Transaction not found");
            const meter = yield transaction.$get("meter");
            if (!meter)
                throw new Errors_1.InternalServerError("Transaction does not have a meter");
            const partner = yield transaction.$get("partner");
            const entity = yield (partner === null || partner === void 0 ? void 0 : partner.$get("entity"));
            if (!entity)
                throw new Errors_1.InternalServerError("Entity not found");
            // Check event for request token
            const requestTokenEvent = yield Event_model_1.default.findOne({
                where: { transactionId: transaction.id, eventType: "POWER_PURCHASE_INITIATED_BY_CUSTOMER" },
            });
            if (!requestTokenEvent) {
                throw new Errors_1.BadRequestError("Request token event not found");
            }
            new Event_service_1.default.transactionEventService(transaction, {
                meterNumber: meter.meterNumber,
                disco: transaction.disco,
                vendType: meter.vendType,
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
        });
    }
}
exports.default = VendorController;
