import { NextFunction, Request, Response } from "express";
import EventService from "../../services/Event.service";
import { AuthenticatedRequest } from "../../utils/Interface";

export default class EventController {

    static async getEventInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { eventId } = req.query as { eventId: string }

        const event = await EventService.viewSingleEvent(eventId)

        res.status(200).json({
            status: 'success',
            data: {
                event
            }
        })
    }

    static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { transactionId } = req.query as { transactionId: string }

        const events = await EventService.viewEventsForTransaction(transactionId)

        res.status(200).json({
            status: 'success',
            data: {
                events
            }
        })
    }
}