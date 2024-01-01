"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("../utils/Errors");
const Logger_1 = __importDefault(require("../utils/Logger"));
function errorHandler(err, req, res, next) {
    console.error(err);
    Logger_1.default.error(err.stack);
    if (err instanceof Errors_1.CustomAPIError && err.statusCode !== 500) {
        return res.status(err.statusCode).send({
            status: 'error',
            error: true,
            message: err.message,
        });
    }
    // if the error is not one of the specific types above, return a generic internal server error
    return res.status(500).send({ status: 'error', error: true, message: 'Ops, Something went wrong' });
}
exports.default = errorHandler;
