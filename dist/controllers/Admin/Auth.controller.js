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
const Partner_service_1 = __importDefault(require("../../services/Partner.service"));
const Validators_1 = __importDefault(require("../../utils/Validators"));
class AuthController {
    static activatePartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const validEmail = Validators_1.default.validateEmail(email);
            if (!validEmail) {
                throw new Errors_1.BadRequestError('Invalid email');
            }
            const partner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            yield partner.update({ status: Object.assign(Object.assign({}, partner.status), { activated: true }) });
            yield Email_1.default.sendEmail({
                to: partner.email,
                subject: 'Account Activation',
                html: yield new Email_1.EmailTemplate().accountActivation(partner.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Activated partner successfully',
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
            const partner = yield Partner_service_1.default.viewSinglePartnerByEmail(email);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            yield partner.update({ status: Object.assign(Object.assign({}, partner.status), { activated: false }) });
            yield Email_1.default.sendEmail({
                to: partner.email,
                subject: 'Account Activation',
                html: yield new Email_1.EmailTemplate().accountActivation(partner.email)
            });
            res.status(200).json({
                status: 'success',
                message: 'Deactivated partner successfully',
                data: null
            });
        });
    }
}
exports.default = AuthController;
