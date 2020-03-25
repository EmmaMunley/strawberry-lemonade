import ServerException from "./ServerException";
import ErrorCodes from "../error/errorCodes";

export default class DecodingException extends ServerException {
    constructor(tableName: string, method: string, input: Record<string, any>, errorCodes: ErrorCodes[]) {
        super(`Malformed data in ${tableName}, request to ${method} with ${JSON.stringify(input)} returned ${JSON.stringify(errorCodes)}}`);
    }
}
