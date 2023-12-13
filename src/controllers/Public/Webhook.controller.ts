import { NextFunction, Response } from "express";
import EntityService from "../../services/Entity/Entity.service";
import WebhookService from "../../services/Webhook.service";
import { BadRequestError, ForbiddenError, InternalServerError } from "../../utils/Errors";
import { AuthenticatedRequest } from "../../utils/Interface";
import Validator from "../../utils/Validators";
import { PartnerProfileService } from "../../services/Entity/Profiles";

export default class WebhookController {
    static async updateWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { url }: { url: string } = req.body;
        const { user: { profile: partner } } = req.user

        const validUrl = Validator.validateUrl(url);
        if (!validUrl) {
            throw new BadRequestError('Invalid url');
        }

        const partnerProfile = await EntityService.viewSingleEntityByEmail(partner.id);
        if (!partnerProfile) {
            throw new InternalServerError('Partner record for Authenticated partner not found')
        }

        const webhook = await WebhookService.viewWebhookByPartnerId(partnerProfile.id);
        if (!webhook) {
            throw new BadRequestError('Webhook already exists');
        }

        const updatedWebhook = await WebhookService.updateWebhook(webhook, { url });

        res.status(201).json({
            status: 'success',
            message: 'Webhook updated successfully',
            data: {
                webhook: updatedWebhook
            }
        });
    }

    static async viewWebhookByPartnerId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { partnerId } = req.query as Record<string, string>;

        const partner = await PartnerProfileService.viewSinglePartner(partnerId);
        if (!partner) {
            throw new BadRequestError('Partner not found');
        }

        const webhook = await WebhookService.viewWebhookByPartnerId(partnerId);
        if (!webhook) {
            throw new BadRequestError('Webhook not found');
        }

        res.status(200).json({
            status: 'success',
            message: 'Webhook retrieved successfully',
            data: {
                webhook
            }
        });
    }

    static async viewWebhookById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { id } = req.query as Record<string, string>;

        const webhook = await WebhookService.viewWebhookById(id);
        if (!webhook) {
            throw new BadRequestError('Webhook not found');
        }

        // Check if user is the owner of the webhook
        const { user: { profile: partner } } = req.user
        const partnerProfile = await EntityService.viewSingleEntityByEmail(partner.id);
        if (!partnerProfile) {
            throw new InternalServerError('Partner record for Authenticated partner not found')
        }

        // Only admin should be able to view webhooks that do not belong to them
        const requestMadeByAdmin = ['Admin', 'SuperAdmin'].includes(partnerProfile.role.name)
        const webhookBelongsToUser = webhook.partnerId === partnerProfile.id
        if (!requestMadeByAdmin && !webhookBelongsToUser) {
            throw new ForbiddenError('Unauthorized');
        }

        res.status(200).json({
            status: 'success',
            message: 'Webhook retrieved successfully',
            data: {
                webhook
            }
        });
    }

    static async viewAllWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const webhooks = await WebhookService.viewAllWebhooks();

        res.status(200).json({
            status: 'success',
            message: 'Webhooks retrieved successfully',
            data: {
                webhooks
            }
        });
    }
}