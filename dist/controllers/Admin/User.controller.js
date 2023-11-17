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
const Errors_1 = require("../../utils/Errors");
const User_service_1 = __importDefault(require("../../services/User.service"));
class TransactionController {
    static getUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.query;
            const user = yield User_service_1.default.viewSingleUserWithEmail(email);
            if (!user) {
                throw new Errors_1.NotFoundError('User not found');
            }
            const userTransactions = yield user.$get('transactions');
            const userMeters = yield user.$get('meters');
            res.status(200).json({
                status: 'success',
                message: 'User info retrieved successfully',
                data: { user: Object.assign(Object.assign({}, user.dataValues), { meters: userMeters, transactions: userTransactions }) }
            });
        });
    }
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield User_service_1.default.viewUsers();
            res.status(200).json({
                status: 'success',
                message: 'Users retrieved successfully',
                data: {
                    users
                }
            });
        });
    }
}
exports.default = TransactionController;
