import ErrorCodes from "../error/errorCodes";

class HttpException extends Error {
    status: number;
    message: string;
    errorCodes?: ErrorCodes[];
    constructor(status: number, message: string, errorCodes?: ErrorCodes[]) {
        super(message);
        this.status = status;
        this.message = message;
        this.errorCodes = errorCodes;
    }
}

export default HttpException;
