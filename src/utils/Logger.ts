import winston, { format } from "winston";
import winstonMongoDB from 'winston-mongodb'
import util from "util";
import { MONGO_URI_LOG, NODE_ENV } from "./Constants";

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
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize({
                    colors: { info: 'cyan', error: 'red' }
                }),
                logFormat,
                enumerateErrorFormat(),
            ),
        }),
        new winstonMongoDB.MongoDB({
            level: 'error',
            db: MONGO_URI_LOG,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
            metaKey: 'meta',
            collection: 'error_logs',
        }),
        new winstonMongoDB.MongoDB({
            level: 'info',
            db: MONGO_URI_LOG,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
            metaKey: 'meta',
            collection: 'info_logs',
        }),
        new winstonMongoDB.MongoDB({
            level: 'warn',
            db: MONGO_URI_LOG,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
            metaKey: 'meta',
            collection: 'warn_logs',
        })]
    : [new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize({
                colors: { info: 'cyan', error: 'red' }
            }),
            logFormat,
            enumerateErrorFormat(),
        ),
    })]

const productionLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
        enumerateErrorFormat(),
    ),
    transports
})

const logger = productionLogger

export default logger;
