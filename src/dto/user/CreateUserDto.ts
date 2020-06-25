import * as t from "io-ts";
import { Email, UnhashedPassword, PhoneNumber } from "../../types/user/UserTypes";

export const CreateUserDTO = t.type({ email: Email, password: UnhashedPassword, phoneNumber: PhoneNumber });
export type CreateUserDTO = t.TypeOf<typeof CreateUserDTO>;
