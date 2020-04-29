import * as t from "io-ts";
import { PostId } from "../../types/post/PostTypes";
import { CommunityId } from "../../types/community/CommunityTypes";

export const LikePostDTO = t.type({
    like: t.boolean,
    postId: PostId,
    communityId: CommunityId,
});
export type LikePostDTO = t.TypeOf<typeof LikePostDTO>;
