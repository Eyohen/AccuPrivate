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
const Role_model_1 = __importDefault(require("../models/Role.model"));
class RoleService {
    static viewAllRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield Role_model_1.default.findAll();
            return roles;
        });
    }
    static viewRoleByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield Role_model_1.default.findOne({ where: { name } });
            if (!role) {
                throw new Error('Role not found');
            }
            return role;
        });
    }
    static viewRoleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield Role_model_1.default.findByPk(id);
            if (!role) {
                throw new Error('Role not found');
            }
            return role;
        });
    }
    static addRole(roleData) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = Role_model_1.default.build(roleData);
            yield role.save();
            return role;
        });
    }
    static updateRole(role, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield role.update(dataToUpdate);
            const updatedRole = yield Role_model_1.default.findOne({ where: { id: role.id } });
            if (!updatedRole) {
                throw new Error('Role not found');
            }
            return updatedRole;
        });
    }
}
exports.default = RoleService;
