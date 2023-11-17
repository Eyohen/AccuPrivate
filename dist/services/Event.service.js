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
const Logger_1 = __importDefault(require("../utils/Logger"));
// EventService class for handling event-related operations
class EventService {
    // Method for adding a new event to the database
    addEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a new event using the Event model
                // const newEvent: Event = await Event.create(event);
                const newEvent = yield Event_model_1.default.build(event);
                newEvent.save();
                return newEvent;
            }
            catch (err) {
                Logger_1.default.info('Error Logging Event');
            }
        });
    }
    // Method for viewing a single event by its UUID
    viewSingleEvent(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find and retrieve an event by its UUID
                const event = yield Event_model_1.default.findByPk(uuid);
                return event;
            }
            catch (err) {
                Logger_1.default.info('Error reading Event');
            }
        });
    }
}
exports.default = EventService;
