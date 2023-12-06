import { TOPICS } from "../../Constants";
import ProducerFactory from "../util/Producer";

interface User {
    name: string,
    address: string,
    phoneNumber: string,
    email: string,
    id: string
}

export class CRMPublisher extends ProducerFactory {
    static async publishEventForInitiatedUser(data: { user: User, transactionId: string }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.CRM_USER_INITIATED,
            message: {
                user: {
                    name: data.user.name,
                    email: data.user.email,
                    address: data.user.address,
                    phoneNumber: data.user.phoneNumber
                },
            }
        })
    }

    static async publishEventForConfirmedUser(data: { user: User, transactionId: string }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.CRM_USER_CONFIRMED,
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