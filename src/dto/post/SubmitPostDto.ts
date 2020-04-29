import { PostBody } from "../../types/post/PostTypes";
import * as t from "io-ts";
import { StringMoodValue } from "../../types/mood/MoodTypes";
import { StringifiedCommunityIds } from "../../types/community/CommunityTypes";

export const SubmitPostDTO = t.type({
    communityIds: StringifiedCommunityIds,
    body: PostBody,
    moodValue: StringMoodValue,
});
export type SubmitPostDTO = t.TypeOf<typeof SubmitPostDTO>;
