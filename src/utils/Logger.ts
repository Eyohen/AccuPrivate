import winston, { format } from "winston";
import SysLog from "../models/SysLog.model"; // Import your Sequelize model for logging
import { NODE_ENV } from "./Constants";
import util from "util";
import { randomUUID } from "crypto";

declare module "winston" {
    export class Transport {
        log(info: any, callback: Function): void;
    }
}

// Define a custom transport to write logs to PostgreSQL using Sequelize
class YourCustomPostgresTransport extends winston.Transport {
    log(info: any, callback: Function) {
        const { timestamp, level, message, meta } = info;
        SysLog.create({
            id: randomUUID(),
            timestamp,
            level,
            message,
            meta,
            transactionId: meta?.transactionId,
            createdAt: new Date()
        }).then(() => {
            callback();
        }).catch((error: Error) => {
            callback(error);
        });
    }
}


const { combine, timestamp, printf, colorize } = format;
const logFormat = printf((info) => {
    let message = info.message;

    if (typeof message === 'object') {
        message = util.inspect(message, { depth: null });
    }

    return `${info.timestamp} [${info.level}]: ${message}`;
});

const enumerateErrorFormat = format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const transports = NODE_ENV === 'development'
    ? [
        new winston.transports.Console({
            level: 'info',
            format: combine(
                timestamp(),
                colorize({
                    colors: { info: 'cyan', error: 'red' }
                }),
                logFormat,
                enumerateErrorFormat(),
            ),
        }),
        new YourCustomPostgresTransport(), // Replace this with your custom transport
    ]
    : [new winston.transports.Console({
        level: 'info',
        format: combine(
            timestamp(),
            colorize({
                colors: { info: 'cyan', error: 'red' }
            }),
            logFormat,
            enumerateErrorFormat(),
        ),
    })];

const productionLogger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        winston.format.simple(),
        enumerateErrorFormat(),
    ),
    transports: transports as any
});

const logger = productionLogger;

export default logger;
