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
const Meter_model_1 = __importDefault(require("../models/Meter.model"));
class MeterService {
    static addMeter(meter) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMeter = Meter_model_1.default.build(meter);
            yield newMeter.save();
            return newMeter;
        });
    }
    static viewMeters() {
        return __awaiter(this, void 0, void 0, function* () {
            const meters = yield Meter_model_1.default.findAll();
            return meters;
        });
    }
    static viewSingleMeter(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const meter = yield Meter_model_1.default.findByPk(uuid);
            return meter;
        });
    }
    static viewSingleMeterByMeterNumber(meterNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const meter = yield Meter_model_1.default.findOne({ where: { meterNumber } });
            return meter;
        });
    }
    static viewMetersWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const meters = yield Meter_model_1.default.findAll(query);
            return meters;
        });
    }
    static updateSingleMeter() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = MeterService;
