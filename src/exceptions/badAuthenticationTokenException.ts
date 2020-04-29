import ClientException from "./ClientException";
import ErrorCodes from "../error/ErrorCodes";

export default class BadAuthenticationTokenException extends ClientException {
    constructor() {
        super("Authentication token is invalid", [ErrorCodes.badAuthenticationToken]);
    }
}
