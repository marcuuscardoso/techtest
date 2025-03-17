import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const defaultPrintfFormat = ({ level, label, message, timestamp }: any) => `${timestamp} ${label} [${level}]: ${message}`;

export const existingLoggers = new Set<winston.Logger>();

const defineLogger = (options: winston.LoggerOptions) => {
    const logger = winston.createLogger(options);

    existingLoggers.add(logger);

    return logger;
};

export const generateLoggerFormat = (label: string, printf: CallableFunction) => {
    return winston.format.combine(
        winston.format.label({ label }),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(printf as any)
    );
};

export const createNamedLogger = (name: string, options: winston.LoggerOptions & {
    fileName?: string;
}) => {
    const fileName = options.fileName ?? name.split("/")[0];

    const transports: winston.transport[] = (options.transports ? options.transports as any : []).concat([
        new winston.transports.Console({ 
            level: "debug",
            format: options.format || generateLoggerFormat(name, defaultPrintfFormat)
        })
    ]);

    transports.push(
        new DailyRotateFile({
            filename: path.resolve(process.cwd(), "logs/" + fileName + "-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "15d"
        }),
    );

    return defineLogger({
        ...options,
        transports
    });
};