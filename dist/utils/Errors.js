"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateWayTimeoutError = exports.InternalServerError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthenticatedError = exports.BadRequestError = exports.CustomAPIError = void 0;
class CustomAPIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.CustomAPIError = CustomAPIError;
class BadRequestError extends CustomAPIError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
        super(message, 401);
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
class ForbiddenError extends CustomAPIError {
    constructor(message) {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends CustomAPIError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends CustomAPIError {
    constructor(message) {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
class GateWayTimeoutError extends CustomAPIError {
    constructor(message) {
        super(message, 504);
    }
}
exports.GateWayTimeoutError = GateWayTimeoutError;
