"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Transaction_controller_1 = __importDefault(require("../../controllers/Public/Transaction.controller"));
exports.router = express_1.default.Router();
exports.router
    .get('/info', Transaction_controller_1.default.getTransactionInfo)
    .get('/', Transaction_controller_1.default.getTransactions);
exports.default = exports.router;
