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
const uuid_1 = require("uuid");
const Errors_1 = require("../../utils/Errors");
const Email_1 = __importStar(require("../../utils/Email"));
const ResponseTrimmer_1 = __importDefault(require("../../utils/ResponseTrimmer"));
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const index_1 = require("../../models/index");
const Password_service_1 = __importDefault(require("../../services/Password.service"));
const Token_1 = require("../../utils/Auth/Token");
const Validators_1 = __importDefault(require("../../utils/Validators"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
const Cypher_1 = __importDefault(require("../../utils/Cypher"));
const ApiKey_service_1 = __importDefault(require("../../services/ApiKey.service "));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const Role_model_1 = require("../../models/Role.model");
const Profiles_1 = require("../../models/Entity/Profiles");
const Notification_1 = __importDefault(require("../../utils/Notification"));
const Constants_1 = require("../../utils/Constants");
const Notification_service_1 = __importDefault(require("../../services/Notification.service"));
const Webhook_service_1 = __importDefault(require("../../services/Webhook.service"));
const Role_service_1 = __importDefault(require("../../services/Role.service"));
class AuthController {
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const validPassword = Validators_1.default.validatePassword(password);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const existingPartner = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(email);
            if (existingPartner) {
                throw new Errors_1.BadRequestError('Email has been used before');
            }
            const transaction = yield index_1.Database.transaction();
            const newPartner = yield PartnerProfile_service_1.default.addPartner({
                id: (0, uuid_1.v4)(),
                email,
            }, transaction);
            const entity = yield Entity_service_1.default.addEntity({
                id: (0, uuid_1.v4)(),
                email,
                status: {
                    activated: false,
                    emailVerified: false
                },
                partnerProfileId: newPartner.id,
                role: Role_model_1.RoleEnum.Partner,
                notificationSettings: {
                    login: true,
                    failedTransactions: true,
                    logout: true
                },
                requireOTPOnLogin: false
            }, transaction);
            const apiKey = yield ApiKey_service_1.default.addApiKey({
                partnerId: newPartner.id,
                key: newPartner.key,
                active: true,
                id: (0, uuid_1.v4)()
            }, transaction);
            const secKeyInCache = Cypher_1.default.encryptString(newPartner.sec);
            yield Token_1.TokenUtil.saveTokenToCache({ key: secKeyInCache, token: Cypher_1.default.encryptString(newPartner.key) });
            yield ApiKey_service_1.default.setCurrentActiveApiKeyInCache(newPartner, apiKey.key.toString());
            const partnerPassword = yield Password_service_1.default.addPassword({
                id: (0, uuid_1.v4)(),
                entityId: entity.id,
                password
            }, transaction);
            yield Webhook_service_1.default.addWebhook({
                id: (0, uuid_1.v4)(),
                partnerId: newPartner.id,
            }, transaction);
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { emailVerified: true }) });
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'emailverification', entity, profile: newPartner, expiry: 60 * 10 });
            const otpCode = yield Token_1.AuthUtil.generateCode({ type: 'emailverification', entity, expiry: 60 * 10 });
            yield transaction.commit();
            Logger_1.default.info(otpCode);
            yield Email_1.default.sendEmail({
                to: newPartner.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(newPartner.email)
            });
            res.status(201).json({
                status: 'success',
                message: 'Partner created successfully',
                data: {
                    partner: ResponseTrimmer_1.default.trimPartner(Object.assign(Object.assign({}, newPartner.dataValues), { entity })),
                    accessToken,
                }
            });
        });
    }
    static otherSignup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, roleId } = req.body;
            const role = yield Role_service_1.default.viewRoleById(roleId);
            if (!role) {
                throw new Errors_1.BadRequestError('Invalid role');
            }
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const validPassword = Validators_1.default.validatePassword(password);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const transaction = yield index_1.Database.transaction();
            const entity = yield Entity_service_1.default.addEntity({
                id: (0, uuid_1.v4)(),
                email,
                status: {
                    activated: false,
                    emailVerified: false
                },
                role: role.name,
                notificationSettings: {
                    login: true,
                    failedTransactions: true,
                    logout: true
                },
                requireOTPOnLogin: false
            }, transaction);
            const entityPassword = yield Password_service_1.default.addPassword({
                id: (0, uuid_1.v4)(),
                entityId: entity.id,
                password
            }, transaction);
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { emailVerified: true }) });
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'emailverification', entity, profile: entity, expiry: 60 * 10 });
            const otpCode = yield Token_1.AuthUtil.generateCode({ type: 'emailverification', entity, expiry: 60 * 10 });
            yield transaction.commit();
            Logger_1.default.info(otpCode);
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(entity.email)
            });
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    entity: entity.dataValues,
                    accessToken,
                }
            });
        });
    }
    static verifyEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otpCode } = req.body;
            const { entity: { id } } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            if (entity.status.emailVerified) {
                throw new Errors_1.BadRequestError('Email already verified');
            }
            yield entity.update({ status: Object.assign(Object.assign({}, entity.status), { emailVerified: true }) });
            const validCode = yield Token_1.AuthUtil.compareCode({ entity, tokenType: 'emailverification', token: otpCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid otp code');
            }
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'emailverification', tokenClass: 'token' });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(entity.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Email verified successfully',
                data: null
            });
        });
    }
    static resendVerificationEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = req.query.email;
            const newPartner = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(email);
            if (!newPartner) {
                throw new Errors_1.InternalServerError('Authenticate partner record not found');
            }
            const entity = yield newPartner.$get('entity');
            if (!entity) {
                throw new Errors_1.InternalServerError('Partner entity not found');
            }
            if (entity.status.emailVerified) {
                throw new Errors_1.BadRequestError('Email already verified');
            }
            const otpCode = yield Token_1.AuthUtil.generateCode({ type: 'emailverification', entity, expiry: 60 * 10 });
            Email_1.default.sendEmail({
                to: newPartner.email,
                subject: 'Verify Email',
                html: yield new Email_1.EmailTemplate().emailVerification({
                    partnerEmail: newPartner.email,
                    otpCode: otpCode
                })
            });
            res.status(200).json({
                status: 'success',
                message: 'Verification code sent successfully',
                data: {
                    partner: ResponseTrimmer_1.default.trimPartner(Object.assign(Object.assign({}, newPartner.dataValues), { entity: entity.dataValues })),
                }
            });
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(email);
            if (!entity) {
                throw new Errors_1.BadRequestError('No account exist for this email');
            }
            const profile = yield Entity_service_1.default.getAssociatedProfile(entity);
            if (!profile) {
                throw new Errors_1.InternalServerError('Partner profile not found');
            }
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'passwordreset', entity, profile, expiry: 60 * 10 });
            const otpCode = yield Token_1.AuthUtil.generateCode({ type: 'passwordreset', entity, expiry: 60 * 10 });
            Constants_1.NODE_ENV === 'development' && Logger_1.default.info(otpCode);
            Email_1.default.sendEmail({
                to: email,
                subject: 'Forgot password',
                html: yield new Email_1.EmailTemplate().forgotPassword({ email, otpCode })
            });
            res.status(200).json({
                status: 'success',
                message: 'Otpcode sent to users email',
                data: {
                    accessToken
                }
            });
        });
    }
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const { otpCode, newPassword } = req.body;
            const validPassword = Validators_1.default.validatePassword(newPassword);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.InternalServerError('Partner entity not found');
            }
            const validCode = yield Token_1.AuthUtil.compareCode({ entity, tokenType: 'passwordreset', token: otpCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid otp code');
            }
            const password = yield entity.$get('password');
            if (!password) {
                throw new Errors_1.InternalServerError('No password found for authneticate partner');
            }
            yield Password_service_1.default.updatePassword(entity.id, newPassword);
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'passwordreset', tokenClass: 'token' });
            yield Email_1.default.sendEmail({
                to: entity.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(entity.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Password reset successfully',
                data: null
            });
        });
    }
    static changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { oldPassword, newPassword } = req.body;
            const validPassword = Validators_1.default.validatePassword(newPassword);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const { entity: { id } } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            const profile = yield Entity_service_1.default.getAssociatedProfile(entity);
            if (!profile) {
                throw new Errors_1.InternalServerError('Profile not found');
            }
            const password = yield entity.$get('password');
            if (!password) {
                throw new Errors_1.InternalServerError('No password found for authneticate entity');
            }
            const validOldPassword = yield Password_service_1.default.comparePassword(oldPassword, password.password);
            if (!validOldPassword) {
                throw new Errors_1.BadRequestError('Invalid old password');
            }
            yield Password_service_1.default.updatePassword(entity.id, newPassword);
            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully',
                data: null
            });
        });
    }
    static initLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, phoneNumber: _phoneNumber } = req.body;
            const phoneNumber = _phoneNumber ? _phoneNumber.startsWith('+234') ? _phoneNumber.replace('+234', '0') : _phoneNumber : null;
            let entity = email && (yield Entity_service_1.default.viewSingleEntityByEmail(email));
            entity = phoneNumber ? yield Entity_service_1.default.viewSingleEntityByPhoneNumber(phoneNumber) : entity;
            if (!entity) {
                throw new Errors_1.BadRequestError('Invalid Email or password');
            }
            const entityPassword = yield entity.$get('password');
            if (!entityPassword) {
                throw new Errors_1.InternalServerError('No password found for authneticate entity');
            }
            if (!entity.status.activated) {
                throw new Errors_1.BadRequestError('Account not activated');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.InternalServerError('Role not found for user');
            }
            //for admins 
            const requestWasMadeToAdminRoute = req.url === '/login/admin';
            const userIsAdmin = [Role_model_1.RoleEnum.SuperAdmin, Role_model_1.RoleEnum.Admin].includes(role.name);
            const unauthorizedAccess = (requestWasMadeToAdminRoute && !userIsAdmin) || (!requestWasMadeToAdminRoute && userIsAdmin);
            if (unauthorizedAccess) {
                throw new Errors_1.ForbiddenError('Unauthorized access to current login route');
            }
            //for customer
            const requestWasMadeToCustomerRoute = req.url === '/login/customer';
            const userIsCustomer = [Role_model_1.RoleEnum.EndUser].includes(role.name);
            const unauthorizedAccessCustomer = (requestWasMadeToCustomerRoute && !userIsCustomer) || (!requestWasMadeToCustomerRoute && userIsCustomer);
            if (unauthorizedAccessCustomer) {
                throw new Errors_1.ForbiddenError('Unauthorized access to current login route');
            }
            // Only partners and team members have a profile
            const profile = yield Entity_service_1.default.getAssociatedProfile(entity);
            if (!profile && [Role_model_1.RoleEnum.Partner, Role_model_1.RoleEnum.TeamMember].includes(entity.role.name)) {
                throw new Errors_1.InternalServerError('Profile not found');
            }
            let accessToken = null;
            if (entity.requireOTPOnLogin) {
                const otpCode = yield Token_1.AuthUtil.generateCode({ type: 'otp', entity, expiry: 60 * 60 * 3 });
                console.log({ otpCode });
                accessToken = yield Token_1.AuthUtil.generateToken({ type: 'otp', entity, profile: entity, expiry: 60 * 60 * 3 });
                yield Email_1.default.sendEmail({
                    to: entity.email,
                    text: 'Login authorization code is ' + otpCode,
                    subject: 'Login Authorization'
                });
            }
            else {
                const validPassword = yield Password_service_1.default.comparePassword(password, entityPassword.password);
                if (!validPassword) {
                    throw new Errors_1.BadRequestError('Invalid Email or password');
                }
            }
            const refreshToken = accessToken ? undefined : yield Token_1.AuthUtil.generateToken({ type: 'refresh', entity, profile: profile !== null && profile !== void 0 ? profile : entity, expiry: 60 * 60 * 60 * 60 });
            accessToken = accessToken !== null && accessToken !== void 0 ? accessToken : yield Token_1.AuthUtil.generateToken({ type: 'access', entity, profile: profile !== null && profile !== void 0 ? profile : entity, expiry: 60 * 60 * 24 * 30 });
            if ([Role_model_1.RoleEnum.TeamMember].includes(entity.role.name)) {
                const memberProfile = profile;
                const partnerProfile = yield memberProfile.$get('partner');
                if (!partnerProfile) {
                    throw new Errors_1.InternalServerError('Partner profile not found');
                }
                const partnerEntity = yield partnerProfile.$get('entity');
                if (!partnerEntity) {
                    throw new Errors_1.InternalServerError('Partner entity not found');
                }
                const notification = yield Notification_service_1.default.addNotification({
                    id: (0, uuid_1.v4)(),
                    title: 'New Login',
                    message: `
                    A new login was detected on a member account at ${new Date().toLocaleString()}
                    
                    Member: ${memberProfile.name}
                    Email: ${entity.email}
                    Location: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}

                    If this was not you, please contact your administrator immediately.
                    `,
                    heading: 'New Login Detected',
                    entityId: partnerEntity.id,
                    read: false
                });
                entity.notificationSettings.login && (yield Notification_1.default.sendNotificationToUser(entity.id, notification));
            }
            res.status(200).json({
                status: 'success',
                message: 'Login request initiated successfully',
                data: {
                    entity: entity.dataValues,
                    unreadNotificationsCount: (yield Notification_service_1.default.getUnreadNotifications(entity.id)).length,
                    accessToken,
                    refreshToken
                }
            });
        });
    }
    static completeLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otpCode } = req.body;
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(req.user.user.entity.email);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            const validCode = yield Token_1.AuthUtil.compareCode({ entity, tokenType: 'otp', token: otpCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid otp code');
            }
            const profile = yield Entity_service_1.default.getAssociatedProfile(entity);
            if (!profile && req.user.user.entity.role !== Role_model_1.RoleEnum.EndUser) {
                throw new Errors_1.InternalServerError('Entity not found for authenticated user');
            }
            console.log({
                profile: profile === null || profile === void 0 ? void 0 : profile.dataValues,
                entity: entity.dataValues
            });
            const accessToken = yield Token_1.AuthUtil.generateToken({ type: 'access', entity, profile: profile !== null && profile !== void 0 ? profile : entity, expiry: 60 * 60 * 24 * 30 });
            const refreshToken = yield Token_1.AuthUtil.generateToken({ type: 'refresh', entity, profile: profile !== null && profile !== void 0 ? profile : entity, expiry: 60 * 60 * 60 * 60 });
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    entity: entity.dataValues,
                    unreadNotificationsCount: (yield Notification_service_1.default.getUnreadNotifications(entity.id)).length,
                    accessToken,
                    refreshToken
                }
            });
        });
    }
    static updateLoginOTPRequirement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requireOtp, entityId } = req.body;
            let entity = yield Entity_service_1.default.viewSingleEntityByEmail(req.user.user.entity.email);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity record not found for Authenticated user');
            }
            const requestMadeByPartner = req.user.user.entity.role === Role_model_1.RoleEnum.Partner;
            if (requestMadeByPartner && entityId && (entity === null || entity === void 0 ? void 0 : entity.id) !== entityId) {
                const userEntity = yield Entity_service_1.default.viewSingleEntity(entityId);
                if (!userEntity) {
                    throw new Errors_1.InternalServerError('Entity record not found for user');
                }
                const profile = yield Entity_service_1.default.getAssociatedProfile(userEntity);
                if (!profile) {
                    throw new Errors_1.InternalServerError('Profile not found');
                }
                if (profile instanceof Profiles_1.TeamMemberProfile && profile.partnerId !== req.user.user.profile.id) {
                    throw new Errors_1.ForbiddenError('Unauthorized access to user');
                }
                entity = userEntity;
            }
            yield Entity_service_1.default.updateEntity(entity, { requireOTPOnLogin: requireOtp });
            res.status(200).json({
                status: 'success',
                message: 'OTP requirement updated successfully',
                data: null
            });
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'access', tokenClass: 'token' });
            yield Token_1.AuthUtil.deleteToken({ entity, tokenType: 'refresh', tokenClass: 'token' });
            res.status(200).json({
                status: 'success',
                message: 'Logout successful',
                data: null
            });
        });
    }
    static getLoggedUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_service_1.default.viewSingleEntityByEmail(req.user.user.entity.email);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            const partner = yield entity.$get('partnerProfile');
            const role = entity.role.name;
            if (partner === null && role === 'PARTNER') {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            const returnData = role === 'PARTNER'
                ? { entity: entity.dataValues, partner: ResponseTrimmer_1.default.trimPartner(Object.assign(Object.assign({}, partner.dataValues), { entity })) }
                : { entity: entity.dataValues };
            res.status(200).json({
                status: 'success',
                message: 'Entity data retrieved successfully',
                data: returnData
            });
        });
    }
}
exports.default = AuthController;
