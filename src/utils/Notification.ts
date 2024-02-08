import axios, { AxiosError } from "axios";
import { ONESIGNAL_API_KEY, ONESIGNAL_APP_ID } from './Constants';
import logger from "./Logger";
import { INotification } from "./Interface";


/**
 * Login
 * Failed txn
 * New account
 */
class NotificationUtil {
    private static API = axios.create({
        'baseURL': 'https://onesignal.com/api/v1/notifications',
        'headers': {
            'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    static async sendNotificationToUser(userId: string, notification: INotification): Promise<'success' | null> {
        try {
            // send notification to user
            const notificationDetails = {
                name: notification.title,
                include_aliases: { external_id: [userId] },
                target_channel: "push",
                contents: {
                    en: notification.message
                },
                headings: {
                    en: notification.heading || notification.title
                },
                app_id: ONESIGNAL_APP_ID
            }

            await this.API.post('', notificationDetails)
            return 'success'
        } catch (error: AxiosError | unknown) {
            logger.error('Error sending notification to users', { meta: { error: (error as Error).stack } })
            return null
        }
    }
}

export default NotificationUtil