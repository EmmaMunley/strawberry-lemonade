import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import { ErrorResponse } from "../error/errorResponses";

export default function(error: HttpException, request: Request, response: Response, next: NextFunction): void {
    const status = error.status || 500;
    const { message, errorCodes } = error;
    const payload: ErrorResponse = {
        message: message || "Something went wrong",
    };
    if (errorCodes) {
        payload.errorCodes = errorCodes;
    }
    response.status(status).json(payload);
    next();
}
