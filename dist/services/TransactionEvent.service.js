"use strict";
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
exports.AirtimeTransactionEventService = void 0;
const Constants_1 = require("../kafka/Constants");
const Vendor_1 = require("../kafka/modules/publishers/Vendor");
const Event_model_1 = require("../models/Event.model");
const Event_service_1 = __importDefault(require("./Event.service"));
const uuid_1 = require("uuid");
const EventAndPublishers = {
    [Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: Vendor_1.VendorPublisher.publishEventForInitiatedPowerPurchase,
    [Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: Vendor_1.VendorPublisher.publishEventForTokenReceivedFromVendor,
    [Constants_1.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR]: Vendor_1.VendorPublisher.publishEventForMeterValidationRequested,
    [Constants_1.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR]: Vendor_1.VendorPublisher.publishEventForMeterValidationReceived,
};
class EventPublisher {
    constructor({ event, params }) {
        this.event = event;
        event.eventType;
        this.publisher = EventAndPublishers[event.eventType];
        this.args = params;
    }
    publish() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.publisher(...this.args);
        });
    }
    getEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.event;
        });
    }
}
class AirtimeTransactionEventService {
    constructor(transaction, superAgent, partner, phoneNumber) {
        this.transaction = transaction;
        this.superAgent = superAgent;
        this.partner = partner;
        this.phoneNumber = phoneNumber;
    }
    addPhoneNumberValidationRequestedEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.PHONENUMBER_VALIDATION_REQUESTED_FROM_PARTNER,
                eventText: Constants_1.TOPICS.PHONENUMBER_VALIDATION_REQUESTED_FROM_PARTNER,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addPhoneNumberValidationSuccessEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.PHONENUMBER_VALIDATION_SUCCESS,
                eventText: Constants_1.TOPICS.PHONENUMBER_VALIDATION_SUCCESS,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addCRMUserInitiatedEvent(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.CREATE_USER_INITIATED,
                eventText: Constants_1.TOPICS.CREATE_USER_INITIATED,
                payload: JSON.stringify({
                    user: {
                        id: info.user.id,
                        name: info.user.name,
                        email: info.user.email,
                        phoneNumber: info.user.phoneNumber,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addCRMUserConfirmedEvent(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.CREATE_USER_CONFIRMED,
                eventText: Constants_1.TOPICS.CREATE_USER_CONFIRMED,
                payload: JSON.stringify({
                    user: {
                        id: info.user.id,
                        name: info.user.name,
                        email: info.user.email,
                        address: info.user.address,
                        phoneNumber: info.user.phoneNumber,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimePurchaseInitiatedEvent({ amount }) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER,
                eventText: Constants_1.TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    amount: amount
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimePurchaseConfirmedEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.AIRTIME_TRANSACTION_COMPLETE,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addVendAirtimeRequestedFromVendorEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.VEND_AIRTIME_REQUESTED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.VEND_AIRTIME_REQUESTED_FROM_VENDOR,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addRequestTimedOutEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.REQUEST_TIMEDOUT,
                eventText: Constants_1.TOPICS.REQUEST_TIMEDOUT,
                payload: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addGetAirtimeFromVendorRetryEvent(error, retryCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY,
                eventText: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    error,
                    retryCount
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimePurchaseWithNewVendorEvent({ currentVendor, newVendor }) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.RETRY_AIRTIME_PURCHASE_FROM_NEW_VENDOR,
                eventText: Constants_1.TOPICS.RETRY_AIRTIME_PURCHASE_FROM_NEW_VENDOR,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    currentSuperAgent: currentVendor,
                    newSuperAgent: newVendor,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeReceivedFromVendorEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeTransactionRequery() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_TRANSACTION_REQUERY,
                eventText: Constants_1.TOPICS.AIRTIME_TRANSACTION_REQUERY,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    phoneNumber: this.phoneNumber,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeTranasctionRequeryInitiated() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_TRANSACTION_REQUERY_INITIATED,
                eventText: Constants_1.TOPICS.AIRTIME_TRANSACTION_REQUERY_INITIATED,
                payload: JSON.stringify({
                    phone: {
                        phoneNumber: this.phoneNumber,
                        amount: this.transaction.amount,
                    },
                    transactionId: this.transaction.id,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeWebhookNotificationSent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                eventText: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                payload: JSON.stringify({
                    phone: {
                        phoneNumber: this.phoneNumber,
                        amount: this.transaction.amount,
                    },
                    transactionId: this.transaction.id,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.PENDING,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeWebhookNotificationConfirmed() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
                eventText: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
                payload: JSON.stringify({
                    phone: {
                        phoneNumber: this.phoneNumber,
                        amount: this.transaction.amount,
                    },
                    transactionId: this.transaction.id,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeSentToPartner() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_SENT_TO_PARTNER,
                eventText: Constants_1.TOPICS.AIRTIME_SENT_TO_PARTNER,
                payload: JSON.stringify({
                    phone: {
                        phoneNumber: this.phoneNumber,
                        amount: this.transaction.amount,
                    },
                    transactionId: this.transaction.id,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addAirtimeSentToUserEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.AIRTIME_SENT_TO_USER_EMAIL,
                eventText: Constants_1.TOPICS.AIRTIME_SENT_TO_USER_EMAIL,
                payload: JSON.stringify({
                    phone: {
                        phoneNumber: this.phoneNumber,
                        amount: this.transaction.amount,
                    },
                    transactionId: this.transaction.id,
                    disco: this.transaction.disco,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
}
exports.AirtimeTransactionEventService = AirtimeTransactionEventService;
class TransactionEventService {
    constructor(transaction, meterInfo, superAgent, partner) {
        this.transaction = transaction;
        this.meterInfo = meterInfo;
        this.superAgent = superAgent;
        this.partner = partner;
    }
    getMeterInfo() {
        return this.meterInfo;
    }
    getTransactionInfo() {
        return this.transaction;
    }
    addMeterValidationRequestedEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR,
                eventText: Constants_1.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR,
                payload: JSON.stringify({
                    meterNumber: this.meterInfo.meterNumber,
                    disco: this.meterInfo.disco,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addMeterValidationReceivedEvent(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR,
                payload: JSON.stringify({
                    user: {
                        name: userInfo.user.name,
                        email: userInfo.user.email,
                        address: userInfo.user.address,
                        phoneNumber: userInfo.user.phoneNumber,
                    },
                    meterNumber: this.meterInfo.meterNumber,
                    disco: this.meterInfo.disco,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addMeterValidationSentEvent(meterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.METER_VALIDATION_SENT_PARTNER,
                eventText: Constants_1.TOPICS.METER_VALIDATION_SENT_PARTNER,
                payload: JSON.stringify({
                    merterId: meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    disco: this.meterInfo.disco,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addCRMUserInitiatedEvent(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.CREATE_USER_INITIATED,
                eventText: Constants_1.TOPICS.CREATE_USER_INITIATED,
                payload: JSON.stringify({
                    user: {
                        id: info.user.id,
                        name: info.user.name,
                        email: info.user.email,
                        address: info.user.address,
                        phoneNumber: info.user.phoneNumber,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addCRMUserConfirmedEvent(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.CREATE_USER_CONFIRMED,
                eventText: Constants_1.TOPICS.CREATE_USER_CONFIRMED,
                payload: JSON.stringify({
                    user: {
                        id: info.user.id,
                        name: info.user.name,
                        email: info.user.email,
                        address: info.user.address,
                        phoneNumber: info.user.phoneNumber,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addDiscoUpEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR,
                payload: JSON.stringify({
                    disco: this.meterInfo.disco,
                    superagent: this.superAgent,
                    patner: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addPowerPurchaseInitiatedEvent(bankRefId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.transaction.$get('user');
            if (!user) {
                throw new Error('Transaction does not have a user');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER,
                eventText: Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER,
                payload: JSON.stringify({
                    bankRefId,
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    phoneNumber: user.phoneNumber,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addPowerPurchaseRetryWithNewVendor({ bankRefId, currentVendor, newVendor }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.transaction.$get('user');
            if (!user) {
                throw new Error('Transaction does not have a user');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR,
                eventText: Constants_1.TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR,
                payload: JSON.stringify({
                    bankRefId,
                    transactionId: this.transaction.id,
                    currentSuperAgent: currentVendor,
                    newSuperAgent: newVendor,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    phoneNumber: user.phoneNumber,
                    vendType: this.meterInfo.vendType,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addVendElectricityRequestedFromVendorEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.VEND_ELECTRICITY_REQUESTED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.VEND_ELECTRICITY_REQUESTED_FROM_VENDOR,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: 'API',
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenRequestTimedOutEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_REQUEST_TIMEDOUT,
                eventText: Constants_1.TOPICS.TOKEN_REQUEST_TIMEDOUT,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addGetTransactionTokenRequestedFromVendorEvent(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    error,
                    vendType: this.meterInfo.vendType,
                    timestamp: new Date(),
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addGetTransactionTokenRequestedFromVendorRetryEvent(error, retryCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY,
                eventText: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    timestamp: new Date(),
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    error,
                    retryCount
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addGetTransactionTokenFromVendorInitiatedEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED,
                eventText: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    timestamp: new Date(),
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenRequestSuccessfulWithNoTokenEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_REQUEST_TIMEDOUT,
                eventText: Constants_1.TOPICS.TOKEN_REQUEST_TIMEDOUT,
                payload: JSON.stringify({
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenReceivedEvent(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR,
                eventText: Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR,
                payload: JSON.stringify({
                    token,
                    transactionId: this.transaction.id,
                    superAgent: this.transaction.superagent,
                    amount: this.transaction.amount,
                    disco: this.transaction.disco,
                    meterId: this.transaction.meterId,
                    meterNumber: this.meterInfo.meterNumber,
                    vendType: this.meterInfo.vendType,
                    superagent: this.superAgent,
                    partnerEmail: this.partner
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenSentToUserEmailEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.transaction.$get('user');
            if (!user) {
                throw new Error('Transaction does not have a user');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_SENT_TO_EMAIL,
                eventText: Constants_1.TOPICS.TOKEN_SENT_TO_EMAIL,
                payload: JSON.stringify({
                    email: user.email,
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenSentToPartnerEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER,
                eventText: Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenSentToPartnerRetryEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER_RETRY,
                eventText: Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER_RETRY,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addTokenRequestFailedNotificationToPartnerEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.TOKEN_REQUEST_FAILED,
                eventText: Constants_1.TOPICS.TOKEN_REQUEST_FAILED,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addWebHookNotificationSentEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                eventText: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addWebHookNotificationConfirmedEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
                eventText: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addWebHookNotificationRetryEvent({ url, retryCount, timeStamp }) {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY,
                eventText: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    webHookUrl: url,
                    retryCount,
                    superagent: this.superAgent,
                    timeStamp,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
    addPartnerTransactionCompleteEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const partner = yield this.transaction.$get('partner');
            if (!partner) {
                throw new Error('Transaction does not have a partner');
            }
            const event = {
                transactionId: this.transaction.id,
                eventType: Constants_1.TOPICS.PARTNER_TRANSACTION_COMPLETE,
                eventText: Constants_1.TOPICS.PARTNER_TRANSACTION_COMPLETE,
                payload: JSON.stringify({
                    partner: {
                        email: partner.email,
                        id: partner.id,
                    },
                    superagent: this.superAgent,
                    partnerEmail: this.partner,
                    disco: this.meterInfo.disco,
                }),
                source: this.transaction.superagent.toUpperCase(),
                eventTimestamp: new Date(),
                id: (0, uuid_1.v4)(),
                status: Event_model_1.Status.COMPLETE,
            };
            return yield Event_service_1.default.addEvent(event);
        });
    }
}
exports.default = TransactionEventService;
