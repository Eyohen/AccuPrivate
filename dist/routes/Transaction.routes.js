"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Transaction_controller_1 = __importDefault(require("../controllers/Public/Transaction.controller"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
exports.router = express_1.default.Router();
exports.router
    .use((0, Auth_1.basicAuth)('access'))
    .get('/info', (0, Interface_1.AuthenticatedController)(Transaction_controller_1.default.getTransactionInfo))
    .get('/', (0, Interface_1.AuthenticatedController)(Transaction_controller_1.default.getTransactions))
    .get('/yesterday', (0, Interface_1.AuthenticatedController)(Transaction_controller_1.default.getYesterdaysTransactions))
    .get('/requery-transaction', (0, Interface_1.AuthenticatedController)(Transaction_controller_1.default.requeryTimedOutTransaction));
exports.default = exports.router;
