import { Router } from "express";
import { AuthenticatedController } from "../utils/Interface";
import NotificationController from "../controllers/Public/Notification.controller"
import { basicAuth } from "../middlewares/Auth";

const router: Router = Router()

router
    .use(basicAuth('access'))
    .get('/', AuthenticatedController(NotificationController.getNotifications))
    .get('/info', AuthenticatedController(NotificationController.getNotificationInfo))
    .post('/send', AuthenticatedController(NotificationController.sendNotification))
    .post('/markread', AuthenticatedController(NotificationController.markNotificationsAsRead))
    .patch('/preference', AuthenticatedController(NotificationController.updateNotificationPreference))
    .get('/preference', AuthenticatedController(NotificationController.getNotificationPreference))

export default router