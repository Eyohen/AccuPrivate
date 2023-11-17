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
const PowerUnit_service_1 = __importDefault(require("../../services/PowerUnit.service"));
class TransactionController {
    static getPowerUnitInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.query;
            const powerUnit = yield PowerUnit_service_1.default.viewPowerUnitByToken(token);
            if (!powerUnit) {
                throw new Errors_1.NotFoundError('Powerunit not found');
            }
            const transaction = yield powerUnit.$get('transaction');
            const meter = yield powerUnit.$get('meter');
            res.status(200).json({
                status: 'success',
                message: 'Power unit info retrieved successfully',
                data: { powerUnit: powerUnit.dataValues, transaction, meter }
            });
        });
    }
    static getPowerUnits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, } = req.query;
            const query = { where: {} };
            if (limit)
                query.limit = limit;
            if (page && page != '0' && limit) {
                query.offset = Math.abs(parseInt(page) - 1) * parseInt(limit);
            }
            const powerUnits = yield PowerUnit_service_1.default.viewPowerUnitsWithCustomQuery(query);
            res.status(200).json({
                status: 'success',
                message: 'Meters retrieved successfully',
                data: {
                    powerUnits
                }
            });
        });
    }
}
exports.default = TransactionController;
