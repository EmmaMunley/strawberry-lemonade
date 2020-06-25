import * as t from "io-ts";
import { Email } from "../../types/user/UserTypes";

export const UserExistsDTO = t.type({ email: Email });
export type UserExistsDTO = t.TypeOf<typeof UserExistsDTO>;
