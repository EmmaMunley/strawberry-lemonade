import ErrorCodes from "../error/ErrorCodes";
import { isLeft, Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";

export function validate<A, I, O>(type: t.Type<A, I, O>, value: O): Either<ErrorCodes[], A> {
    const decoded = type.decode(value);
    if (isLeft(decoded)) {
        const errorCodes: ErrorCodes[] = [];
        decoded.left.forEach(error => {
            if (typeof error.message === "string") {
                // todo: refactor so this assertion isn't necessary
                errorCodes.push(error.message as ErrorCodes);
            }
        });
        return left(errorCodes);
    } else {
        type.pipe;
        return right(decoded.right);
    }
}
