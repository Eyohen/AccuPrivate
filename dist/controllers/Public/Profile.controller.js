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
const Errors_1 = require("../../utils/Errors");
const FileUpload_1 = __importDefault(require("../../utils/FileUpload"));
const fs_1 = __importDefault(require("fs"));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const Token_1 = require("../../utils/Auth/Token");
class ProfileController {
    static updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity: { id } } = req.user.user;
            const entity = yield Entity_service_1.default.viewSingleEntity(id);
            if (!entity) {
                return next(new Errors_1.InternalServerError('Authenticated Entity not found'));
            }
            const imageFile = req.file;
            if (!imageFile) {
                return next(new Errors_1.BadRequestError('No image file provided'));
            }
            const profile = Entity_service_1.default.getAssociatedProfile(entity);
            if (!profile) {
                return next(new Errors_1.InternalServerError('Authenticated entity profile not found'));
            }
            const secureUrl = yield FileUpload_1.default.uploadProfilePicture({
                filePath: imageFile.path,
                entity
            });
            fs_1.default.unlinkSync(imageFile.path);
            yield entity.update({ profilePicture: secureUrl });
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: {
                    imageLink: secureUrl
                }
            });
        });
    }
    static updateProfileData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity } = req.user.user;
            const { email } = req.body;
            const entity_ = yield Entity_service_1.default.viewSingleEntityByEmail(entity.email);
            if (!entity_) {
                return next(new Errors_1.InternalServerError('Authenticated Partner not found'));
            }
            yield entity_.update({ email });
            yield Token_1.AuthUtil.deleteToken({ entity: entity_, tokenType: 'access', tokenClass: 'token' });
            yield Token_1.AuthUtil.deleteToken({ entity: entity_, tokenType: 'refresh', tokenClass: 'token' });
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: null
            });
        });
    }
}
exports.default = ProfileController;
