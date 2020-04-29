import ClientException from "./ClientException";
import ErrorCodes from "../error/ErrorCodes";

export default class MissingAuthenticationTokenException extends ClientException {
    constructor() {
        super("Authentication token is missing from cookies", [ErrorCodes.missingAuthenticationToken]);
    }
}
