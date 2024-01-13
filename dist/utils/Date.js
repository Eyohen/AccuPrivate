"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NigerianDate = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class NigerianDate {
    constructor() {
        // Nigeria is in the West Africa Time (WAT) zone
        this.timeZone = 'Africa/Lagos';
    }
    getCurrentNigerianDate() {
        const currentDate = new Date();
        const nigerianDate = this.convertToTimeZone(currentDate, this.timeZone);
        return nigerianDate;
    }
    convertToTimeZone(date, targetTimeZone) {
        const targetDate = moment_timezone_1.default.tz(date, targetTimeZone).tz(targetTimeZone).format();
        return targetDate;
    }
}
exports.NigerianDate = NigerianDate;
