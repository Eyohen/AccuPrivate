import { TOPICS } from "../../Constants";
import ProducerFactory from "../util/Producer";

interface MeterInfo {
    meterNumber: string,
    disco: string,
    vendType: 'PREPAID' | 'POSTPAID'
}

interface User {
    name: string,
    address: string,
    phoneNumber: string,
    email: string
}

interface MeterValidationRequested {
    user: User,
    meter: MeterInfo,
    transactionId: string
}

interface Partner {
    email: string,
}

export class VendorPublisher extends ProducerFactory {
    static async publishEventForMeterValidationRequested(data: { meter: MeterInfo, transactionId: string }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.METER_VALIDATION_REQUESTED,
            message: {
                meterNumber: data.meter.meterNumber,
                disco: data.meter,
                vendType: data.meter.vendType,
                transactionId: data.transactionId
            }
        })
    }

    static async publishEventForMeterValidationReceived(data: MeterValidationRequested) {
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

    static async publicEventForInitiatedPowerPurchase(data: { transactionId: string, meter: MeterInfo & { id: string } }) {
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

    static async publicEventForTokenRequest(data: { transactionId: string, user: User, partner: Partner, meter: MeterInfo & { id: string } }) {
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

    static async publicEventForReceivedToken(data: { transactionId: string, user: User, partner: Partner, meter: MeterInfo & { id: string, token: string } }) {
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

    static async publishEventForCompletedPowerPurchase(data: { transactionId: string, meter: MeterInfo & { id: string }, partner: Partner }) {
        await ProducerFactory.sendMessage({
            topic: TOPICS.POWER_PURCHASE_INITIATED,
            message: {
                meter: {
                    meterNumber: data.meter.meterNumber,
                    disco: data.meter.disco,
                    vendType: data.meter.vendType,
                    id: data.meter.id,
                },
                partner: {
                    email: data.partner.email
                },
                transactionId: data.transactionId
            }
        })
    }
}