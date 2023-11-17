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
const Entity_model_1 = __importDefault(require("../../models/Entity/Entity.model"));
const Role_service_1 = __importDefault(require("../Role.service"));
class EntityService {
    static addEntity(entityData, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield Role_service_1.default.viewRoleByName(entityData.role);
            if (!role) {
                throw new Error('Role not found');
            }
            const entity = Entity_model_1.default.build(Object.assign(Object.assign({}, entityData), { roleId: role.id }));
            const _transaction = transaction ? yield entity.save({ transaction }) : yield entity.save();
            return _transaction;
        });
    }
    static viewEntity() {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findAll();
            return entity;
        });
    }
    static viewSingleEntity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findByPk(id);
            if (!entity) {
                throw new Error('Entity not found');
            }
            return entity;
        });
    }
    static viewSingleEntityByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findOne({ where: { email } });
            if (!entity) {
                return null;
            }
            return entity;
        });
    }
    static updateEntity(entity, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield entity.update(dataToUpdate);
            const updatedEntity = yield Entity_model_1.default.findOne({ where: { id: entity.id } });
            if (!updatedEntity) {
                throw new Error('Entity not found');
            }
            return updatedEntity;
        });
    }
    static viewEntityWithCustomQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield Entity_model_1.default.findAll(query);
            return entity;
        });
    }
    static getAssociatedProfile(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const partnerProfile = yield entity.$get('partnerProfile');
            const teamMemberProfile = yield entity.$get('teamMemberProfile');
            return partnerProfile || teamMemberProfile;
        });
    }
}
exports.default = EntityService;
