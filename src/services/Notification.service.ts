import Notification, { ICreateNotification, INotification, IUpdateNotification } from "../models/Notification.model"
import NotificationUtil from "../utils/Notification"

export default class NotificationService {
    static async addNotification(notificationData: ICreateNotification): Promise<Notification> {
        const notification = Notification.build(notificationData)
        await Notification.create(notificationData)

        return notification
    }

    static async viewNotifications(): Promise<Notification[]> {
        const notifications = await Notification.findAll({})
        return notifications
    }

    static async viewNotificationByEntityId(entityId: string, page?: number, limit?: number): Promise<Notification[]> {
        const query = page && limit ? { where: { entityId }, limit, offset: (page - 1) * limit } : { where: { entityId } } 
        const notifications = await Notification.findAll(query)

        return notifications
    }

    static async viewSingleNotificationById(id: string): Promise<Notification | null> {
        const notification = await Notification.findByPk(id)
        return notification
    }

    static async viewNotificationWithCustomQuery(query: Record<any, any>): Promise<Notification[]> {
        const notifications = await Notification.findAll(query)
        return notifications
    }

    static async updateSingleNotification(id: string, data: IUpdateNotification): Promise<Notification | null> {
        const notification = await this.viewSingleNotificationById(id)
        if (!notification) return null

        await notification.update(data)

        const updatedNotification = await this.viewSingleNotificationById(id)
        return updatedNotification
    }

    static async sendNotification(notification: Notification): Promise<'success' | null> {
        const notificationResult = await NotificationUtil.sendNotificationToUser(notification.entityId, notification)

        if (!notificationResult) return null

        return notificationResult
    }

    static async getUnreadNotifications(entityId: string): Promise<Notification[]> {
        const notifications = await Notification.findAll({ where: { entityId, read: false } })
        return notifications
    }
}