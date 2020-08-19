import * as t from "io-ts";
import * as UserTypes from "./UserTypes";
import { CreatedAt } from "../StandardTypes";

export const UserId = t.exact(t.type({ id: UserTypes.UserId }));
export type UserId = t.TypeOf<typeof UserId>;

// todo: Refactor UserId to be `userId: UserTypes.UserId
export const UserIdParam = t.exact(t.type({ userId: UserTypes.UserId }));
export type UserIdParam = t.TypeOf<typeof UserIdParam>;

export const NewUser = t.exact(
    t.type({
        id: UserTypes.UserId,
        email: UserTypes.Email,
        phoneNumber: UserTypes.PhoneNumber,
        password: UserTypes.UnhashedPassword,
    }),
);
export type NewUser = t.TypeOf<typeof NewUser>;

export const UserDetails = t.exact(
    t.intersection([
        t.type({
            id: UserTypes.UserId,
            email: UserTypes.Email,
            imageExists: t.boolean,
            registryExists: t.boolean,
        }),
        CreatedAt,
        // Optional imageFile
        t.partial({
            imageFile: t.union([t.nullType, t.string]),
        }),
    ]),
);
export type UserDetails = t.TypeOf<typeof UserDetails>;

export const User = t.intersection([
    UserDetails,
    t.exact(
        t.type({
            isVerified: UserTypes.UserIsVerified,
            phoneNumber: UserTypes.PhoneNumber,
            verificationToken: UserTypes.VerificationToken,
            password: t.string,
        }),
    ),
]);
export type User = t.TypeOf<typeof User>;
