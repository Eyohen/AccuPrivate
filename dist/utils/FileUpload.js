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
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const Constants_1 = require("./Constants");
const crypto_1 = require("crypto");
class FileUploadService {
    static uploadToCloudinary(fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { path, fileName, destinationPath } = fileOptions;
            if (!path || !fileName || !destinationPath) {
                throw new Error('Invalid file options');
            }
            cloudinary_1.default.v2.config({
                cloud_name: Constants_1.CLOUDINARY_CLOUD_NAME,
                api_key: Constants_1.CLOUDINARY_API_KEY,
                api_secret: Constants_1.CLOUDINARY_API_SECRET
            });
            const data = yield cloudinary_1.default.v2.uploader.upload(path, {
                folder: destinationPath,
                public_id: fileName,
                resource_type: 'auto'
            });
            return data.secure_url;
        });
    }
    static uploadProfilePicture({ filePath, entity }) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = filePath, fileName = `${(0, crypto_1.randomUUID)()}.jpg`, destinationPath = `profilepictueres/${entity.id}`;
            const secureUrl = yield this.uploadToCloudinary({
                path,
                fileName,
                destinationPath
            });
            return secureUrl;
        });
    }
}
FileUploadService.multerUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: 'src/uploads',
        filename: (req, file, cb) => {
            cb(null, (0, crypto_1.randomUUID)() + file.originalname);
        }
    })
});
exports.default = FileUploadService;
