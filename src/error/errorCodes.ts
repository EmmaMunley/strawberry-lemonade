enum ErrorCodes {
    // Invalid
    invalidUsername = "invalid/username",
    invalidPhoneNumber = "invalid/phoneNumber",
    invalidPassword = "invalid/password",
    invalidUserId = "invalid/userId",
    invalidImageId = "invalid/imageId",
    invalidVerificationToken = "invalid/verificationToken",
    invalidIsVerified = "invalid/isVerified",
    invalidFile = "invalid/file",
    invalidCount = "invalid/count",
    invalidRegistryUrl = "invalid/registryUrl",
    invalidRegistrySource = "invalid/registrySource",
    // Conflict
    usernameTaken = "conflict/username-taken",
    userNotFound = "conflict/user-notFound",
    userAlreadyVerified = "conflict/user-alreadyVerified",
    imageNotFound = "conflict/image-not-found",
    // Incorrect
    incorrectVerificationToken = "incorrect/verificationToken",
    incorrectPassword = "incorrect/password",
    // Auth`
    badAuthenticationToken = "auth/bad-token",
    missingAuthenticationToken = "auth/missing-token",
}

export default ErrorCodes;
