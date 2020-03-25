import HttpException from "./HttpException";

export default class ServerException extends HttpException {
    constructor(message: string) {
        super(500, message);
    }
}
