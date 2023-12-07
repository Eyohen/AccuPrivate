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
// Import required modules, types, and models
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Event_service_1 = __importDefault(require("./Event.service"));
const Event_model_1 = __importDefault(require("../models/Event.model"));
const PowerUnit_model_1 = __importDefault(require("../models/PowerUnit.model"));
const PartnerProfile_model_1 = __importDefault(require("../models/Entity/Profiles/PartnerProfile.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Meter_model_1 = __importDefault(require("../models/Meter.model"));
const sequelize_1 = require("sequelize");
// Define the TransactionService class for handling transaction-related operations
class TransactionService {
    // Static method for adding a new transaction
    static addTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Build a new transaction object
            const newTransaction = Transaction_model_1.default.build(transaction);
            // Save the new tran    saction to the database
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            newTransaction.transactionTimestamp = yesterdayDate;
            yield newTransaction.save();
            return newTransaction;
        });
    }
    // Static method for viewing all transactions
    static viewTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve all transactions from the database
            const transactions = yield Transaction_model_1.default.findAll();
            return transactions;
        });
    }
    static viewTransactionsWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve all transactions from the database
            // Sort from latest 
            const transactions = (yield Transaction_model_1.default.findAll(Object.assign(Object.assign({}, query), { include: [PowerUnit_model_1.default, Event_model_1.default, PartnerProfile_model_1.default, User_model_1.default, Meter_model_1.default] }))).sort((a, b) => { return b.transactionTimestamp.getTime() - a.transactionTimestamp.getTime(); });
            return transactions;
        });
    }
    // Static method for viewing a single transaction by UUID
    static viewSingleTransaction(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve a single transaction by its UUID
            const transaction = yield Transaction_model_1.default.findByPk(uuid, { include: [PowerUnit_model_1.default, Event_model_1.default, PartnerProfile_model_1.default, User_model_1.default, Meter_model_1.default] });
            return transaction;
        });
    }
    static viewSingleTransactionByBankRefID(bankRefId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve a single transaction by its UUID
            const transaction = yield Transaction_model_1.default.findOne({ where: { bankRefId: bankRefId }, include: [PartnerProfile_model_1.default, Meter_model_1.default, User_model_1.default] });
            return transaction;
        });
    }
    // Static method for updating a single transaction by UUID
    static updateSingleTransaction(uuid, updateTransaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update the transaction in the database
            const updateResult = yield Transaction_model_1.default.update(updateTransaction, { where: { id: uuid } });
            // Retrieve the updated transaction by its UUID
            const updatedTransaction = yield Transaction_model_1.default.findByPk(uuid);
            return updatedTransaction;
        });
    }
    static viewTransactionForYesterday(partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 5);
            const currentDate = new Date();
            console.log(yesterdayDate);
            console.log(new Date());
            console.log(partnerId);
            const transactions = yield Transaction_model_1.default.findAll({
                where: {
                    // partnerId: partnerId,
                    transactionTimestamp: {
                        [sequelize_1.Op.between]: [yesterdayDate, currentDate]
                    }
                }
            });
            // console.log(transactions)
            return transactions;
        });
    }
    static viewTransactionsForYesterdayByStatus(partnerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const transactions = yield Transaction_model_1.default.findAll({
                where: {
                    partnerId: partnerId,
                    status,
                    transactionTimestamp: {
                        $between: [yesterdayDate, new Date()]
                    }
                }
            });
            return transactions;
        });
    }
}
// Create an instance of EventService for handling events
TransactionService.eventService = new Event_service_1.default();
exports.default = TransactionService;
