import { VerificationToken, UserId } from "../../types/user/UserTypes";
import * as t from "io-ts";

export const VerifyUserDTO = t.type({ verificationToken: VerificationToken, userId: UserId });
export type VerifyUserDTO = t.TypeOf<typeof VerifyUserDTO>;
