// Import necessary types and the Event model
import { ICreateEvent, IEvent } from "../models/Event.model";
import Event from "../models/Event.model";
import logger from "../utils/Logger";

// EventService class for handling event-related operations
export default class EventService {

    // Method for adding a new event to the database
    static async addEvent(event: ICreateEvent): Promise<Event | void> {
        try {
            // Create a new event using the Event model
            // const newEvent: Event = await Event.create(event);
            const newEvent: Event = await Event.build(event);
            await newEvent.save();
            return newEvent;
        } catch (err) {
            logger.info('Error Logging Event');
        }
    }

    // Method for viewing a single event by its UUID
    static async viewSingleEvent(uuid: string): Promise<Event | void | null> {
        try {
            // Find and retrieve an event by its UUID
            const event: Event | null = await Event.findByPk(uuid);
            return event;
        } catch (err) {
            logger.info('Error reading Event');
        }
    }

    static async viewEventsForTransaction(transactionId: string): Promise<Event[] | void | null> {
        try {
            // Find and retrieve an event by its UUID
            const events: Event[] | null = await Event.findAll({ where: { transactionId } });
            return events;
        } catch (err) {
            logger.info('Error reading Event');
        }
    }
}
