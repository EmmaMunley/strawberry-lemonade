import { UnhashedPassword, Username } from "../../types/user/UserTypes";
import * as t from "io-ts";

export const LoginUserDTO = t.type({ username: Username, password: UnhashedPassword });
export type LoginUserDTO = t.TypeOf<typeof LoginUserDTO>;
