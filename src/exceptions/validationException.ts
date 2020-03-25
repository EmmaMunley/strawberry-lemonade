import HttpException from "./HttpException";
import ErrorCodes from "../error/errorCodes";

export default class ValidationException extends HttpException {
    constructor(message: string, errorCodes: ErrorCodes[]) {
        super(400, `Validation error: ${message}`, errorCodes);
    }
}
