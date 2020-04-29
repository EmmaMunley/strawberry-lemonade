import ErrorCodes from "../../error/ErrorCodes";
import * as t from "io-ts";
import { createUUIDType } from "../StandardTypes";
import validator from "validator";
import { isRight } from "fp-ts/lib/Either";

export const CommunityId = createUUIDType("CommunityId", ErrorCodes.invalidCommunityId);
type CommunityId = t.TypeOf<typeof CommunityId>;

export const CommunityName = new t.Type<string, string, unknown>(
    "CommunityName",
    (name): name is string => typeof name === "string",
    (name, context) =>
        typeof name === "string" && validator.isLength(name, 2, 30) ? t.success(name) : t.failure(name, context, ErrorCodes.invalidCommunityName),
    t.identity,
);

export const CommunityDescription = new t.Type<string, string, unknown>(
    "CommunityDescription",
    (description): description is string => typeof description === "string",
    (description, context) =>
        typeof description === "string" && validator.isLength(description, 0, 255)
            ? t.success(description)
            : t.failure(description, context, ErrorCodes.invalidDescription),
    t.identity,
);

export const CommunityIsPublic = new t.Type<boolean, boolean, unknown>(
    "CommunityIsPublic",
    (isPublic): isPublic is boolean => typeof isPublic === "boolean",
    (isPublic, context) => (typeof isPublic === "boolean" ? t.success(isPublic) : t.failure(isPublic, context, ErrorCodes.invalidPublic)),
    t.identity,
);

function isCommunityIdArray(communityIds: unknown): communityIds is Array<CommunityId> {
    return Array.isArray(communityIds) && communityIds.every(id => isRight(CommunityId.decode(id)));
}

export const StringifiedCommunityIds = new t.Type<Array<CommunityId>, string, unknown>(
    "StringifiedCommunityIds",
    (communityIds): communityIds is Array<CommunityId> => isCommunityIdArray(communityIds),
    (communityIds, context) => {
        if (typeof communityIds === "string") {
            try {
                const ids = JSON.parse(communityIds);
                if (isCommunityIdArray(ids)) {
                    return t.success(ids);
                }
            } catch {
                // Do nothing, validation failed
            }
        }
        return t.failure(communityIds, context, ErrorCodes.invalidCommunityIds);
    },
    String,
);
