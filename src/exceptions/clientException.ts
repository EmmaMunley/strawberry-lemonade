import HttpException from "./HttpException";
import ErrorCodes from "../error/ErrorCodes";

export default class ClientException extends HttpException {
    constructor(message: string, errorCodes?: ErrorCodes[]) {
        super(400, message, errorCodes);
    }
}
