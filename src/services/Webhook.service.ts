import WebHook, { IUpdateWebHook, IWebHook } from "../models/Webhook.model";

export default class WebhookService {
    static async addWebhook(data: IWebHook): Promise<WebHook> {
        const webhook = WebHook.build(data);
        await webhook.save();
        return webhook;
    }

    static async viewWebhookByPartnerId(partnerId: string): Promise<WebHook | null> {
        const webhook = await WebHook.findOne({ where: { partnerId } });
        return webhook;
    }

    static async viewWebhookById(id: string): Promise<WebHook | null> {
        const webhook = await WebHook.findOne({ where: { id } });
        return webhook;
    }

    static async viewAllWebhooks(): Promise<WebHook[]> {
        const webhooks = await WebHook.findAll();
        return webhooks;
    }

    static async deleteWebhook(webhook: WebHook): Promise<WebHook> {
        await webhook.destroy();
        return webhook;
    }

    static async updateWebhook(webhook: WebHook, data: IUpdateWebHook): Promise<WebHook> {
        webhook.url = data.url;
        await webhook.save();
        return webhook;
    }
}
