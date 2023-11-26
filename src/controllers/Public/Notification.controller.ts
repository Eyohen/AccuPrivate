import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "../../utils/Interface"
import NotificationUtil from "../../utils/Notification"
import NotificationService from "../../services/Notification.service"
import { NotFoundError } from "../../utils/Errors"

export default class NotificationController {
    static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { entity: { id } } = req.user.user

        const notifications = await NotificationService.viewNotificationByEntityId(id)

        res.status(200).json({
            status: 'success',
            message: 'Notifications fetched successfully',
            data: {
                notifications
            }
        })
    }

    static async getNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { notificationId } = req.query as Record<string, string>

        const notification = await NotificationService.viewSingleNotificationById(notificationId)
        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification fetched successfully',
            data: {
                notification
            }
        })
    }

    static async sendNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { notificationId } = req.body 

        const notification = await NotificationService.viewSingleNotificationById(notificationId)
        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        const notificationResult = await NotificationService.sendNotification(notification)
        if (!notificationResult) {
            throw new NotFoundError('Notification not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification sent successfully',
            data: {
                notification
            }
        })
    }

    static async sendNotificationToUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { userId, notificationId } = req.body as Record<string, string>

        const notification = await NotificationService.viewSingleNotificationById(notificationId)
        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        const notificationResult = await NotificationUtil.sendNotificationToUser(userId, notification)
        if (!notificationResult) {
            throw new NotFoundError('Notification not found')
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification sent successfully',
            data: {
                notification
            }
        })
    }
}