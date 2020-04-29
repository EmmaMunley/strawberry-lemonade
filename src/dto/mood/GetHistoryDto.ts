import * as t from "io-ts";
import { CommunityId } from "../../types/community/CommunityTypes";

export const GetHistoryDTO = t.type({ communityId: CommunityId });
export type GetHistoryDTO = t.TypeOf<typeof GetHistoryDTO>;
