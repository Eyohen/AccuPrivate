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
exports.EmailTemplate = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const templates_1 = __importDefault(require("./templates"));
exports.EmailTemplate = templates_1.default;
const Logger_1 = __importDefault(require("../Logger"));
const Constants_1 = require("../Constants");
class EmailService {
    static sendEmail(mailOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    host: Constants_1.EMAIL_HOST,
                    port: Constants_1.EMAIL_PORT,
                    secure: true,
                    auth: {
                        type: "OAuth2",
                        user: Constants_1.EMAIL_HOST_ADDRESS,
                        clientId: Constants_1.OAUTH_CLIENT_ID,
                        clientSecret: Constants_1.OAUTH_CLIENT_SECRET,
                        refreshToken: Constants_1.OAUTH_REFRESH_TOKEN,
                        accessToken: Constants_1.OAUTH_ACCESS_TOKEN,
                    },
                });
                mailOptions.from = (_a = mailOptions.from) !== null && _a !== void 0 ? _a : Constants_1.EMAIL_HOST_ADDRESS;
                yield transporter.sendMail(mailOptions);
            }
            catch (error) {
                Logger_1.default.error(error.stack);
            }
        });
    }
}
exports.default = EmailService;
