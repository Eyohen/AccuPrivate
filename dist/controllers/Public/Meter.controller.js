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
const Meter_service_1 = __importDefault(require("../../services/Meter.service"));
class TransactionController {
    static getMeterInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { meterNumber } = req.query;
            const meter = yield Meter_service_1.default.viewSingleMeterByMeterNumber(meterNumber);
            if (!meter) {
                throw new Errors_1.NotFoundError('Meter not found');
            }
            const powerUnits = yield meter.$get('powerUnits');
            res.status(200).json({
                status: 'success',
                message: 'Meter info retrieved successfully',
                data: { meter: Object.assign(Object.assign({}, meter.dataValues), { powerUnits }) }
            });
        });
    }
    static getMeters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, disco, vendType, userId } = req.query;
            const query = { where: {} };
            if (vendType)
                query.where.vendType = vendType;
            if (userId)
                query.where.userId = userId;
            if (disco)
                query.where.disco = disco;
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            const meters = yield Meter_service_1.default.viewMetersWithCustomQuery(query);
            res.status(200).json({
                status: 'success',
                message: 'Meters retrieved successfully',
                data: {
                    meters
                }
            });
        });
    }
}
exports.default = TransactionController;
