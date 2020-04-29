import * as t from "io-ts";
import { CommunityId } from "../community/CommunityTypes";
import * as MoodTypes from "./MoodTypes";
import { CreatedAt } from "../StandardTypes";

export const MoodId = t.type({ moodId: MoodTypes.MoodId });
export type MoodId = t.TypeOf<typeof MoodId>;

export const CommunityMood = t.exact(
    t.type({
        moodValue: MoodTypes.MoodValue,
        submissionCount: t.number,
        calculatedAt: t.string,
        delta: t.number,
    }),
);
export type CommunityMood = t.TypeOf<typeof CommunityMood>;

export const CommunityMoodWithId = t.intersection([CommunityMood, t.exact(t.type({ communityId: CommunityId }))]);
export type CommunityMoodWithId = t.TypeOf<typeof CommunityMoodWithId>;

export const PostMood = t.exact(t.intersection([CreatedAt, t.type({ moodValue: MoodTypes.MoodValue, communityId: CommunityId })]));
export type PostMood = t.TypeOf<typeof PostMood>;
