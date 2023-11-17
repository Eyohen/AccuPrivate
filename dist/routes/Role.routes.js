"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Role_controller_1 = __importDefault(require("../controllers/Public/Role.controller"));
const Role_controller_2 = __importDefault(require("../controllers/Admin/Role.controller"));
const Interface_1 = require("../utils/Interface");
const router = express_1.default.Router();
router
    // .use(basicAuth('access'))
    // Public routes
    .get('/', Role_controller_1.default.getRoles)
    .get('/info', Role_controller_1.default.getRoleInfo)
    // Admin routes
    .patch('/', (0, Interface_1.AuthenticatedController)(Role_controller_2.default.updateRole))
    .post('/new', (0, Interface_1.AuthenticatedController)(Role_controller_2.default.createRole));
exports.default = router;
