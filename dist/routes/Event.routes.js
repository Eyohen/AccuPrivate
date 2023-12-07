"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Interface_1 = require("../utils/Interface");
const Event_controller_1 = __importDefault(require("../controllers/Admin/Event.controller"));
exports.router = express_1.default.Router();
exports.router
    .get('/info', (0, Interface_1.AuthenticatedController)(Event_controller_1.default.getEventInfo))
    .get('/', (0, Interface_1.AuthenticatedController)(Event_controller_1.default.getEvents));
exports.default = exports.router;
