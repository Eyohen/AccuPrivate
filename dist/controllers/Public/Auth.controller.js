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
const Partner_service_1 = __importDefault(require("../../services/Partner.service"));
const index_1 = require("../../models/index");
const Password_service_1 = __importDefault(require("../../services/Password.service"));
const token_1 = require("../../utils/Auth/token");
const Validators_1 = __importDefault(require("../../utils/Validators"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
class AuthController {
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const validPassword = Validators_1.default.validatePassword(password);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const existingPartner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (existingPartner) {
                throw new Errors_1.BadRequestError('Email has been used before');
            }
            const transaction = yield index_1.Database.transaction();
            const newPartner = yield Partner_service_1.default.addPartner({
                id: (0, uuid_1.v4)(),
                email,
                status: {
                    activated: false,
                    emailVerified: false
                }
            }, transaction);
            const partnerPassword = yield Password_service_1.default.addPassword({
                id: (0, uuid_1.v4)(),
                partnerId: newPartner.id,
                password
            }, transaction);
            console.log(newPartner.dataValues);
            console.log(partnerPassword.dataValues);
            const accessToken = yield token_1.AuthUtil.generateToken({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 });
            const otpCode = yield token_1.AuthUtil.generateCode({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 });
            yield transaction.commit();
            Logger_1.default.info(otpCode);
            Email_1.default.sendEmail({
                to: newPartner.email,
                subject: 'Verify Email',
                html: yield new Email_1.EmailTemplate().emailVerification({
                    partnerEmail: newPartner.email,
                    otpCode: otpCode
                })
            });
            res.status(201).json({
                status: 'success',
                message: 'Partner created successfully',
                data: {
                    partner: ResponseTrimmer_1.default.trimPartner(newPartner),
                    accessToken,
                }
            });
        });
    }
    static verifyEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otpCode } = req.body;
            const partner = yield Partner_service_1.default.viewSinglePartner(req.user.partner.id);
            if (!partner) {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            if (partner.status.emailVerified) {
                throw new Errors_1.BadRequestError('Email already verified');
            }
            const validCode = yield token_1.AuthUtil.compareCode({ partner: partner.dataValues, tokenType: 'emailverification', token: otpCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid otp code');
            }
            yield partner.update({ status: Object.assign(Object.assign({}, partner.status), { emailVerified: true }) });
            yield token_1.AuthUtil.deleteToken({ partner, tokenType: 'emailverification', tokenClass: 'token' });
            yield Email_1.default.sendEmail({
                to: partner.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(partner.email)
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
            const newPartner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!newPartner) {
                throw new Errors_1.InternalServerError('Authenticate partner record not found');
            }
            if (newPartner.status.emailVerified) {
                throw new Errors_1.BadRequestError('Email already verified');
            }
            const otpCode = yield token_1.AuthUtil.generateCode({ type: 'emailverification', partner: newPartner.dataValues, expiry: 60 * 10 });
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
                    partner: ResponseTrimmer_1.default.trimPartner(newPartner),
                }
            });
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const partner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('No account exist for this email');
            }
            const accessToken = yield token_1.AuthUtil.generateToken({ type: 'passwordreset', partner: partner.dataValues, expiry: 60 * 10 });
            const otpCode = yield token_1.AuthUtil.generateCode({ type: 'passwordreset', partner: partner.dataValues, expiry: 60 * 10 });
            console.log(otpCode);
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
            const { otpCode, newPassword } = req.body;
            const validPassword = Validators_1.default.validatePassword(newPassword);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid password');
            }
            const partner = yield Partner_service_1.default.viewSinglePartner(req.user.partner.id);
            if (!partner) {
                throw new Errors_1.InternalServerError('Partner not found');
            }
            const validCode = yield token_1.AuthUtil.compareCode({ partner: partner.dataValues, tokenType: 'passwordreset', token: otpCode });
            if (!validCode) {
                throw new Errors_1.BadRequestError('Invalid otp code');
            }
            const password = yield partner.$get('password');
            if (!password) {
                throw new Errors_1.InternalServerError('No password found for authneticate partner');
            }
            yield Password_service_1.default.updatePassword(partner.id, newPassword);
            yield token_1.AuthUtil.deleteToken({ partner, tokenType: 'passwordreset', tokenClass: 'token' });
            yield Email_1.default.sendEmail({
                to: partner.email,
                subject: 'Succesful Email Verification',
                html: yield new Email_1.EmailTemplate().awaitActivation(partner.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Password reset successfully',
                data: null
            });
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const partner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('Invalid Email or password');
            }
            const partnerPassword = yield partner.$get('password');
            if (!partnerPassword) {
                throw new Errors_1.BadRequestError('Invalid Email or password');
            }
            const validPassword = yield Password_service_1.default.comparePassword(password, partnerPassword.password);
            if (!validPassword) {
                throw new Errors_1.BadRequestError('Invalid Email or password');
            }
            if (!partner.status.activated) {
                throw new Errors_1.BadRequestError('Account not activated');
            }
            const accessToken = yield token_1.AuthUtil.generateToken({ type: 'access', partner: partner.dataValues, expiry: 60 * 10 });
            const refreshToken = yield token_1.AuthUtil.generateToken({ type: 'refresh', partner: partner.dataValues, expiry: 60 * 60 * 24 * 30 });
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    partner: ResponseTrimmer_1.default.trimPartner(partner),
                    accessToken,
                    refreshToken
                }
            });
        });
    }
}
exports.default = AuthController;
