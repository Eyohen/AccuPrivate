import axios from "axios";

export default class WebhookUtil {
    static async sendWebhook(webhook: string, content: { headers: Record<string, string>, body: string }) {
        const response = await axios.post(webhook, content.body, { headers: content.headers });
        return response;
    }
        
}