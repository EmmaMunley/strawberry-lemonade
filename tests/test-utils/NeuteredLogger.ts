import { createLogger, Logger } from "winston";
import express from "express";
import Transport from "winston-transport";
import { LoggerFactory } from "../../src/logger/LoggerFactory";

class NullTransport extends Transport {
    log(): Transport {
        return this;
    }
}

export class NeuteredLoggerFactory extends LoggerFactory {
    getLogger(): Logger {
        return createLogger({ transports: [new NullTransport()] });
    }
}

export const NeuteredLoggerMiddleware: express.RequestHandler = (_, __, next) => {
    next();
};
