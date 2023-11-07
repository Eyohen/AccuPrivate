import { Request, Response, NextFunction } from 'express';
import { CustomAPIError, } from '../utils/Errors';
import logger from '../utils/Logger';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): Response {
    logger.error(err)

    if (err instanceof CustomAPIError) {
        return res.status(err.statusCode).send({
            success: false,
            data: null,
            message: err.message,
        });
    }

    // if the error is not one of the specific types above, return a generic internal server error
    return res.status(500).send({ status: 'error', error: true, message: 'Ops, Something went wrong' });
}

export default errorHandler;
