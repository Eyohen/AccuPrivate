import { TOPICS } from "../../Constants";
import ProducerFactory from "../util/Producer";

interface User {
    name: string,
    address: string,
    phoneNumber: string,
    email: string,
    id: string
}

interface Partner {
    email: string,
}

export class NotificationPublisher extends ProducerFactory {
    static async publishEventForSentTokenToPartner(data: { partner: Partner, transactionId: string }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.TOKEN_SENT_TO_PARTNER,
            message: {
                partner: {
                    email: data.partner.email
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForSentTokenToUser(data: { user: User, transactionId: string }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.TOKEN_SENT_TO_EMAIL,
            message: {
                user: {
                    name: data.user.name,
                    email: data.user.email,
                    address: data.user.address,
                    phoneNumber: data.user.phoneNumber,
                    id: data.user.id
                },
                transactionId: data.transactionId
            }
        })
    }
}