import * as t from "io-ts";
import { UserId } from "../user/UserTypes";
import * as CommunityTypes from "./CommunityTypes";
import { CommunityMood } from "../mood/Mood";
import { NonNegativeNum } from "../StandardTypes";

export const CommunityId = t.exact(t.type({ communityId: CommunityTypes.CommunityId }));
export type CommunityId = t.TypeOf<typeof CommunityId>;

export const NewCommunity = t.type({
    ownerId: UserId,
    name: CommunityTypes.CommunityName,
    description: CommunityTypes.CommunityDescription,
    public: CommunityTypes.CommunityIsPublic,
});
export type NewCommunity = t.TypeOf<typeof NewCommunity>;

export const CommunityWithId = t.intersection([t.type({ id: CommunityTypes.CommunityId }), NewCommunity]);
export type CommunityWithId = t.TypeOf<typeof CommunityWithId>;

export const Community = t.intersection([
    CommunityWithId,
    t.type({ postCount: NonNegativeNum, memberCount: NonNegativeNum, isMember: t.boolean }),
    t.partial({ communityMood: CommunityMood }),
]);
export type Community = t.TypeOf<typeof Community>;
