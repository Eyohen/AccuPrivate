import { TOPICS } from "../../Constants";
import { PublisherEventAndParameters } from "../util/Interface";
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
    static async publishEventForSentTokenToPartner(data: PublisherEventAndParameters[TOPICS.TOKEN_SENT_TO_PARTNER]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.TOKEN_SENT_TO_PARTNER,
            message: {
                partner: {
                    email: data.partner.email
                },
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForSentTokenToUser(data: PublisherEventAndParameters[TOPICS.TOKEN_SENT_TO_EMAIL]) {
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
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id
                },
                transactionId: data.transactionId
            }
        })
    }
}