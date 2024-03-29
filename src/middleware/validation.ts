import express from "express";
import ValidationException from "../exceptions/ValidationException";
import * as t from "io-ts";
import { validate } from "../types";
import { isRight, Either } from "fp-ts/lib/Either";
import ErrorCodes from "../error/errorCodes";
import { LoggerFactory } from "../logger/LoggerFactory";

const logger = LoggerFactory.getLogger(module);

enum ValidationType {
    body = "body",
    params = "params",
}

function getValidationPayload<I>(req: express.Request, type: ValidationType): any {
    switch (type) {
        case ValidationType.params:
            return req.params;
        case ValidationType.body:
            return req.body;
        default:
            return req.body;
    }
}

function validationMiddleware<A, O, I>(type: t.Type<A, O, I>, validationType: ValidationType): express.RequestHandler {
    return async function(req, _, next): Promise<void> {
        const payload = getValidationPayload<I>(req, validationType);
        const data: Either<ErrorCodes[], A> = validate(type, payload);
        if (isRight(data)) {
            next();
        } else {
            const errorCodes: ErrorCodes[] = data.left;
            logger.debug(`Error decoding ${JSON.stringify(req.body)} into type ${type.name}. Error codes: ${errorCodes}`);
            next(new ValidationException(`Error decoding request into type ${type.name}`, errorCodes));
        }
    };
}

export function validateBody<A, O, I>(type: t.Type<A, O, I>): express.RequestHandler {
    return validationMiddleware(type, ValidationType.body);
}

export function validateParams<A, O, I>(type: t.Type<A, O, I>): express.RequestHandler {
    return validationMiddleware(type, ValidationType.params);
}
