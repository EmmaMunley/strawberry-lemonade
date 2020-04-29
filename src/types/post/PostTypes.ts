import * as t from "io-ts";
import { createUUIDType } from "../StandardTypes";
import ErrorCodes from "../../error/ErrorCodes";

export const PostBody = new t.Type<string, string, unknown>(
    "PostBody",
    (body): body is string => typeof body === "string",
    (body, context) => (typeof body === "string" ? t.success(body) : t.failure(body, context, ErrorCodes.invalidPostBody)),
    t.identity,
);

export const ImageId = createUUIDType("ImageId", ErrorCodes.invalidImageId);
export const PostId = createUUIDType("PostId", ErrorCodes.invalidPostId);
