import { TOPICS } from "../kafka/Constants";
import { VendorPublisher } from "../kafka/modules/publishers/Vendor";
import ProducerFactory from "../kafka/modules/util/Producer";
import Event, { ICreateEvent, Status } from "../models/Event.model";
import Transaction from "../models/Transaction.model";
import EventService from "./Event.service";
import { v4 as uuidv4 } from 'uuid';

interface IMeterValidationReceivedEventParams {
    user: { name: string, email: string, address: string, phoneNumber: string };
}

interface ICRMUserInitiatedEventParams {
    user: { id: string, name: string, email: string, address: string, phoneNumber: string };
}

interface EventMeterInfo {
    meterNumber: string,
    disco: string,
    vendType: 'PREPAID' | 'POSTPAID'
}

const EventAndPublishers = {
    [TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER]: VendorPublisher.publishEventForInitiatedPowerPurchase,
    [TOPICS.TOKEN_RECIEVED_FROM_VENDOR]: VendorPublisher.publishEventForTokenReceivedFromVendor,
    [TOPICS.METER_VALIDATION_REQUESTED_TO_VENDOR]: VendorPublisher.publishEventForMeterValidationRequested,
    [TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR]: VendorPublisher.publishEventForMeterValidationReceived,
} as Record<TOPICS, (...args: any[]) => Promise<void>>;

class EventPublisher {
    private event: Event;
    private publisher: (...args: any[]) => Promise<void>;
    private args: any[];

    constructor({ event, params }: {
        event: Event, params: any[]
    }) {
        this.event = event;
        event.eventType
        this.publisher = EventAndPublishers[event.eventType];
        this.args = params;
    }

    public async publish() {
        await this.publisher(...this.args)
    }

    public getEvent() {
        return this.event;
    }
}

export default class TransactionEventService {
    private transaction: Transaction;
    private meterInfo: EventMeterInfo

    constructor(transaction: Transaction, meterInfo: EventMeterInfo) {
        this.transaction = transaction;
        this.meterInfo = meterInfo;
    }

    public getMeterInfo(): EventMeterInfo {
      return this.meterInfo
    }

    public getTransactionInfo(): Transaction {
      return this.
    }

    public async addMeterValidationRequestedEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.METER_VALIDATION_REQUESTED_TO_VENDOR,
            eventText: TOPICS.METER_VALIDATION_REQUESTED_TO_VENDOR,
            payload: JSON.stringify({
                meterNumber: this.meterInfo.meterNumber,
                disco: this.meterInfo.disco,
                vendType: this.meterInfo.vendType,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addMeterValidationReceivedEvent(userInfo: IMeterValidationReceivedEventParams): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR,
            eventText: TOPICS.METER_VALIDATION_RECIEVED_FROM_VENDOR,
            payload: JSON.stringify({
                user: {
                    name: userInfo.user.name,
                    email: userInfo.user.email,
                    address: userInfo.user.address,
                    phoneNumber: userInfo.user.phoneNumber,
                },
                meterNumber: this.meterInfo.meterNumber,
                disco: this.meterInfo.disco,
                vendType: this.meterInfo.vendType,
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }

    public async addMeterValidationSentEvent(meterId: string): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.METER_VALIDATION_SENT_PARTNER,
            eventText: TOPICS.METER_VALIDATION_SENT_PARTNER,
            payload: JSON.stringify({
                merterId: meterId,
                meterNumber: this.meterInfo.meterNumber,
                disco: this.meterInfo.disco,
                vendType: this.meterInfo.vendType,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }
        return EventService.addEvent(event);
    }

    public async addCRMUserInitiatedEvent(info: ICRMUserInitiatedEventParams): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.CREATE_USER_INITIATED,
            eventText: TOPICS.CREATE_USER_INITIATED,
            payload: JSON.stringify({
                user: {
                    id: info.user.id,
                    name: info.user.name,
                    email: info.user.email,
                    address: info.user.address,
                    phoneNumber: info.user.phoneNumber,
                },
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }
        return EventService.addEvent(event);
    }

    public async addCRMUserConfirmedEvent(info: ICRMUserInitiatedEventParams): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.CREATE_USER_CONFIRMED,
            eventText: TOPICS.CREATE_USER_CONFIRMED,
            payload: JSON.stringify({
                user: {
                    id: info.user.id,
                    name: info.user.name,
                    email: info.user.email,
                    address: info.user.address,
                    phoneNumber: info.user.phoneNumber,
                },
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }
        return EventService.addEvent(event);
    }

    public async addDiscoUpEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR,
            eventText: TOPICS.CHECK_DISCO_UP_CONFIRMED_FROM_VENDOR,
            payload: JSON.stringify({
                disco: this.meterInfo.disco,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }
        return EventService.addEvent(event);
    }

    public async addPowerPurchaseInitiatedEvent(bankRefId: string, amount: string): Promise<Event> {
        const user = await this.transaction.$get('user');
        if (!user) {
            throw new Error('Transaction does not have a user');
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER,
            eventText: TOPICS.POWER_PURCHASE_INITIATED_BY_CUSTOMER,
            payload: JSON.stringify({
                bankRefId,
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                phoneNumber: user.phoneNumber,
                vendType: this.meterInfo.vendType,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addVendElectricityRequestedFromVendorEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.VEND_ELECTRICITY_REQUESTED_FROM_VENDOR,
            eventText: TOPICS.VEND_ELECTRICITY_REQUESTED_FROM_VENDOR,
            payload: JSON.stringify({
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addTokenRequestTimedOutEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_REQUEST_TIMEDOUT,
            eventText: TOPICS.TOKEN_REQUEST_TIMEDOUT,
            payload: JSON.stringify({
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addGetTransactionTokenRequestedFromVendorEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR_RETRY,
            eventText: TOPICS.GET_TRANSACTION_TOKEN_REQUESTED_FROM_VENDOR_RETRY,
            payload: JSON.stringify({
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
                timestamp: new Date(),
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addGetTransactionTokenFromVendorInitiatedEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED,
            eventText: TOPICS.GET_TRANSACTION_TOKEN_FROM_VENDOR_INITIATED,
            payload: JSON.stringify({
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
                timestamp: new Date(),
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }
    public async addTokenRequestSuccessfulWithNoTokenEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_REQUEST_TIMEDOUT,
            eventText: TOPICS.TOKEN_REQUEST_TIMEDOUT,
            payload: JSON.stringify({
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addTokenReceivedEvent(token: string): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_RECIEVED_FROM_VENDOR,
            eventText: TOPICS.TOKEN_RECIEVED_FROM_VENDOR,
            payload: JSON.stringify({
                token,
                transactionId: this.transaction.id,
                superAgent: this.transaction.superagent,
                amount: this.transaction.amount,
                disco: this.transaction.disco,
                meterId: this.transaction.meterId,
                meterNumber: this.meterInfo.meterNumber,
                vendType: this.meterInfo.vendType,
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addTokenSentToUserEmailEvent(): Promise<Event> {
        const user = await this.transaction.$get('user');
        if (!user) {
            throw new Error('Transaction does not have a user');
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_SENT_TO_EMAIL,
            eventText: TOPICS.TOKEN_SENT_TO_EMAIL,
            payload: JSON.stringify({
                email: user.email,
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return await EventService.addEvent(event);
    }

    public async addTokenSentToPartnerEvent(): Promise<Event> {
        const partner = await this.transaction.$get('partner');
        if (!partner) {
            throw new Error('Transaction does not have a partner');
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_SENT_TO_PARTNER,
            eventText: TOPICS.TOKEN_SENT_TO_PARTNER,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                }
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }

    public async addTokenRequestFailedNotificationToPartnerEvent(): Promise<Event> {
        const partner = await this.transaction.$get('partner');
        if (!partner) {
            throw new Error('Transaction does not have a partner');
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.TOKEN_REQUEST_FAILED,
            eventText: TOPICS.TOKEN_REQUEST_FAILED,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                }
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }

    public async addWebHookNotificationSentEvent(): Promise<Event> {
        const partner = await this.transaction.$get('partner')
        if (!partner) {
            throw new Error('Transaction does not have a partner')
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
            eventText: TOPICS.WEBHOOK_NOTIFICATION_SENT_TO_PARTNER,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                }
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }

    public async addWebHookNotificationConfirmedEvent(): Promise<Event> {
        const partner = await this.transaction.$get('partner')
        if (!partner) {
            throw new Error('Transaction does not have a partner')
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
            eventText: TOPICS.WEBHOOK_NOTIFICATION_CONFIRMED_FROM_PARTNER,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                },
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }

    public async addWebHookNotificationRetryEvent({ url, retryCount, timeStamp}: { url: string, retryCount: number, timeStamp: Date}): Promise<Event> {
        const partner = await this.transaction.$get('partner')
        if (!partner) {
            throw new Error('Transaction does not have a partner')
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY,
            eventText: TOPICS.WEBHOOK_NOTIFICATION_TO_PARTNER_RETRY,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                },
                webHookUrl: url, 
                retryCount,
                timeStamp
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }
    public async addPartnerTransactionCompleteEvent(): Promise<Event> {
        const partner = await this.transaction.$get('partner');
        if (!partner) {
            throw new Error('Transaction does not have a partner');
        }

        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.PARTNER_TRANSACTION_COMPLETE,
            eventText: TOPICS.PARTNER_TRANSACTION_COMPLETE,
            payload: JSON.stringify({
                partner: {
                    email: partner.email,
                    id: partner.id,
                }
            }),
            source: this.transaction.superagent.toUpperCase(),
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }

        return EventService.addEvent(event);
    }
}