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
const Entity_service_1 = __importDefault(require("../../services/Entity/Entity.service"));
const Webhook_service_1 = __importDefault(require("../../services/Webhook.service"));
const Errors_1 = require("../../utils/Errors");
const Validators_1 = __importDefault(require("../../utils/Validators"));
const Profiles_1 = require("../../services/Entity/Profiles");
const Role_model_1 = require("../../models/Role.model");
class WebhookController {
    static updateWebhook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { url } = req.body;
            const { user: { profile: partner } } = req.user;
            const validUrl = Validators_1.default.validateUrl(url);
            if (!validUrl) {
                throw new Errors_1.BadRequestError('Invalid url');
            }
            const partnerProfile = yield Profiles_1.PartnerProfileService.viewSinglePartner(partner.id);
            if (!partnerProfile) {
                throw new Errors_1.InternalServerError('Partner record for Authenticated partner not found');
            }
            const webhook = yield Webhook_service_1.default.viewWebhookByPartnerId(partnerProfile.id);
            if (!webhook) {
                throw new Errors_1.InternalServerError('Webhook not found for authenticated partner');
            }
            const updatedWebhook = yield Webhook_service_1.default.updateWebhook(webhook, { url });
            res.status(201).json({
                status: 'success',
                message: 'Webhook updated successfully',
                data: {
                    webhook: updatedWebhook
                }
            });
        });
    }
    static viewWebhookByPartnerId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { partnerId } = req.query;
            const partnerIdProvidedAndNotAdmin = partnerId && ![Role_model_1.RoleEnum.Admin].includes(req.user.user.entity.role);
            const partnerIsNotAuthenticatedUser = partnerId !== req.user.user.profile.id;
            if (partnerIdProvidedAndNotAdmin && partnerIsNotAuthenticatedUser) {
                throw new Errors_1.ForbiddenError('Unauthorized');
            }
            const id = partnerId || req.user.user.profile.id;
            const partner = yield Profiles_1.PartnerProfileService.viewSinglePartner(id);
            if (!partner) {
                throw new Errors_1.BadRequestError('Partner not found');
            }
            const webhook = yield Webhook_service_1.default.viewWebhookByPartnerId(id);
            if (!webhook) {
                throw new Errors_1.BadRequestError('Webhook not found');
            }
            res.status(200).json({
                status: 'success',
                message: 'Webhook retrieved successfully',
                data: {
                    webhook
                }
            });
        });
    }
    static viewWebhookById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { webhookId } = req.query;
            const entity = yield Entity_service_1.default.viewSingleEntity(req.user.user.entity.id);
            if (!entity) {
                throw new Errors_1.InternalServerError('Entity not found');
            }
            const role = yield entity.$get('role');
            if (!role) {
                throw new Errors_1.InternalServerError('Role not found');
            }
            const requestMadeByAdmin = ['Admin', 'SuperAdmin'].includes(role.name);
            if (!requestMadeByAdmin && webhookId) {
                throw new Errors_1.ForbiddenError('Unauthorized');
            }
            const webhook = yield Webhook_service_1.default.viewWebhookById(webhookId);
            if (!webhook) {
                throw new Errors_1.BadRequestError('Webhook not found');
            }
            // Check if user is the owner of the webhook
            const { user: { profile: partner } } = req.user;
            const partnerProfile = yield Entity_service_1.default.viewSingleEntityByEmail(partner.id);
            if (!partnerProfile) {
                throw new Errors_1.InternalServerError('Partner record for Authenticated partner not found');
            }
            // Only admin should be able to view webhooks that do not belong to them
            const webhookBelongsToUser = webhook.partnerId === partnerProfile.id;
            if (!requestMadeByAdmin && !webhookBelongsToUser) {
                throw new Errors_1.ForbiddenError('Unauthorized');
            }
            res.status(200).json({
                status: 'success',
                message: 'Webhook retrieved successfully',
                data: {
                    webhook
                }
            });
        });
    }
    static viewAllWebhooks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhooks = yield Webhook_service_1.default.viewAllWebhooks();
            res.status(200).json({
                status: 'success',
                message: 'Webhooks retrieved successfully',
                data: {
                    webhooks
                }
            });
        });
    }
}
exports.default = WebhookController;
