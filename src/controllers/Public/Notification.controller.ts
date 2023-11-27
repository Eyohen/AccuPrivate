import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "../../utils/Interface"
import NotificationUtil from "../../utils/Notification"
import NotificationService from "../../services/Notification.service"
import { NotFoundError } from "../../utils/Errors"

export default class NotificationController {
    static async getNotifications(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        const { entity: { id } } = req.user.user
        const { page, limit } = req.query as Record<string, string>

        const _page = parseInt(page) || 1
        const _limit = limit ? parseInt(limit) : 0

        const notifications = page && limit
            ? await NotificationService.viewNotificationByEntityId(id, _page, _limit)
            : await NotificationService.viewNotificationByEntityId(id)

        res.status(200).json({
            status: 'success',
            message: 'Notifications fetched successfully',
            data: {
                notifications
            }
        })
    }

    static async getNotificationInfo(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
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

    static async sendNotification(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
        const { notificationId, userId }: { notificationId: string, userId?: string } = req.body

        const notification = await NotificationService.viewSingleNotificationById(notificationId)
        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        const notificationResult = userId
            ? await NotificationUtil.sendNotificationToUser(userId, notification)
            : await NotificationService.sendNotification(notification)
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