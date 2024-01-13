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
const Event_model_1 = require("../../models/Event.model");
const ResponseTrimmer_1 = __importDefault(require("../../utils/ResponseTrimmer"));
const Vendor_service_1 = __importDefault(require("../../services/Vendor.service"));
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const Role_model_1 = require("../../models/Role.model");
const TransactionEvent_service_1 = __importDefault(require("../../services/TransactionEvent.service"));
const Vendor_1 = require("../../kafka/modules/publishers/Vendor");
const sequelize_1 = require("sequelize");
class TransactionController {
    static getTransactionInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bankRefId, transactionId } = req.query;
            const transaction = bankRefId
                ? yield Transaction_service_1.default.viewSingleTransactionByBankRefID(bankRefId)
                : yield Transaction_service_1.default.viewSingleTransaction(transactionId);
            if (!transaction) {
                throw new Errors_1.NotFoundError("Transaction not found");
            }
            const powerUnit = yield transaction.$get("powerUnit");
            res.status(200).json({
                status: "success",
                message: "Transaction info retrieved successfully",
                data: { transaction: Object.assign(Object.assign({}, transaction.dataValues), { powerUnit }) },
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
                query.where.transactionTimestamp = { [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)] };
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
            if (userId)
                query.where.userId = userId;
            const requestWasMadeByAnAdmin = [Role_model_1.RoleEnum.Admin].includes(req.user.user.entity.role) || [Role_model_1.RoleEnum.SuperAdmin].includes(req.user.user.entity.role);
            if (!requestWasMadeByAnAdmin) {
                const requestMadeByEnduser = [Role_model_1.RoleEnum.EndUser].includes(req.user.user.entity.role);
                if (requestMadeByEnduser) {
                    query.where.userId = req.user.user.entity.userId;
                }
                else {
                    query.where.partnerId = req.user.user.profile.id;
                }
            }
            const transactions = yield Transaction_service_1.default.viewTransactionsWithCustomQuery(query);
            if (!transactions) {
                throw new Errors_1.NotFoundError("Transactions not found");
            }
            const totalAmount = transactions.reduce((acc, curr) => acc + parseInt(curr.amount), 0);
            const paginationData = {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: transactions.length,
                totalPages: Math.ceil(transactions.length / parseInt(limit))
            };
            const response = {
                transactions: transactions,
                totalAmount
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
    static getTransactionsKPI(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, status, startDate, endDate, userId, disco, superagent, partnerId } = req.query;
            const query = { where: {} };
            if (status)
                query.where.status = status.toUpperCase();
            if (startDate && endDate)
                query.where.transactionTimestamp = { [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)] };
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
            const requestWasMadeByAnAdmin = [Role_model_1.RoleEnum.Admin].includes(req.user.user.entity.role) || [Role_model_1.RoleEnum.SuperAdmin].includes(req.user.user.entity.role);
            const requestWasMadeByCustomer = [Role_model_1.RoleEnum.EndUser].includes(req.user.user.entity.role);
            if (requestWasMadeByCustomer) {
                query.where.userId = req.user.user.entity.userId;
            }
            if (!requestWasMadeByAnAdmin && !requestWasMadeByCustomer) {
                query.where.partnerId = req.user.user.profile.id;
            }
            const totalTransactionAmount = yield Transaction_service_1.default.viewTransactionsAmountWithCustomQuery(query);
            const totalTransactionCount = yield Transaction_service_1.default.viewTransactionsCountWithCustomQuery(query);
            const response = {
                totalTransactionAmount,
                totalTransactionCount
            };
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
                throw new Errors_1.NotFoundError("Transaction record not found");
            }
            if (transactionRecord.superagent !== "BUYPOWERNG") {
                throw new Errors_1.BadRequestError("Transaction cannot be requery for this superagent");
            }
            let powerUnit = yield transactionRecord.$get("powerUnit");
            const response = yield Vendor_service_1.default.buyPowerRequeryTransaction({
                reference: transactionRecord.reference,
            });
            if (response.status === false) {
                const transactionFailed = response.responseCode === 202;
                const transactionIsPending = response.responseCode === 201;
                if (transactionFailed)
                    yield Transaction_service_1.default.updateSingleTransaction(transactionRecord.id, {
                        status: Event_model_1.Status.FAILED,
                    });
                else if (transactionIsPending)
                    yield Transaction_service_1.default.updateSingleTransaction(transactionRecord.id, {
                        status: Event_model_1.Status.PENDING,
                    });
                res.status(200).json({
                    status: "success",
                    message: "Requery request successful",
                    data: {
                        requeryStatusCode: transactionFailed ? 400 : 202,
                        requeryStatusMessage: transactionFailed
                            ? "Transaction failed"
                            : "Transaction pending",
                        transaction: ResponseTrimmer_1.default.trimTransaction(transactionRecord),
                    },
                });
                return;
            }
            const partner = yield transactionRecord.$get("partner");
            if (!partner) {
                throw new Errors_1.InternalServerError("Partner not found");
            }
            const transactionEventService = new TransactionEvent_service_1.default(transactionRecord, {
                meterNumber: transactionRecord.meter.meterNumber,
                disco: transactionRecord.disco,
                vendType: transactionRecord.meter.vendType,
            }, transactionRecord.superagent, partner.email);
            yield transactionEventService.addTokenReceivedEvent(response.data.token);
            yield Vendor_1.VendorPublisher.publishEventForTokenReceivedFromVendor({
                meter: {
                    id: transactionRecord.meter.id,
                    meterNumber: transactionRecord.meter.meterNumber,
                    disco: transactionRecord.disco,
                    vendType: transactionRecord.meter.vendType,
                    token: response.data.token,
                },
                user: {
                    name: transactionRecord.user.name,
                    email: transactionRecord.user.email,
                    address: transactionRecord.user.address,
                    phoneNumber: transactionRecord.user.phoneNumber,
                },
                partner: {
                    email: transactionRecord.partner.email,
                },
                transactionId: transactionRecord.id,
            });
            res.status(200).json({
                status: "success",
                message: "Requery request successful",
                data: {
                    requeryStatusCode: 200,
                    requeryStatusMessage: "Transaction successful",
                    transaction: ResponseTrimmer_1.default.trimTransaction(transactionRecord),
                },
            });
        });
    }
    static getYesterdaysTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status } = req.query;
            const { profile: { id }, } = req.user.user;
            const partner = yield PartnerProfile_service_1.default.viewSinglePartner(id);
            if (!partner) {
                throw new Errors_1.InternalServerError("Authenticated partner not found");
            }
            const transactions = status
                ? yield Transaction_service_1.default.viewTransactionsForYesterdayByStatus(partner.id, status.toUpperCase())
                : yield Transaction_service_1.default.viewTransactionForYesterday(partner.id);
            const totalAmount = transactions.reduce((acc, curr) => acc + parseInt(curr.amount), 0);
            res.status(200).json({
                status: "success",
                message: "Transactions retrieved successfully",
                data: { transactions, totalAmount },
            });
        });
    }
}
exports.default = TransactionController;
