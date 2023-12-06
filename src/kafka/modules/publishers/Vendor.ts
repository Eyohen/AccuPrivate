import { TOPICS } from "../../Constants";
import { PublisherEventAndParameters } from "../util/Interface";
import ProducerFactory from "../util/Producer";

export class VendorPublisher extends ProducerFactory {
    static async publishEventForMeterValidationRequested(data: PublisherEventAndParameters[TOPICS.METER_VALIDATION_REQUESTED]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.METER_VALIDATION_REQUESTED,
            message: {
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForMeterValidationReceived(data: PublisherEventAndParameters[TOPICS.METER_VALIDATION_RECIEVED]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.METER_VALIDATION_RECIEVED,
            message: {
                user: {
                    name: data.user.name,
                    email: data.user.email,
                    address: data.user.address,
                    phoneNumber: data.user.phoneNumber
                },
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForInitiatedPowerPurchase(data: PublisherEventAndParameters[TOPICS.POWER_PURCHASE_INITIATED]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.POWER_PURCHASE_INITIATED,
            message: {
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

    static async publishEventForTokenRequest(data: PublisherEventAndParameters[TOPICS.TOKEN_REQUESTED]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.TOKEN_REQUESTED,
            message: {
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id
                },
                user: {
                    name: data.user.name,
                    email: data.user.email,
                    address: data.user.address,
                    phoneNumber: data.user.phoneNumber
                },
                partner: {
                    email: data.partner.email
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForReceivedToken(data: PublisherEventAndParameters[TOPICS.TOKEN_RECEIVED]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.TOKEN_RECEIVED,
            message: {
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id,
                    token: data.meter.token
                },
                user: {
                    name: data.user.name,
                    email: data.user.email,
                    address: data.user.address,
                    phoneNumber: data.user.phoneNumber
                },
                partner: {
                    email: data.partner.email
                },
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForCompletedPowerPurchase(data: PublisherEventAndParameters[TOPICS.PARTNER_TRANSACTION_COMPLETE]) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.POWER_PURCHASE_INITIATED,
            message: {
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id,
                },
                transactionId: data.transactionId
            }
        })
    }
}