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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Event_service_1 = __importDefault(require("../../../services/Event.service"));
const Transaction_service_1 = __importDefault(require("../../../services/Transaction.service"));
const TransactionEvent_service_1 = __importDefault(require("../../../services/TransactionEvent.service"));
const Webhook_service_1 = __importDefault(require("../../../services/Webhook.service"));
const Logger_1 = __importDefault(require("../../../utils/Logger"));
const Constants_1 = require("../../Constants");
const Consumer_1 = __importDefault(require("../util/Consumer"));
const Interface_1 = require("../util/Interface");
const MessageProcessor_1 = __importDefault(require("../util/MessageProcessor"));
const Profiles_1 = require("../../../services/Entity/Profiles");
const Vendor_1 = require("../publishers/Vendor");
const Token_1 = require("./Token");
class WebhookHandlerRequestValidator {
    static validateIncomingWebhookEventRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield Transaction_service_1.default.viewSingleTransaction(data.transactionId);
                if (!transaction) {
                    throw new Error(`Error fetching transaction with id ${data.transactionId}`);
                }
                const user = yield transaction.$get("user");
                if (!user) {
                    throw new Error("User not found for transaction with id " + transaction.id);
                }
                const partnerProfile = yield Profiles_1.PartnerProfileService.viewSinglePartnerByEmail(transaction.partner.email);
                if (!partnerProfile) {
                    throw new Error(`Error fetching partner with email ${transaction.partner.email}`);
                }
                const meter = yield transaction.$get("meter");
                if (!meter) {
                    throw new Error(`No meter found for transaction id ${transaction.id}`);
                }
                const webhook = yield Webhook_service_1.default.viewWebhookByPartnerId(partnerProfile.id);
                if (!webhook) {
                    throw new Error(`Error fetching webhook for partner with id ${partnerProfile.id}`);
                }
                return {
                    transaction,
                    partnerProfile,
                    webhook,
                    user,
                    meter,
                };
            }
            catch (error) {
                Logger_1.default.error(error.message);
                return error;
            }
        });
    }
}
class WebhookParamsBase {
}
class RetryWebhookParams extends WebhookParamsBase {
}
var Status;
(function (Status) {
    Status["RETRY"] = "Retry";
    Status["FIRST_TIME"] = "FirstTime";
})(Status || (Status = {}));
class WebhookHandler extends Interface_1.Registry {
    static handleWebhookRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationData = yield WebhookHandlerRequestValidator.validateIncomingWebhookEventRequest(data);
            if (validationData instanceof Error) {
                Logger_1.default.info(`A error occured while validating new webhook request for transaction with id ${data.transactionId}`);
                return;
            }
            const { transaction, partnerProfile, meter, user, webhook } = validationData;
            const transactionEventService = new TransactionEvent_service_1.default(transaction, {
                meterNumber: transaction.meter.meterNumber,
                disco: transaction.disco,
                vendType: transaction.meter.vendType,
            }, transaction.superagent, transaction.partner.email);
            try {
                const notifyPartnerEvent = yield Event_service_1.default.viewSingleEventByTransactionIdAndType(transaction.id, Constants_1.TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER);
                if (notifyPartnerEvent) {
                    Logger_1.default.info(`Webhook notification already sent for transaction with id ${transaction.id}`);
                    return;
                }
                const powerUnit = yield transaction.$get("powerUnit");
                // TODO: Add webhook case for failed transaction
                const transactionNotificationData = {
                    status: "SUCCESS",
                    data: {
                        transaction: {
                            reference: transaction.bankRefId,
                            comment: transaction.bankComment,
                            amount: transaction.amount,
                            date: transaction.createdAt,
                            powerUnit: powerUnit,
                            meter: data.meter,
                            user: data.user,
                        },
                        token: data.meter.token,
                    },
                };
                const response = yield Webhook_service_1.default.sendWebhookNotification(webhook, transactionNotificationData).catch((e) => e);
                yield transactionEventService.addWebHookNotificationSentEvent();
                const webhookUrlNotSet = response instanceof Error &&
                    response.message === "Webhook url not found";
                if (webhookUrlNotSet) {
                    Logger_1.default.error(`Webhook url not set for Partner - Notification can't be sent`);
                    return;
                }
                const axiosError = response instanceof axios_1.AxiosError;
                if (axiosError) {
                    // TODO: Setup request for a later time
                    Logger_1.default.info("No response from the user, setting up request for a later time");
                    return;
                }
                yield transactionEventService.addWebHookNotificationConfirmedEvent();
            }
            catch (error) {
                const metaData = {
                    url: webhook.url,
                    token: data.meter.token,
                    meter: transaction.meter,
                    retryCount: data instanceof RetryWebhookParams ? data.retryCount : null,
                };
                //     await this.scheduleNextWebhookNotification(
                //         transactionEventService,
                //         metaData,
                //     );
            }
        });
    }
    static scheduleNextWebhookNotification(eventService, meta) {
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            const retryCount = (_b = meta.retryCount) !== null && _b !== void 0 ? _b : 0;
            const waitTime = (0, Token_1.getCurrentWaitTimeForRequeryEvent)(retryCount);
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield eventService.addWebHookNotificationRetryEvent({
                    retryCount: retryCount,
                    timeStamp: new Date(),
                    url: meta.url,
                });
                const partner = yield eventService
                    .getTransactionInfo()
                    .$get("partner");
                if (!partner) {
                    throw new Error("Partner not found for transaction");
                }
                const user = yield eventService.getTransactionInfo().$get("user");
                if (!user) {
                    throw new Error("User not found for transaction");
                }
                const transaction = yield Transaction_service_1.default.viewSingleTransaction(eventService.getTransactionInfo().id);
                if (!transaction) {
                    throw new Error("Transaction not found");
                }
                yield Vendor_1.VendorPublisher.publishEventForWebhookNotificationToPartnerRetry({
                    meter: Object.assign(Object.assign({}, meta.meter), { token: meta.token }),
                    partner: partner,
                    retryCount: retryCount + 1,
                    user: {
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                    },
                    transactionId: eventService.getTransactionInfo().id,
                    superAgent: transaction.superagent
                });
            }), waitTime);
        });
    }
}
_a = WebhookHandler;
WebhookHandler.registry = {
    [Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: (_a
        .handleWebhookRequest),
    [Constants_1.TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY]: (_a
        .handleWebhookRequest),
};
class WebhookConsumer extends Consumer_1.default {
    constructor() {
        const messageProcessor = new MessageProcessor_1.default(WebhookHandler.registry, "WEBHOOK_CONSUMER");
        super(messageProcessor);
    }
}
exports.default = WebhookConsumer;
