import HttpException from "./HttpException";
import ErrorCodes from "../error/ErrorCodes";

export default class NotFoundException extends HttpException {
    constructor(message: string, errorCodes?: ErrorCodes[]) {
        super(404, message, errorCodes);
    }
}
