"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Powerunit_controller_1 = __importDefault(require("../../controllers/Public/Powerunit.controller"));
const router = express_1.default.Router();
router
    .get('/info', Powerunit_controller_1.default.getPowerUnitInfo)
    .get('/', Powerunit_controller_1.default.getPowerUnits);
exports.default = router;
