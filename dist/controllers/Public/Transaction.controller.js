"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Event_model_1 = require("../../models/Event.model");
const Email_1 = __importStar(require("../../utils/Email"));
const Helper_1 = require("../../utils/Helper");
const Constants_1 = require("../../utils/Constants");
const PowerUnit_service_1 = __importDefault(require("../../services/PowerUnit.service"));
const ResponseTrimmer_1 = __importDefault(require("../../utils/ResponseTrimmer"));
const crypto_1 = require("crypto");
const Vendor_service_1 = __importDefault(require("../../services/Vendor.service"));
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const Event_service_1 = __importDefault(require("../../services/Event.service"));
const Role_model_1 = require("../../models/Role.model");
class TransactionController {
    static getTransactionInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankRefId, transactionId } = req.query;
            const transaction = bankRefId
                ? yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId)
                : yield Transaction_service_1.default.viewSingleTransaction(transactionId);
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
            const { page, limit, status, startDate, endDate, userId, disco, superagent, partnerId } = req.query;
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
                query.limit = parseInt(limit);
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            if (partnerId)
                query.where.partnerId = partnerId;
            const requestWasMadeByAnAdmin = [Role_model_1.RoleEnum.Admin].includes(req.user.user.entity.role);
            if (!requestWasMadeByAnAdmin) {
                query.where.partnerId = req.user.user.profile.id;
            }
            const transactions = yield Transaction_service_1.default.viewTransactionsWithCustomQuery(query);
            if (!transactions) {
                throw new Errors_1.NotFoundError('Transactions not found');
            }
            const paginationData = {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: transactions.length,
                totalPages: Math.ceil(transactions.length / parseInt(limit))
            };
            const response = {
                transactions: transactions
            };
            if (page && page != '0' && limit) {
                response['pagination'] = paginationData;
            }
            res.status(200).json({
                status: 'success',
                message: 'Transactions retrieved successfully',
                data: response
            });
        });
    }
    static requeryTimedOutTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankRefId } = req.query;
            let transactionRecord = yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId);
            if (!transactionRecord) {
                throw new Errors_1.NotFoundError('Transaction record not found');
            }
            if (transactionRecord.superagent === 'BUYPOWERNG') {
                throw new Errors_1.BadRequestError('Transaction cannot be requery for this superagent');
            }
            let powerUnit = yield transactionRecord.$get('powerUnit');
            const response = yield Vendor_service_1.default.buyPowerRequeryTransaction({ transactionId: transactionRecord.id });
            if (response.status === false) {
                const transactionFailed = response.responseCode === 202;
                const transactionIsPending = response.responseCode === 201;
                if (transactionFailed)
                    yield Transaction_service_1.default.updateSingleTransaction(transactionRecord.id, { status: Event_model_1.Status.FAILED });
                else if (transactionIsPending)
                    yield Transaction_service_1.default.updateSingleTransaction(transactionRecord.id, { status: Event_model_1.Status.PENDING });
                res.status(200).json({
                    status: 'success',
                    message: 'Requery request successful',
                    data: {
                        requeryStatusCode: transactionFailed ? 400 : 202,
                        requeryStatusMessage: transactionFailed ? 'Transaction failed' : 'Transaction pending',
                        transaction: ResponseTrimmer_1.default.trimTransaction(transactionRecord),
                    }
                });
                return;
            }
            yield Event_service_1.default.addEvent({
                id: (0, crypto_1.randomUUID)(),
                transactionId: transactionRecord.id,
                eventType: 'REQUERY',
                eventText: 'Requery successful',
                eventData: response,
                eventTimestamp: new Date(),
                source: 'BUYPOWERNG',
                status: Event_model_1.Status.COMPLETE
            });
            yield Transaction_service_1.default.updateSingleTransaction(transactionRecord.id, { status: Event_model_1.Status.COMPLETE });
            const user = yield transactionRecord.$get('user');
            if (!user) {
                throw new Errors_1.InternalServerError(`Transaction ${transactionRecord.id} does not have a user`);
            }
            if (!transactionRecord.userId) {
                throw new Errors_1.InternalServerError(`Timedout transaction ${transactionRecord.id} does not have a user`);
            }
            const meter = yield transactionRecord.$get('meter');
            if (!meter) {
                throw new Errors_1.InternalServerError(`Timedout transaction ${transactionRecord.id} does not have a meter`);
            }
            // Power unit will only be created if the transaction has been completed or if a sucessful requery has been don
            const transactionHasBeenAccountedFor = !!powerUnit;
            // Add Power Unit to store token if transcation has not been accounted for 
            powerUnit = powerUnit
                ? powerUnit
                : yield PowerUnit_service_1.default.addPowerUnit({
                    id: (0, crypto_1.randomUUID)(),
                    transactionId: transactionRecord.id,
                    disco: transactionRecord.disco,
                    discoLogo: Constants_1.DISCO_LOGO[transactionRecord.disco.toLowerCase()],
                    amount: transactionRecord.amount,
                    meterId: meter.id,
                    superagent: transactionRecord.superagent,
                    address: meter.address,
                    token: Constants_1.NODE_ENV === 'development' ? (0, Helper_1.generateRandomToken)() : response.data.token,
                    tokenNumber: 0,
                    tokenUnits: response.data.token
                });
            // Update Transaction if transaction has not been accounted for
            // TODO: Add request token event to transaction
            transactionRecord = transactionHasBeenAccountedFor ? transactionRecord : yield transactionRecord.update({ amount: transactionRecord.amount, status: Event_model_1.Status.COMPLETE });
            // TODO: Only send email if transaction has not been completed before
            !transactionHasBeenAccountedFor && Email_1.default.sendEmail({
                to: user.email,
                subject: 'Token Purchase',
                html: yield new Email_1.EmailTemplate().receipt({
                    transaction: transactionRecord,
                    meterNumber: meter.meterNumber,
                    token: powerUnit.token
                })
            });
            res.status(200).json({
                status: 'success',
                message: 'Requery request successful',
                data: {
                    requeryStatusCode: 200,
                    requeryStatusMessage: 'Transaction successful',
                    transaction: ResponseTrimmer_1.default.trimTransaction(transactionRecord),
                    powerUnit: ResponseTrimmer_1.default.trimPowerUnit(powerUnit)
                }
            });
        });
    }
    static getYesterdaysTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status } = req.query;
            const { profile: { id } } = req.user.user;
            const partner = yield PartnerProfile_service_1.default.viewSinglePartner(id);
            if (!partner) {
                throw new Errors_1.InternalServerError('Authenticated partner not found');
            }
            const transactions = status
                ? yield Transaction_service_1.default.viewTransactionsForYesterdayByStatus(partner.id, status.toUpperCase())
                : yield Transaction_service_1.default.viewTransactionForYesterday(partner.id);
            const totalAmount = transactions.reduce((acc, curr) => acc + parseInt(curr.amount), 0);
            res.status(200).json({
                status: 'success',
                message: 'Transactions retrieved successfully',
                data: { transactions, totalAmount }
            });
        });
    }
}
exports.default = TransactionController;
