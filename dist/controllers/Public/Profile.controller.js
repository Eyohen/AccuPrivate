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
const PartnerProfile_service_1 = __importDefault(require("../../services/Entity/Profiles/PartnerProfile.service"));
const FileUpload_1 = __importDefault(require("../../utils/FileUpload"));
const fs_1 = __importDefault(require("fs"));
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
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
                message: 'Partner profile updated successfully',
                data: {
                    imageLink: secureUrl
                }
            });
        });
    }
    static updateProfileDAta(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { partner } = req.user;
            const { email } = req.body;
            const partner_ = yield PartnerProfile_service_1.default.viewSinglePartnerByEmail(partner.email);
            if (!partner_) {
                return next(new Errors_1.InternalServerError('Authenticated Partner not found'));
            }
            yield partner_.update({ email });
            res.status(200).json({
                status: 'success',
                message: 'Partner profile updated successfully',
                data: null
            });
        });
    }
}
exports.default = ProfileController;
