import ErrorCodes from "./errorCodes";

export interface ErrorResponse {
    message: string;
    errorCodes?: ErrorCodes[];
}

export function isErrorResponse<T>(errorResp: ErrorResponse | T): errorResp is ErrorResponse {
    if ((errorResp as ErrorResponse).message) {
        return true;
    }
    return false;
}

export function userNotFound(): ErrorResponse {
    return {
        message: "User does not exist",
        errorCodes: [ErrorCodes.userNotFound],
    };
}

export function incorrectUserCredentials(): ErrorResponse {
    return {
        message: "Invalid email/password",
        errorCodes: [ErrorCodes.incorrectUserCredentials],
    };
}

export function incorrectVerificationToken(): ErrorResponse {
    return {
        message: "Incorrect verification token",
        errorCodes: [ErrorCodes.incorrectVerificationToken],
    };
}

export function alreadyVerified(): ErrorResponse {
    return {
        message: "User is already verified",
        errorCodes: [ErrorCodes.userAlreadyVerified],
    };
}

export function emailTaken(email?: string): ErrorResponse {
    return {
        message: "Email is already registered" + (email ? ": " + email : ""),
        errorCodes: [ErrorCodes.emailTaken],
    };
}

export function decodingError(errorCodes: ErrorCodes[]): ErrorResponse {
    return {
        // todo: create an error code numbering schema to map user facing errors to backend abstractions (for internal use)
        message: "Error completing request",
        errorCodes,
    };
}
