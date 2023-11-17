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
const Password_model_1 = __importDefault(require("../models/Password.model"));
const Cypher_1 = __importDefault(require("../utils/Cypher"));
class PasswordService {
    static addPassword(password, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            password.password = Cypher_1.default.hashPassword(password.password);
            const newPassword = Password_model_1.default.build(password);
            const result = transaction ? yield newPassword.save({ transaction }) : yield newPassword.save();
            return result;
        });
    }
    static comparePassword(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Cypher_1.default.comparePassword(password, hashedPassword);
            return result;
        });
    }
    static viewPasswords() {
        return __awaiter(this, void 0, void 0, function* () {
            const passwords = yield Password_model_1.default.findAll();
            return passwords;
        });
    }
    static viewSinglePassword(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const password = yield Password_model_1.default.findByPk(uuid);
            return password;
        });
    }
    static updatePassword(entityId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Password_model_1.default.updatePassword(entityId, newPassword);
        });
    }
    static viewSinglePasswordByPartnerId(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const password = yield Password_model_1.default.findOne({ where: { entityId } });
            return password;
        });
    }
    static viewPasswordsWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const Passwords = yield Password_model_1.default.findAll(query);
            return Passwords;
        });
    }
}
exports.default = PasswordService;
