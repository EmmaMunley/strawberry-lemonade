import * as t from "io-ts";
import { CommunityName, CommunityDescription, CommunityIsPublic } from "../../types/community/CommunityTypes";

export const CreateCommunityDTO = t.type({ name: CommunityName, description: CommunityDescription, public: CommunityIsPublic });
export type CreateCommunityDTO = t.TypeOf<typeof CreateCommunityDTO>;
