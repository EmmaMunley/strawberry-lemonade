import multer = require("multer");
import { RequestHandler, Request, Response, NextFunction } from "express";
import ErrorCodes from "../error/ErrorCodes";
import ValidationException from "../exceptions/ValidationException";
import { LoggerFactory } from "../logger/LoggerFactory";
import { dependencies } from "../dependencies/inversify.config";

const logger = dependencies.resolve(LoggerFactory).getLogger(module);

export function optionalFile(fileName: string): RequestHandler {
    return multer().single(fileName);
}

function requireFile(fileName: string): RequestHandler {
    return (req: Request, _: Response, next: NextFunction): void => {
        if (!req.file || req.file.fieldname !== fileName) {
            const errorCodes: ErrorCodes[] = [ErrorCodes.invalidFile];
            logger.debug(`Required file '${fileName}' is not present}. Error codes: ${errorCodes}`);
            next(new ValidationException(`Required file '${fileName}' does not exist`, errorCodes));
        } else {
            next();
        }
    };
}

export function requiredFile(fileName: string): RequestHandler[] {
    return [multer().single(fileName), requireFile(fileName)];
}
