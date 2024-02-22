import { NextFunction, Response, Request } from "express";
import { AuthenticatedRequest } from "../../utils/Interface";
import WaitTimeService from "../../services/Waittime.service";
import { NotFoundError } from "../../utils/Errors";
require('newrelic');

export class WaitTimeController {

    static async setWaittimeForSwitchingToNewVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { startTimeToRequeryTransaction, startTimeForSwitchingToNewVendor } = req.body

        let response: null | any = null
        response = startTimeForSwitchingToNewVendor ? await WaitTimeService.setWaitTimeForSwitchingToNewVendor(startTimeForSwitchingToNewVendor) : response
        response = startTimeToRequeryTransaction ? await WaitTimeService.setWaitTimeToRequeryTransaction(startTimeToRequeryTransaction) : response

        const waitTime = await WaitTimeService.getWaitTime()
        res.status(200).json({
            status: 'success',
            data: {
                waitTime
            }
        })
    }

    static async getWaittimeForSwitchingToNewVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const waitTime = await WaitTimeService.getWaitTime()

        if (!waitTime) {
            throw new NotFoundError('Wait time not found')
        }

        res.status(200).json({
            status: 'success',
            data: {
                waitTime
            }
        })
    }
}