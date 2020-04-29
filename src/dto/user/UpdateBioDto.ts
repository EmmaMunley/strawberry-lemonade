import { UserBio } from "../../types/user/UserTypes";
import * as t from "io-ts";

export const UpdateBioDTO = t.type({ bio: UserBio });
export type UpdateBioDTO = t.TypeOf<typeof UpdateBioDTO>;
