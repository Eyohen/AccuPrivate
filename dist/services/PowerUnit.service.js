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
const PowerUnit_model_1 = __importDefault(require("../models/PowerUnit.model"));
class PowerUnitService {
    static addPowerUnit(powerUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPowerUnit = PowerUnit_model_1.default.build(powerUnit);
            yield newPowerUnit.save();
            return newPowerUnit;
        });
    }
    static viewPowerUnitByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnit = yield PowerUnit_model_1.default.findOne({ where: { token } });
            return powerUnit;
        });
    }
    static viewPowerUnitsWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnits = yield PowerUnit_model_1.default.findAll(query);
            return powerUnits;
        });
    }
    static viewPowerUnits() {
        return __awaiter(this, void 0, void 0, function* () {
            const PowerUnits = yield PowerUnit_model_1.default.findAll();
            return PowerUnits;
        });
    }
    static viewSinglePowerUnit(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnit = yield PowerUnit_model_1.default.findByPk(uuid);
            return powerUnit;
        });
    }
    static viewSinglePowerUnitByTransactionId(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnit = yield PowerUnit_model_1.default.findOne({ where: { transactionId } });
            return powerUnit;
        });
    }
    static updateSinglePowerUnit(powerUnitId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const powerUnit = yield PowerUnit_model_1.default.findByPk(powerUnitId);
            if (!powerUnit)
                throw new Error('PowerUnit not found');
            yield powerUnit.update(update);
            const updatedPowerUnit = yield PowerUnit_model_1.default.findByPk(powerUnitId);
            if (!updatedPowerUnit)
                throw new Error('PowerUnit not found');
            return updatedPowerUnit;
        });
    }
}
exports.default = PowerUnitService;
