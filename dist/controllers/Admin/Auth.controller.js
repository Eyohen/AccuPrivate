"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Errors_1 = require("../../utils/Errors");
const Email_1 = __importStar(require("../../utils/Email"));
const Validators_1 = __importDefault(require("../../utils/Validators"));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const Token_1 = require("../../utils/Auth/Token");
const Constants_1 = require("../../utils/Constants");
const Role_model_1 = require("../../models/Role.model");
class AuthControllerValidator {
    static activatePartner() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
class AuthController {
    static activatePartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            if (role.name === Role_model_1.RoleEnum.SuperAdmin) {
                throw new Errors_1.ForbiddenError('Unauthorized access');
            }
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { activated: true }) });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Account Activation',
                html: yield new Email_1.EmailTemplate().accountActivation(entity.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Activated user successfully',
                data: null
            });
        });
    }
    static deactivatePartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            if (role.name === Role_model_1.RoleEnum.SuperAdmin) {
                throw new Errors_1.ForbiddenError('Unauthorized access');
            }
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { activated: true }) });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Account Activation',
                html: yield new Email_1.EmailTemplate().accountActivation(entity.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Deactivated user successfully',
                data: null
            });
        });
    }
    static requestSuperAdminActivation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            if (role.name !== Role_model_1.RoleEnum.SuperAdmin) {
                throw new Errors_1.ForbiddenError('Unauthorized access');
            }
            const activationCode = yield Token_1.AuthUtil.generateCode({ type: 'su_activation', entity, expiry: 5 * 60 * 60 });
            const [activationCode1, activationCode2, activationCode3] = activationCode.split(':');
            console.log({
                activationCode1,
                activationCode2,
                activationCode3
            });
            // Send activation code to 3 Admins
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_1,
                html: yield (new Email_1.EmailTemplate().suAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_1,
                    authorizationCode: activationCode1,
                })),
                subject: 'Super Admin account activation request'
            });
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_2,
                html: yield (new Email_1.EmailTemplate().suAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_2,
                    authorizationCode: activationCode2,
                })),
                subject: 'Super Admin account activation request'
            });
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_3,
                html: yield (new Email_1.EmailTemplate().suAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_3,
                    authorizationCode: activationCode3,
                })),
                subject: 'Super Admin account activation request'
            });
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'su_activation', entity, profile: entity, expiry: 5 * 60 * 60 });
            res.status(200).json({
                status: 'success',
                message: 'Activation request sent successfully',
                data: {
                    accessToken
                }
            });
        });
    }
    static completeSuperAdminActivationRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationCode1, authorizationCode2, authorizationCode3 } = req.body;
            const authorizationCode = `${authorizationCode1}:${authorizationCode2}:${authorizationCode3}`;
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(req.user.user.entity.email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const validCode = yield Token_1.AuthUtil.compareCode({ entity, tokenType: 'su_activation', token: authorizationCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid authorization code');
            }
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { activated: true }) });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Account Activation',
                html: yield new Email_1.EmailTemplate().accountActivation(entity.email)
            });
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'su_activation', tokenClass: 'code' });
            res.status(200).json({
                status: 'success',
                message: 'Super admin activation successful',
                data: null
            });
        });
    }
    static completeSuperAdminDeActivationRequest(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationCode1, authorizationCode2, authorizationCode3 } = req.body;
            const authorizationCode = `${authorizationCode1}:${authorizationCode2}:${authorizationCode3}`;
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(req.user.user.entity.email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const validCode = yield Token_1.AuthUtil.compareCode({ entity, tokenType: 'su_activation', token: authorizationCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid authorization code');
            }
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { activated: false }) });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Account Deactivation',
                html: yield new Email_1.EmailTemplate().accountActivation(entity.email)
            });
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'su_activation', tokenClass: 'code' });
            res.status(200).json({
                status: 'success',
                message: 'Super admin deactivation successful',
                data: null
            });
        });
    }
    static requestSuperAdminDeActivation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity) {
                throw new Errors_1.BadRequestError('Entity not found');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.BadRequestError('Role not found');
            }
            if (role.name !== Role_model_1.RoleEnum.SuperAdmin) {
                throw new Errors_1.ForbiddenError('Unauthorized access');
            }
            const deactivationCode = yield Token_1.AuthUtil.generateCode({ type: 'su_activation', entity, expiry: 5 * 60 * 60 });
            const [deactivationCode1, deactivationCode2, deactivationCode3] = deactivationCode.split(':');
            console.log({
                deactivationCode1,
                deactivationCode2,
                deactivationCode3
            });
            // Send activation code to 3 Admins
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_1,
                html: yield (new Email_1.EmailTemplate().suDeAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_1,
                    authorizationCode: deactivationCode1,
                })),
                subject: 'Super Admin account deactivation request'
            });
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_2,
                html: yield (new Email_1.EmailTemplate().suDeAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_2,
                    authorizationCode: deactivationCode2,
                })),
                subject: 'Super Admin account deactivation request'
            });
            Email_1.default.sendEmail({
                to: Constants_1.SU_HOST_EMAIL_3,
                html: yield (new Email_1.EmailTemplate().suDeAccountActivation({
                    email: Constants_1.SU_HOST_EMAIL_3,
                    authorizationCode: deactivationCode3,
                })),
                subject: 'Super Admin account deactivation request'
            });
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'su_activation', entity, profile: entity, expiry: 5 * 60 * 60 });
            res.status(200).json({
                status: 'success',
                message: 'Deactivation request sent successfully',
                data: {
                    accessToken
                }
            });
        });
    }
}
exports.default = AuthController;
