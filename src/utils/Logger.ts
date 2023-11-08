import winston, { format } from "winston";
import util from "util";

const { combine, timestamp, printf, colorize } = format;
const logFormat = printf((info) => {
    return `${info.timestamp} [${info.level}]: ${info.message}`;
});

const enumerateErrorFormat = format((info) => {
    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
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
            ),
        }),
    ]
});

export default logger;
