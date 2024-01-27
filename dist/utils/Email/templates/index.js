"use strict";
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
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const Constants_1 = require("../../Constants");
const containerTemplate = fs_1.default.readFileSync(__dirname + '/container.ejs', 'utf8');
const container = (contentTemplate) => ejs_1.default.render(containerTemplate, { contentTemplate, LOGO_URL: Constants_1.LOGO_URL });
class EmailTemplate {
    constructor() {
        this.failedTransaction = ({ transaction }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/failedtxn.ejs', { transaction }));
        });
        this.receipt = ({ transaction, meterNumber, token }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/receipt.ejs', { transaction, meterNumber, token }));
        });
        this.airTimeReceipt = ({ transaction, phoneNumber }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/airtime-receipt.ejs', { transaction, phoneNumber }));
        });
        this.emailVerification = ({ partnerEmail, otpCode }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/emailverification.ejs', { partnerEmail, otpCode }));
        });
        this.awaitActivation = (partnerEmail) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/awaitactivation.ejs', { partnerEmail }));
        });
        this.forgotPassword = ({ email, otpCode }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/forgotpassword.ejs', { email, otpCode }));
        });
        this.accountActivation = (email) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/accountactivation.ejs', { email }));
        });
        this.inviteTeamMember = ({ email, password }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/teaminvitation.ejs', { email, password }));
        });
        this.invitePartner = ({ email, password }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/partnerinvitation.ejs', { email, password }));
        });
        this.suAccountActivation = ({ email, authorizationCode }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/su_activation_request.ejs', { email, authorizationCode }));
        });
        this.suDeAccountActivation = ({ email, authorizationCode }) => __awaiter(this, void 0, void 0, function* () {
            return container(yield ejs_1.default.renderFile(__dirname + '/su_deactivation_request.ejs', { email, authorizationCode }));
        });
    }
}
exports.default = EmailTemplate;
