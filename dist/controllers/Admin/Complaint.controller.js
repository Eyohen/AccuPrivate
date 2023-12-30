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
exports.ComplaintController = void 0;
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const fs_1 = __importDefault(require("fs"));
const FileUpload_1 = __importDefault(require("../../utils/FileUpload"));
const Complaint_model_1 = require("../../models/Complaint.model");
const Errors_1 = require("../../utils/Errors");
const Complaint_service_1 = __importDefault(require("../../services/Complaint.service"));
class ComplaintController {
    static getComplaint(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const complaint = yield Complaint_service_1.default.viewSingleComplaint(id);
                res.status(200).json({
                    status: 'success',
                    data: {
                        complaint
                    },
                });
            }
            catch (err) {
                next(new Errors_1.InternalServerError('Sorry Couldn\'t get complaint'));
            }
        });
    }
    static getComplaints(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entityId, page, size, status } = req.query;
            const limit = parseInt(size) || null;
            const offset = parseInt(page) || null;
            const _entityId = entityId;
            const _status = status;
            try {
                const complaints = yield Complaint_service_1.default.viewAllComplainsPaginatedFiltered(limit, offset, _entityId, _status);
                res.status(200).json({
                    status: 'success',
                    data: complaints,
                });
            }
            catch (err) {
                console.log(err);
                next(new Errors_1.InternalServerError('Sorry Couldn\'t get complaint'));
            }
        });
    }
    // static async getAllComplaints(){
    // }
    static createComplaint(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = ((_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.entity.id) || req.body.entityId;
            const { message, category, title, } = req.body;
            if (!message) {
                return next(new Errors_1.BadRequestError('No message  provided'));
            }
            if (!title) {
                return next(new Errors_1.BadRequestError('No title provided'));
            }
            if (!category) {
                return next(new Errors_1.BadRequestError('No category  provided'));
            }
            const entity = yield Entity_service_1.default.viewSingleEntity(entityId);
            if (!entity) {
                return next(new Errors_1.InternalServerError('Authenticated Entity not found'));
            }
            const imageFile = req.file;
            let secureUrl = '';
            if (imageFile) {
                secureUrl = yield FileUpload_1.default.uploadComplainPicture({
                    filePath: imageFile.path,
                });
                fs_1.default.unlinkSync(imageFile.path);
            }
            try {
                const complaint = yield Complaint_service_1.default.addComplaint({
                    category,
                    message,
                    image: secureUrl || '',
                    status: Complaint_model_1.Status.PENDING,
                    entityId,
                    title
                });
                res.status(200).json({
                    status: 'success',
                    data: {
                        complaint
                    },
                });
            }
            catch (err) {
                next(new Errors_1.InternalServerError('Sorry Couldn\'t create complaint'));
            }
        });
    }
}
exports.ComplaintController = ComplaintController;
