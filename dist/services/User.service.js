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
const User_model_1 = __importDefault(require("../models/User.model"));
class UserService {
    static addUserIfNotExists(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield User_model_1.default.findOne({ where: { email: user.email, phoneNumber: user.phoneNumber } });
            if (existingUser) {
                return existingUser;
            }
            const newUser = User_model_1.default.build(user);
            yield newUser.save();
            return newUser;
        });
    }
    static addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = User_model_1.default.build(user);
                yield newUser.save();
                return newUser;
            }
            catch (error) {
                console.error(error);
                throw new Error();
            }
        });
    }
    static viewSingleUserWithEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_model_1.default.findOne({ where: { email } });
            return user;
        });
    }
    static viewUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const Users = yield User_model_1.default.findAll();
            return Users;
        });
    }
    static viewSingleUser(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_model_1.default.findByPk(uuid);
            return user;
        });
    }
    static updateSingleUser() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = UserService;
