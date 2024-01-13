"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = exports.TransactionErrorCause = void 0;
const Constants_1 = require("../../Constants");
var TransactionErrorCause;
(function (TransactionErrorCause) {
    TransactionErrorCause["TRANSACTION_TIMEDOUT"] = "TRANSACTION_TIMEDOUT";
    TransactionErrorCause["TRANSACTION_FAILED"] = "TRANSACTION_FAILED";
    TransactionErrorCause["UNKNOWN"] = "UNKNOWN";
    TransactionErrorCause["MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED"] = "MAINTENANCE_ACCOUNT_ACTIVATION_REQUIRED";
    TransactionErrorCause["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
    TransactionErrorCause["NO_TOKEN_IN_RESPONSE"] = "NO_TOKEN_IN_RESPONSE";
})(TransactionErrorCause || (exports.TransactionErrorCause = TransactionErrorCause = {}));
class Registry {
}
exports.Registry = Registry;
Registry.registry = {};
