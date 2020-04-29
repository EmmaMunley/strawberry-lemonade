import ErrorCodes from "./ErrorCodes";

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

export function incorrectPassword(): ErrorResponse {
    return {
        message: "Password is incorrect",
        errorCodes: [ErrorCodes.incorrectPassword],
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

export function usernameTaken(username?: string): ErrorResponse {
    return {
        message: "Username is taken" + (username ? ": " + username : ""),
        errorCodes: [ErrorCodes.usernameTaken],
    };
}

export function communityNameTaken(communityName?: string): ErrorResponse {
    return {
        message: "Community name is taken" + (communityName ? ": " + communityName : ""),
        errorCodes: [ErrorCodes.communityNameTaken],
    };
}

export function userNotInCommunity(userId: string): ErrorResponse {
    return {
        message: `User id ${userId} is not a member of one or more of the provided communities`,
        errorCodes: [ErrorCodes.userNotInCommunity],
    };
}

export function noActiveMood(userId: string, communityId: string): ErrorResponse {
    return {
        message: `User id ${userId} does not have an active mood in community id ${communityId}`,
        errorCodes: [ErrorCodes.noActiveMood],
    };
}

export function cannotSubmitMood(userId: string, communityId: string): ErrorResponse {
    return {
        message: `Cannot submit mood for user id ${userId} andcommunity id ${communityId}`,
        errorCodes: [ErrorCodes.cannotSubmitMood],
    };
}

export function decodingError(errorCodes: ErrorCodes[]): ErrorResponse {
    return {
        // todo: create an error code numbering schema to map user facing errors to backend abstractions (for internal use)
        message: "Error completing request",
        errorCodes,
    };
}
