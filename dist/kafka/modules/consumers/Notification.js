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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Entity_service_1 = __importDefault(require("../../../services/Entity/Entity.service"));
const Event_service_1 = __importDefault(require("../../../services/Event.service"));
const Notification_service_1 = __importDefault(require("../../../services/Notification.service"));
const Transaction_service_1 = __importDefault(require("../../../services/Transaction.service"));
const TransactionEvent_service_1 = __importStar(require("../../../services/TransactionEvent.service"));
const Email_1 = __importStar(require("../../../utils/Email"));
const Logger_1 = __importDefault(require("../../../utils/Logger"));
const Notification_1 = __importDefault(require("../../../utils/Notification"));
const Constants_1 = require("../../Constants");
const Consumer_1 = __importDefault(require("../util/Consumer"));
const Interface_1 = require("../util/Interface");
const MessageProcessor_1 = __importDefault(require("../util/MessageProcessor"));
const uuid_1 = require("uuid");
class NotificationHandler extends Interface_1.Registry {
    static handleReceivedToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info('Inside notification handler');
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                throw new Error(`Error fetching transaction with id ${data.transactionId}`);
            }
            const partnerEntity = yield Entity_service_1.default.viewSingleEntityByEmail(transaction.partner.email);
            if (!partnerEntity) {
                throw new Error(`Error fetching partner with email ${transaction.partner.email}`);
            }
            // Add notification successfull transaction
            const notification = yield Notification_service_1.default.addNotification({
                id: (0, uuid_1.v4)(),
                title: "Successful transaction",
                heading: "Successful ransaction",
                message: `
                Successtul transaction for ${data.meter.meterNumber} with amount ${transaction.amount}

                Bank Ref: ${transaction.bankRefId}
                Bank Comment: ${transaction.bankComment}
                Transaction Id: ${transaction.id},
                Token: ${data.meter.token}                    
                `,
                entityId: partnerEntity.id,
                read: false,
            });
            // Check if notifiecations have been sent to partner and user
            const notifyPartnerEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER);
            const notifyUserEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_SENT_TO_EMAIL);
            const transactionEventService = new TransactionEvent_service_1.default(transaction, {
                meterNumber: data.meter.meterNumber,
                vendType: transaction.meter.vendType,
                disco: data.meter.disco,
            }, transaction.superagent, transaction.partner.email);
            // If you've not notified the partner before, notify them
            if (!notifyPartnerEvent) {
                yield Notification_1.default.sendNotificationToUser(partnerEntity.id, notification);
                yield transactionEventService.addTokenSentToPartnerEvent();
            }
            // If you've not notified the user before, notify them
            if (!notifyUserEvent) {
                yield Email_1.default.sendEmail({
                    to: transaction.user.email,
                    subject: "Token Purchase",
                    html: yield new Email_1.EmailTemplate().receipt({
                        transaction: transaction,
                        meterNumber: data.meter.meterNumber,
                        token: data.meter.token,
                    }),
                });
                yield transactionEventService.addTokenSentToUserEmailEvent();
            }
            return;
        });
    }
    static handleReceivedAirtime(data) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info('Inside notification handler');
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                throw new Error(`Error fetching transaction with id ${data.transactionId}`);
            }
            const partnerEntity = yield Entity_service_1.default.viewSingleEntityByEmail(transaction.partner.email);
            if (!partnerEntity) {
                throw new Error(`Error fetching partner with email ${transaction.partner.email}`);
            }
            // Add notification successfull transaction
            const notification = yield Notification_service_1.default.addNotification({
                id: (0, uuid_1.v4)(),
                title: "Successful transaction",
                heading: "Successful ransaction",
                message: `
                Successtul transaction for ${data.phone.phoneNumber} with amount ${transaction.amount}

                Bank Ref: ${transaction.bankRefId}
                Bank Comment: ${transaction.bankComment}
                Transaction Id: ${transaction.id},
                Phone number: ${data.phone.phoneNumber}                    
                `,
                entityId: partnerEntity.id,
                read: false,
            });
            // Check if notifiecations have been sent to partner and user
            const notifyPartnerEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER);
            const notifyUserEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_SENT_TO_EMAIL);
            const transactionEventService = new TransactionEvent_service_1.AirtimeTransactionEventService(transaction, transaction.superagent, transaction.partner.email, data.phone.phoneNumber);
            // If you've not notified the partner before, notify them
            if (!notifyPartnerEvent) {
                yield Notification_1.default.sendNotificationToUser(partnerEntity.id, notification);
                yield transactionEventService.addAirtimeSentToPartner();
            }
            // If you've not notified the user before, notify them
            if (!notifyUserEvent) {
                yield Email_1.default.sendEmail({
                    to: transaction.user.email,
                    subject: "Token Purchase",
                    html: yield new Email_1.EmailTemplate().airTimeReceipt({
                        transaction: transaction,
                        phoneNumber: data.phone.phoneNumber,
                    }),
                });
                yield transactionEventService.addAirtimeSentToUserEmail();
            }
            return;
        });
    }
    static failedTokenRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.default.info('Inside notification handler');
            const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
            if (!transaction) {
                throw new Error(`Error fetching transaction with id ${data.transactionId}`);
            }
            const partnerEntity = yield Entity_service_1.default.viewSingleEntityByEmail(transaction.partner.email);
            if (!partnerEntity) {
                throw new Error(`Error fetching partner with email ${transaction.partner.email}`);
            }
            // Add notification successfull transaction
            const notification = yield Notification_service_1.default.addNotification({
                id: (0, uuid_1.v4)(),
                title: "Failed transaction",
                heading: "Failed ransaction",
                message: `
                Failed transaction for ${data.meter.meterNumber} with amount ${transaction.amount}

                Bank Ref: ${transaction.bankRefId}
                Bank Comment: ${transaction.bankComment}
                Transaction Id: ${transaction.id},
                `,
                entityId: partnerEntity.id,
                read: false,
            });
            // Check if notifiecations have been sent to partner and user
            const notifyPartnerEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_REQUEST_FAILED);
            const notifyUserEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.TOKEN_REQUEST_FAILED);
            const transactionEventService = new TransactionEvent_service_1.default(transaction, {
                meterNumber: data.meter.meterNumber,
                vendType: transaction.meter.vendType,
                disco: data.meter.disco,
            }, transaction.superagent, transaction.partner.email);
            // If you've not notified the partner before, notify them
            if (!notifyPartnerEvent) {
                yield Notification_1.default.sendNotificationToUser(partnerEntity.id, notification);
                yield transactionEventService.addTokenRequestFailedNotificationToPartnerEvent();
            }
            // If you've not notified the user before, notify them
            if (!notifyUserEvent) {
                yield Email_1.default.sendEmail({
                    to: transaction.user.email,
                    subject: "Token Purchase",
                    html: yield new Email_1.EmailTemplate().failedTransaction({
                        transaction: transaction,
                    }),
                });
                yield transactionEventService.addTokenRequestFailedNotificationToPartnerEvent();
            }
            return;
        });
    }
}
_a = NotificationHandler;
NotificationHandler.registry = {
    [Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER_RETRY]: _a.handleReceivedToken,
    [Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: _a.handleReceivedToken,
    [Constants_1.TOPICS.TOKEN_REQUEST_FAILED]: _a.failedTokenRequest,
    [Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR]: _a.handleReceivedAirtime,
};
class NotificationConsumer extends Consumer_1.default {
    constructor() {
        const messageProcessor = new MessageProcessor_1.default(NotificationHandler.registry, 'NOTIFICATION_CONSUMER');
        super(messageProcessor);
    }
}
exports.default = NotificationConsumer;
