import { UnhashedPassword, Email } from "../../types/user/UserTypes";
import * as t from "io-ts";

export const LoginUserDTO = t.type({ email: Email, password: t.string });
export type LoginUserDTO = t.TypeOf<typeof LoginUserDTO>;
