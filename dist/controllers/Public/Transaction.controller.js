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
const Transaction_service_1 = __importDefault(require("../../services/Transaction.service"));
const Errors_1 = require("../../utils/Errors");
class TransactionController {
    static getTransactionInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankRefId } = req.query;
            const transaction = yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId);
            if (!transaction) {
                throw new Errors_1.NotFoundError('Transaction not found');
            }
            const powerUnit = yield transaction.$get('powerUnit');
            res.status(200).json({
                status: 'success',
                message: 'Transaction info retrieved successfully',
                data: { transaction: Object.assign(Object.assign({}, transaction.dataValues), { powerUnit }) }
            });
        });
    }
    static getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, status, startDate, endDate, userId, disco, superagent } = req.query;
            const query = { where: {} };
            if (status)
                query.where.status = status;
            if (startDate && endDate)
                query.where.transactionTimestamp = { $between: [startDate, endDate] };
            if (userId)
                query.where.userId = userId;
            if (disco)
                query.where.disco = disco;
            if (superagent)
                query.where.superagent = superagent;
            if (limit)
                query.limit = limit;
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            const transactions = yield Transaction_service_1.default.viewTransactionsWithCustomQuery(query);
            if (!transactions) {
                throw new Errors_1.NotFoundError('Transactions not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Transactions retrieved successfully',
                data: { transactions }
            });
        });
    }
}
exports.default = TransactionController;
