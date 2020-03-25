import * as t from "io-ts";
import { Username, UnhashedPassword, PhoneNumber } from "../../types/user/UserTypes";

export const CreateUserDTO = t.type({ username: Username, password: UnhashedPassword, phoneNumber: PhoneNumber });
export type CreateUserDTO = t.TypeOf<typeof CreateUserDTO>;
