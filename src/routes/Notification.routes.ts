import { Router } from "express";
import { AuthenticatedController } from "../utils/Interface";
import NotificationController from "../controllers/Public/Notification.controller"

export const router: Router = Router()

router
    .get('/', AuthenticatedController(NotificationController.getNotifications))
    .get('/info', AuthenticatedController(NotificationController.getNotificationInfo))
    .post('/send', AuthenticatedController(NotificationController.sendNotification))

export default router