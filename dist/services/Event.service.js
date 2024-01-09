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
const Event_model_1 = __importDefault(require("../models/Event.model"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Logger_1 = __importDefault(require("../utils/Logger"));
const TransactionEvent_service_1 = __importDefault(require("./TransactionEvent.service"));
// EventService class for handling event-related operations
class EventService {
    // Method for adding a new event to the database
    static addEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a new event using the Event model
                // const newEvent: Event = await Event.create(event);
                const newEvent = Event_model_1.default.build(event);
                yield newEvent.save();
                return newEvent;
            }
            catch (err) {
                console.error(err);
                Logger_1.default.info('Error Logging Event');
                throw err;
            }
        });
    }
    // Method for viewing a single event by its UUID
    static viewSingleEvent(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find and retrieve an event by its UUID
                const event = yield Event_model_1.default.findOne({ where: { id: uuid }, include: [Transaction_model_1.default] });
                return event;
            }
            catch (err) {
                Logger_1.default.info('Error reading Event');
            }
        });
    }
    static viewEventsForTransaction(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find and retrieve an event by its UUID
                const events = yield Event_model_1.default.findAll({ where: { transactionId }, include: [Transaction_model_1.default] });
                return events;
            }
            catch (err) {
                Logger_1.default.info('Error reading Event');
            }
        });
    }
    static viewSingleEventByTransactionIdAndType(transactionId, eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield Event_model_1.default.findOne({ where: { transactionId, eventType }, include: [Transaction_model_1.default] });
            return event;
        });
    }
}
EventService.transactionEventService = TransactionEvent_service_1.default;
exports.default = EventService;
