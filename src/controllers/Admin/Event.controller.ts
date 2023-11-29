import { NextFunction, Request, Response } from "express";
import EventService from "../../services/Event.service";

export default class EventController {

    static async getEventInfo(req: Request, res: Response, next: NextFunction) {
        const {
           eventId
        } = req.body
        

        const event = await EventService.viewSingleEvent(eventId)

        res.status(200).json({
            status: 'success',
            data: {
                event
            }
        })
    }

    static async getEventsForTransaction(req: Request, res: Response, next: NextFunction) {
        const {
            transactionId
        } = req.body

        const events = await EventService.viewEventsForTransaction(transactionId)

        res.status(200).json({
            status: 'success',
            data: {
                events
            }
        })
    }
}