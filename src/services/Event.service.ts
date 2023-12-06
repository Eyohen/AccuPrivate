// Import necessary types and the Event model
import { TOPICS } from "../kafka/Constants";
import { ICreateEvent, IEvent, Status } from "../models/Event.model";
import Event from "../models/Event.model";
import Transaction from "../models/Transaction.model";
import logger from "../utils/Logger";
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

class TransactionEventService {
    private transaction: Transaction;
    private meterInfo: EventMeterInfo

    constructor(transaction: Transaction, meterInfo: EventMeterInfo) {
        this.transaction = transaction;
        this.meterInfo = meterInfo;
    }

    public async addMeterValidationRequestedEvent(): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.METER_VALIDATION_REQUESTED,
            eventText: TOPICS.METER_VALIDATION_REQUESTED,
            eventData: JSON.stringify({
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

    public async addMeterValidationResponseEvent(userInfo: IMeterValidationReceivedEventParams): Promise<Event> {
        const event: ICreateEvent = {
            transactionId: this.transaction.id,
            eventType: TOPICS.METER_VALIDATION_RECIEVED,
            eventText: TOPICS.METER_VALIDATION_RECIEVED,
            eventData: JSON.stringify({
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
            eventType: TOPICS.METER_VALIDATION_SENT,
            eventText: TOPICS.METER_VALIDATION_SENT,
            eventData: JSON.stringify({
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
            eventType: TOPICS.CRM_USER_INITIATED,
            eventText: TOPICS.CRM_USER_INITIATED,
            eventData: JSON.stringify({
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
            eventType: TOPICS.CRM_USER_CONFIRMED,
            eventText: TOPICS.CRM_USER_CONFIRMED,
            eventData: JSON.stringify({
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
            eventType: TOPICS.DISCO_UP,
            eventText: TOPICS.DISCO_UP,
            eventData: JSON.stringify({
                disco: this.meterInfo.disco,
            }),
            source: 'API',
            eventTimestamp: new Date(),
            id: uuidv4(),
            status: Status.COMPLETE,
        }
        return EventService.addEvent(event);
    }
}

// EventService class for handling event-related operations
export default class EventService {

    // Method for adding a new event to the database
    static async addEvent(event: ICreateEvent): Promise<Event> {
        try {
            // Create a new event using the Event model
            // const newEvent: Event = await Event.create(event);
            const newEvent: Event = Event.build(event);
            await newEvent.save();
            return newEvent;
        } catch (err) {
            console.error(err)
            logger.info('Error Logging Event');
            throw err;
        }
    }

    // Method for viewing a single event by its UUID
    static async viewSingleEvent(uuid: string): Promise<Event | void | null> {
        try {
            // Find and retrieve an event by its UUID
            const event: Event | null = await Event.findOne({ where: { id: uuid }, include: [Transaction] });
            return event;
        } catch (err) {
            logger.info('Error reading Event');
        }
    }

    static async viewEventsForTransaction(transactionId: string): Promise<Event[] | void | null> {
        try {
            // Find and retrieve an event by its UUID
            const events: Event[] | null = await Event.findAll({ where: { transactionId }, include: [Transaction] });
            return events;
        } catch (err) {
            logger.info('Error reading Event');
        }
    }

    static transactionEventService = TransactionEventService;
}
