import winston, { format } from "winston";
import util from "util";

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

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        enumerateErrorFormat(),
        colorize({
            colors: { info: 'cyan', error: 'red' }
        }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat
    ),
    transports: [
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
    ]
});

export default logger;
