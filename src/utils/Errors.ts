type HttpStatusCode = 400 | 401 | 403 | 404 | 407 | 408 | 500 | 504;

export class CustomError extends Error {
    meta?: {
        transactionId: string;
    }

    constructor(message: string, meta?: { transactionId: string }) {
        super(message);
        this.meta = meta;
    }
}

export class CustomAPIError extends CustomError {
    statusCode: HttpStatusCode;

    constructor(message: string, statusCode: HttpStatusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends CustomAPIError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class UnauthenticatedError extends CustomAPIError {
    constructor(message: string) {
        super(message, 401)
    }
}

export class ForbiddenError extends CustomAPIError {
    constructor(message: string) {
        super(message, 403)
    }
}

export class NotFoundError extends CustomAPIError {
    constructor(message: string) {
        super(message, 404)
    }
}

export class InternalServerError extends CustomAPIError {
    constructor(message: string) {
        super(message, 500)
    }
}

export class GateWayTimeoutError extends CustomAPIError {
    constructor(message: string) {
        super(message, 504)
    }
}
