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
const Rbac_1 = __importDefault(require("../middlewares/Rbac"));
const Role_model_1 = require("../models/Role.model");
const router = express_1.default.Router();
router
    .post('/signup', Auth_controller_1.default.signup)
    .post('/signup/acc', Auth_controller_1.default.otherSignup)
    .post('/verifyemail', (0, Auth_1.basicAuth)('emailverification'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.verifyEmail))
    .get('/verifyemail', Auth_controller_1.default.resendVerificationEmail)
    .post('/forgotpassword', Auth_controller_1.default.forgotPassword)
    .post('/resetpassword', (0, Auth_1.basicAuth)('passwordreset'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.resetPassword))
    .post('/changepassword', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.changePassword))
    .post('/login', Auth_controller_1.default.login)
    .post('/login/confirm', (0, Auth_1.basicAuth)('otp'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.completeLogin))
    .post('/login/admin', Auth_controller_1.default.login)
    .post('/login/customer', Auth_controller_1.default.login)
    .patch('/login/otp-req', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.updateLoginOTPRequirement))
    .post('/deactivate', (0, Auth_1.basicAuth)('access'), Rbac_1.default.validateRole([Role_model_1.RoleEnum.SuperAdmin]), (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.deactivatePartner))
    .post('/activate', (0, Auth_1.basicAuth)('access'), Rbac_1.default.validateRole([Role_model_1.RoleEnum.SuperAdmin]), (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.activatePartner))
    .post('/logout', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.logout))
    .get('/loggeduser', (0, Auth_1.basicAuth)('access'), (0, Interface_1.AuthenticatedController)(Auth_controller_1.default.getLoggedUserData))
    .post('/su/activate/req', Auth_controller_2.default.requestSuperAdminActivation)
    .post('/su/activate', (0, Auth_1.basicAuth)('su_activation'), Rbac_1.default.validateRole([Role_model_1.RoleEnum.SuperAdmin]), (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.completeSuperAdminActivationRequest))
    .post('/su/deactivate/req', Auth_controller_2.default.requestSuperAdminDeActivation)
    .post('/su/deactivate', (0, Auth_1.basicAuth)('su_activation'), Rbac_1.default.validateRole([Role_model_1.RoleEnum.SuperAdmin]), (0, Interface_1.AuthenticatedController)(Auth_controller_2.default.completeSuperAdminDeActivationRequest));
exports.default = router;
