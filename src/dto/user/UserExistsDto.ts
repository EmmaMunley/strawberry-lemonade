import * as t from "io-ts";
import { Username } from "../../types/user/UserTypes";

export const UserExistsDTO = t.type({ username: Username });
export type UserExistsDTO = t.TypeOf<typeof UserExistsDTO>;
