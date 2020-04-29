import ErrorCodes from "../../error/ErrorCodes";
import * as t from "io-ts";
import { createUUIDType } from "../StandardTypes";

const withinRange = (val: number, min: number, max: number): boolean => val <= max && val >= min;

export const MoodValue = new t.Type<number, number, unknown>(
    "MoodValue",
    (moodValue): moodValue is number => typeof moodValue === "number",
    (moodValue, context) =>
        typeof moodValue === "number" && withinRange(moodValue, 0, 1) ? t.success(moodValue) : t.failure(moodValue, context, ErrorCodes.invalidMood),
    t.identity,
);

// todo Hack Alert -- This is used for moodValues sent from the front-end when creating Posts. Multipart forms do not support
// number parameters, so the value is sent over as a string.
export const StringMoodValue = new t.Type<number, string, unknown>(
    "MoodValue",
    (moodValue): moodValue is number => typeof moodValue === "number",
    (moodValue, context) => {
        if (typeof moodValue === "string") {
            const value = Number.parseFloat(moodValue);
            if (!Number.isNaN(value) && withinRange(value, 0, 1)) {
                return t.success(value);
            } else {
                return t.failure(moodValue, context, ErrorCodes.invalidMood);
            }
        }
        return t.failure(moodValue, context, ErrorCodes.invalidMood);
    },
    String,
);

export const MoodId = createUUIDType("MoodId", ErrorCodes.invalidMoodId);
