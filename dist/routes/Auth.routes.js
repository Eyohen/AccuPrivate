"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_controller_1 = __importDefault(require("../controllers/Public/Auth.controller"));
const Auth_controller_2 = __importDefault(require("../controllers/Admin/Auth.controller"));
const Auth_1 = require("../middlewares/Auth");
const Interface_1 = require("../utils/Interface");
const router = express_1.default.Router();
router
    .post('/signup', Auth_controller_1.default.signup)
    .post('/verifyemail', (0, Auth_1.basicAuth)('emailverification'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.verifyEmail))
    .get('/verifyemail', Auth_controller_1.default.resendVerificationEmail)
    .post('/forgotpassword', Auth_controller_1.default.forgotPassword)
    .post('/resetpassword', (0, Auth_1.basicAuth)('passwordreset'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.resetPassword))
    .post('/changepassword', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.changePassword))
    .post('/login', (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.login))
    .post('/deactivate', (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.deactivatePartner))
    .post('/activate', (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.activatePartner))
    .post('/logout', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.logout))
    .get('/loggeduser', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.getLoggedUserData));
exports.default = router;
