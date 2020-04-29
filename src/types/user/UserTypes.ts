import * as t from "io-ts";
import validator from "validator";
import ErrorCodes from "../../error/ErrorCodes";
import { createUUIDType } from "../StandardTypes";
import { AppConfiguration } from "../../config/Configuration";
import { dependencies } from "../../dependencies/inversify.config";

const config = dependencies.resolve(AppConfiguration).get();

export const PhoneNumber = new t.Type<string, string, unknown>(
    "PhoneNumber",
    (phoneNumber): phoneNumber is string => typeof phoneNumber === "string",
    (phoneNumber, context) =>
        typeof phoneNumber === "string" && validator.isMobilePhone(phoneNumber, "en-US")
            ? t.success(phoneNumber)
            : t.failure(phoneNumber, context, ErrorCodes.invalidPhoneNumber),
    t.identity,
);

const usernameRegex: RegExp = config.auth.usernameRegex;
export const Username = new t.Type<string, string, unknown>(
    "Username",
    (username): username is string => typeof username === "string",
    (username, context) =>
        typeof username === "string" && validator.matches(username, usernameRegex)
            ? t.success(username)
            : t.failure(username, context, ErrorCodes.invalidUsername),
    t.identity,
);

const passwordRegex: RegExp = config.auth.passwordRegex;
export const UnhashedPassword = new t.Type<string, string, unknown>(
    "Password",
    (password): password is string => typeof password === "string",
    (password, context) =>
        typeof password === "string" && validator.matches(password, passwordRegex)
            ? t.success(password)
            : t.failure(password, context, ErrorCodes.invalidPassword),
    t.identity,
);

const tokenLength: number = config.verification.tokenLength;
export const VerificationToken = new t.Type<string, string, unknown>(
    "VerificationToken",
    (token): token is string => typeof token === "string",
    (token, context) =>
        typeof token === "string" && validator.isNumeric(token) && token.length === tokenLength
            ? t.success(token)
            : t.failure(token, context, ErrorCodes.invalidVerificationToken),
    t.identity,
);

export const UserIsVerified = new t.Type<boolean, boolean, unknown>(
    "UserIsVerified",
    (isVerified): isVerified is boolean => typeof isVerified === "boolean",
    (isVerified, context) => (typeof isVerified === "boolean" ? t.success(isVerified) : t.failure(isVerified, context, ErrorCodes.invalidIsVerified)),
    t.identity,
);

export const UserBio = new t.Type<string, string, unknown>(
    "UserBio",
    (bio): bio is string => typeof bio === "string",
    (bio, context) => (typeof bio === "string" && bio.length <= 250 ? t.success(bio) : t.failure(bio, context, ErrorCodes.invalidBio)),
    t.identity,
);

export const UserId = createUUIDType("UserId", ErrorCodes.invalidUserId);
