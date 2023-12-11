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
const Event_service_1 = __importDefault(require("../../services/Event.service"));
class EventController {
    static getEventInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { eventId } = req.query;
            const event = yield Event_service_1.default.viewSingleEvent(eventId);
            res.status(200).json({
                status: 'success',
                data: {
                    event
                }
            });
        });
    }
    static getEvents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transactionId, page, limit } = req.query;
            const events = yield Event_service_1.default.viewEventsForTransaction(transactionId);
            res.status(200).json({
                status: 'success',
                data: {
                    events
                }
            });
        });
    }
}
exports.default = EventController;
