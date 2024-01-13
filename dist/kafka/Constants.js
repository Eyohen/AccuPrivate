"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOPICS = void 0;
var TOPICS;
(function (TOPICS) {
    TOPICS["METER_VALIDATION_REQUEST_SENT_TO_VENDOR"] = "METER_VALIDATION_REQUEST_SENT_TO_VENDOR";
    TOPICS["METER_VALIDATION_RECIEVED_FROM_VENDOR"] = "METER_VALIDATION_RECIEVED_FROM_VENDOR";
    TOPICS["METER_VALIDATION_SENT_PARTNER"] = "METER_VALIDATION_SENT_PARTNER";
    TOPICS["CREATE_USER_INITIATED"] = "CREATE_USER_INITIATED";
    TOPICS["CREATE_USER_CONFIRMED"] = "CREATE_USER_CONFIRMED";
    TOPICS["CHECK_DISCO_UP_INITIATED_TO_VENDOR"] = "CHECK_DISCO_UP_INITIATED_TO_VENDOR";
    TOPICS["CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR"] = "CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR";
    TOPICS["POWER_PURCHASE_INITIATED_BY_CUSTOMER"] = "POWER_PURCHASE_INITIATED_BY_CUSTOMER";
    TOPICS["VEND_ELECTRICITY_REQUESTED_FROM_VENDOR"] = "VEND_ELECTRICITY_REQUESTED_FROM_VENDOR";
    TOPICS["TOKEN_RECIEVED_FROM_VENDOR"] = "TOKEN_RECIEVED_FROM_VENDOR";
    TOPICS["TOKEN_REQUEST_FAILED"] = "TOKEN_REQUEST_FAILED";
    TOPICS["TOKEN_REQUEST_TIMEDOUT"] = "TOKEN_REQUEST_TIMEDOUT";
    TOPICS["TOKEN_REQUEST_SUCCESS_WITH_NO_TOKEN"] = "TOKEN_REQUEST_SUCCESS_WITH_NO_TOKEN";
    TOPICS["POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY"] = "POWER_PURCHASE_INITIATED_BY_CUSTOMER_REQUERY";
    TOPICS["GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED"] = "GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED";
    TOPICS["GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY"] = "GET_TRANSACTION_TOKEN_FROM_VENDOR_RETRY";
    TOPICS["GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR"] = "GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR";
    TOPICS["TOKEN_SENT_TO_PARTNER"] = "TOKEN_SENT_TO_PARTNER";
    TOPICS["TOKEN_SENT_TO_PARTNER_RETRY"] = "TOKEN_SENT_TO_PARTNER_RETRY";
    TOPICS["TOKEN_SENT_TO_EMAIL"] = "TOKEN_SENT_TO_EMAIL";
    TOPICS["TOKEN_SENT_TO_NUMBER"] = "TOKEN_SENT_TO_NUMBER";
    TOPICS["PARTNER_TRANSACTION_COMPLETE"] = "PARTNER_TRANSACTION_COMPLETE";
    TOPICS["WEBHOOK_NOTIFICATION_SENT_TO_PARTNER"] = "WEBHOOK_NOTIFICATION_SENT_TO_PARTNER";
    TOPICS["WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER"] = "WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER";
    TOPICS["WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY"] = "WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY";
    TOPICS["RETRY_PURCHASE_FROM_NEW_VENDOR"] = "RETRY_PURCHASE_FROM_NEW_VENDOR";
})(TOPICS || (exports.TOPICS = TOPICS = {}));