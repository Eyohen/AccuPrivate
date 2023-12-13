import express, { Router } from "express";
import WebhookController from "../controllers/Public/Webhook.controller";
import { basicAuth } from "../middlewares/Auth";
import { AuthenticatedController } from "../utils/Interface";

const router: Router = express.Router()

router
    .patch('/update', basicAuth('access'), AuthenticatedController(WebhookController.updateWebhook))
    .get('/info', basicAuth('access'), AuthenticatedController(WebhookController.viewWebhookByPartnerId))
    .get('/', basicAuth('access'), AuthenticatedController(WebhookController.viewAllWebhooks)) // Admin only

export default router