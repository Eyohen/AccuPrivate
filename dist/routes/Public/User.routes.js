"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_controller_1 = __importDefault(require("../../controllers/Admin/User.controller"));
const router = express_1.default.Router();
router
    .get('/info', User_controller_1.default.getUserInfo)
    .get('/', User_controller_1.default.getUsers);
exports.default = router;
