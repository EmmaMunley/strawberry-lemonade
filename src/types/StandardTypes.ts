import * as t from "io-ts";
import validator from "validator";
import ErrorCodes from "../error/errorCodes";
import { either } from "fp-ts/lib/Either";

export const Exists = t.type({ exists: t.boolean });

export function createUUIDType(typeName: string, validationError: ErrorCodes): t.Type<string, string, unknown> {
    return new t.Type<string, string, unknown>(
        typeName,
        (id): id is string => typeof id === "string",
        (id, context) =>
            typeof id === "string" && validator.isUUID(id, 4) ? t.success(id) : t.failure(id, context, validationError),
        t.identity,
    );
}

export const PostgresCount = new t.Type<number, string, unknown>(
    "PostgresCount",
    t.number.is,
    (u, c) =>
        either.chain(t.string.validate(u, c), s => {
            const n = +s;
            return isNaN(n) || s.trim() === "" ? t.failure(u, c, ErrorCodes.invalidCount) : t.success(n);
        }),
    String,
);

export const NonNegativeNum = new t.Type<number, number, unknown>(
    "NonNegativeNum",
    (num): num is number => typeof num === "number",
    (num, context) =>
        typeof num === "number" && num >= 0 ? t.success(num) : t.failure(num, context, ErrorCodes.invalidCount),
    t.identity,
);

export const CreatedAt = t.type({
    createdAt: t.string,
});

export const UpdatedAt = t.type({
    updatedAt: t.string,
});

export const Timestamps = t.intersection([CreatedAt, UpdatedAt]);
