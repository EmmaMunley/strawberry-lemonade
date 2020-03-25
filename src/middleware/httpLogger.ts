import { Colorizer, TransformableInfo, Format } from "logform";
import { format, transports } from "winston";
import expressWinston from "express-winston";
import express from "express";

const { combine, timestamp, printf, colorize } = format;

// Mapping of http status level to log level
const httpLogLevels = {
    success: "info",
    warn: "warn",
    error: "error",
};

function buildLogFormat(withColorizedLogs = false): Format {
    const colorizer: Colorizer = colorize();
    return printf(({ level, message, timestamp }: TransformableInfo) => {
        let prefix = `[${timestamp} HTTP]`;
        if (withColorizedLogs) {
            prefix = colorizer.colorize(level, prefix);
        }
        return `${prefix}: ${message}`;
    });
}

export function createHttpLoggerMiddleware(appName: string): express.RequestHandler {
    // Non-colorized log format to print logs into log files
    const simpleLogFormat = buildLogFormat(false);
    // Colorized format to print logs into stdout
    const colorizedLogFormat = buildLogFormat(true);

    return expressWinston.logger({
        format: combine(timestamp(), simpleLogFormat),
        transports: [new transports.Console({ format: colorizedLogFormat }), new transports.File({ filename: `/tmp/${appName}-requests.log` })],
        meta: true,
        msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
        statusLevels: httpLogLevels,
    });
}
