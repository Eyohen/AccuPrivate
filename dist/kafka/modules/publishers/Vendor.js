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
exports.VendorPublisher = void 0;
const Logger_1 = __importDefault(require("../../../utils/Logger"));
const Constants_1 = require("../../Constants");
const Producer_1 = __importDefault(require("../util/Producer"));
class VendorPublisher extends Producer_1.default {
    static publishEventForMeterValidationRequested(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                    superAgent: data.superAgent
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.METER_VALIDATION_REQUEST_SENT_TO_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForMeterValidationReceived(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR,
                message: {
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForMeterValidationSentToPartner(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.METER_VALIDATION_SENT_PARTNER,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.METER_VALIDATION_SENT_PARTNER} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForDiscoUpCheckConfirmedFromVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForInitiatedPowerPurchase(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                    },
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    partner: {
                        email: data.partner.email,
                    },
                    transactionId: data.transactionId,
                    superAgent: data.superAgent
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForRetryPowerPurchaseWithNewVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                    },
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    partner: {
                        email: data.partner.email,
                    },
                    transactionId: data.transactionId,
                    superAgent: data.superAgent,
                    newVendor: data.newVendor
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.RETRY_PURCHASE_FROM_NEW_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForTokenReceivedFromVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                        token: data.meter.token,
                    },
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    partner: {
                        email: data.partner.email,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.TOKEN_RECIEVED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForWebhookNotificationToPartnerRetry(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                        token: data.meter.token,
                    },
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    partner: {
                        email: data.partner.email,
                    },
                    transactionId: data.transactionId,
                    retryCount: data.retryCount,
                    superAgent: data.superAgent
                },
            });
        });
    }
    static publishEventForGetTransactionTokenRequestedFromVendorRetry(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                    },
                    error: data.error,
                    transactionId: data.transactionId,
                    timeStamp: data.timeStamp,
                    retryCount: data.retryCount,
                    superAgent: data.superAgent,
                    waitTime: data.waitTime
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForGetTransactionTokenFromVendorInitiated(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED,
                message: {
                    meter: data.meter,
                    transactionId: data.transactionId,
                    timeStamp: data.timeStamp,
                    superAgent: data.superAgent
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForTransactionRequery(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForSuccessfulTokenRequestWithNoToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.TOKEN_REQUEST_SUCCESS_WITH_NO_TOKEN,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.TOKEN_REQUEST_SUCCESS_WITH_NO_TOKEN} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForTokenSentToPartnerRetry(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.TOKEN_SENT_TO_PARTNER_RETRY,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                        token: data.meter.token,
                    },
                    user: {
                        name: data.user.name,
                        email: data.user.email,
                        address: data.user.address,
                        phoneNumber: data.user.phoneNumber,
                    },
                    partner: {
                        email: data.partner.email,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.TOKEN_REQUEST_FAILED} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForFailedTokenRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.TOKEN_REQUEST_FAILED,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                    },
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.TOKEN_REQUEST_FAILED} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForCompletedPowerPurchase(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.PARTNER_TRANSACTION_COMPLETE,
                message: {
                    meter: {
                        meterNumber: data.meter.meterNumber,
                        disco: data.meter.disco,
                        vendType: data.meter.vendType,
                        id: data.meter.id,
                    },
                    partner: data.partner,
                    user: data.user,
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing  ${Constants_1.TOPICS.PARTNER_TRANSACTION_COMPLETE} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    // AIRTIME SPECIFIC PUBLISHERS
    static publshEventForAirtimePurchaseInitiate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER,
                message: {
                    phone: data.phone,
                    partner: data.partner,
                    user: data.user,
                    transactionId: data.transactionId,
                    superAgent: data.superAgent
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing  ${Constants_1.TOPICS.AIRTIME_PURCHASE_INITIATED_BY_CUSTOMER} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForAirtimeReceivedFromVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR,
                message: {
                    phone: data.phone,
                    transactionId: data.transactionId,
                    partner: data.partner,
                    user: data.user,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing  ${Constants_1.TOPICS.AIRTIME_RECEIVED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForAirtimeWebhookNotificationSentToPartner(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.AIRTIME_WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
                message: {
                    phone: data.phone,
                    transactionId: data.transactionId,
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing  ${Constants_1.TOPICS.AIRTIME_WEBHOOK_NOTIFICATION_SENT_TO_PARTNER} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForAirtimePurchaseComplete(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.AIRTIME_TRANSACTION_COMPLETE,
                message: {
                    phone: data.phone,
                    transactionId: data.transactionId,
                    partner: data.partner,
                    user: data.user,
                    superAgent: data.superAgent
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing  ${Constants_1.TOPICS.AIRTIME_TRANSACTION_COMPLETE} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForGetAirtimeFromVendorRetry(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.GET_AIRTIME_FROM_VENDOR_RETRY,
                message: {
                    phone: data.phone,
                    error: data.error,
                    transactionId: data.transactionId,
                    timeStamp: data.timeStamp,
                    retryCount: data.retryCount,
                    superAgent: data.superAgent,
                    waitTime: data.waitTime
                },
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
    static publishEventForAirtimePurchaseRetryFromVendorWithNewVendor(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Producer_1.default.sendMessage({
                topic: Constants_1.TOPICS.AIRTIME_PURCHASE_RETRY_FROM_NEW_VENDOR,
                message: {
                    phone: data.phone,
                    transactionId: data.transactionId,
                    superAgent: data.superAgent,
                    newVendor: data.newVendor,
                    partner: data.partner,
                    user: data.user
                }
            }).catch((e) => {
                Logger_1.default.error(`An error occured while publishing ${Constants_1.TOPICS.AIRTIME_PURCHASE_RETRY_FROM_NEW_VENDOR} event for transaction` +
                    data.transactionId);
                return e;
            });
        });
    }
}
exports.VendorPublisher = VendorPublisher;
