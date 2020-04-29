import * as t from "io-ts";
import { CommunityId } from "../community/CommunityTypes";
import { UserId } from "../user/UserTypes";
import { PostgresCount } from "../StandardTypes";

export const MemberCount = t.type({
    memberCount: PostgresCount,
});
export type MemberCount = t.TypeOf<typeof MemberCount>;

export const CommunityMember = t.type({ communityId: CommunityId, userId: UserId });
export type CommunityMember = t.TypeOf<typeof CommunityMember>;
