import * as t from "io-ts";
import { UnhashedPassword } from "../../types/user/UserTypes";

export const ChangePasswordDTO = t.type({ password: t.string, newPassword: UnhashedPassword });
export type ChangePasswordDTO = t.TypeOf<typeof ChangePasswordDTO>;
