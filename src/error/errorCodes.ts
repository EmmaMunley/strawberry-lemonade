enum ErrorCodes {
    // Invalid
    invalidUsername = "invalid/username",
    invalidPhoneNumber = "invalid/phoneNumber",
    invalidPassword = "invalid/password",
    invalidUserId = "invalid/userId",
    invalidCommunityId = "invalid/communityId",
    invalidCommunityIds = "invalid/communityIds",
    invalidPostId = "invalid/postId",
    invalidImageId = "invalid/imageId",
    invalidPostBody = "invalid/postBody",
    invalidVerificationToken = "invalid/verificationToken",
    invalidCommunityName = "invalid/communityName",
    invalidIsVerified = "invalid/isVerified",
    invalidOwnerId = "invalid/ownerId",
    invalidDescription = "invalid/description",
    invalidMoodId = "invalid/moodId",
    invalidPublic = "invalid/public",
    invalidMood = "invalid/mood",
    invalidCount = "invalid/count",
    invalidFile = "invalid/file",
    invalidBio = "invalid/bio",
    // Conflict
    usernameTaken = "conflict/username-taken",
    communityNameTaken = "conflict/communityName-taken",
    userNotFound = "conflict/user-notFound",
    userAlreadyVerified = "conflict/user-alreadyVerified",
    userNotInCommunity = "conflict/user-notInCommunity",
    userAlreadyInCommunity = "conflict/user-alreadyInCommunity",
    cannotSubmitMood = "conflict/cannot-submit-mood",
    noActiveMood = "conflict/no-active-mood",
    imageNotFound = "conflict/image-not-found",
    // Incorrect
    incorrectVerificationToken = "incorrect/verificationToken",
    incorrectPassword = "incorrect/password",
    // Auth`
    badAuthenticationToken = "auth/bad-token",
    missingAuthenticationToken = "auth/missing-token",
}

export default ErrorCodes;
