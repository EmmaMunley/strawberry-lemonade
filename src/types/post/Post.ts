import * as t from "io-ts";
import { UserId, Username } from "../user/UserTypes";
import * as PostTypes from "./PostTypes";
import { CommunityId, CommunityName } from "../community/CommunityTypes";
import { PostgresCount, Timestamps, NonNegativeNum } from "../StandardTypes";
import { MoodValue, StringMoodValue } from "../mood/MoodTypes";

export const PostId = t.type({
    postId: PostTypes.PostId,
});
export type PostId = t.TypeOf<typeof PostId>;

export const PostsCount = t.type({
    postsCount: PostgresCount,
});
export type PostsCount = t.TypeOf<typeof PostsCount>;

const BasePost = t.intersection([
    t.type({
        userId: UserId,
        body: PostTypes.PostBody,
    }),
    // Optional imageFile
    t.partial({
        imageFile: t.union([t.nullType, t.string]),
    }),
]);

export const NewPost = t.exact(
    t.intersection([
        BasePost,
        t.type({
            moodValue: StringMoodValue,
            communityIds: t.array(CommunityId),
        }),
    ]),
);

export type NewPost = t.TypeOf<typeof NewPost>;

/**
 *  CommunityPost - Post in the context of a specific community. The likes on the post are community-specific.
 */
export const CommunityPost = t.exact(
    t.intersection([
        BasePost,
        Timestamps,
        t.type({
            id: PostTypes.PostId,
            username: Username,
            likes: NonNegativeNum,
            liked: t.boolean,
            moodValue: MoodValue,
            imageExists: t.boolean,
        }),
    ]),
);
export type CommunityPost = t.TypeOf<typeof CommunityPost>;

export const CommunityLikes = t.exact(
    t.type({
        communityId: CommunityId,
        communityName: CommunityName,
        likes: NonNegativeNum,
    }),
);
export type CommunityLikes = t.TypeOf<typeof CommunityLikes>;

/**
 *  UserPost - A given post that exists in one to many communities. The likes on the post are the sum of the likes given to the post
 * in each community it was shared with.
 */
export const UserPost = t.exact(
    t.intersection([
        BasePost,
        Timestamps,
        t.type({
            id: PostTypes.PostId,
            username: Username,
            totalLikes: NonNegativeNum,
            imageExists: t.boolean,
            moodValue: MoodValue,
        }),
    ]),
);
export type UserPost = t.TypeOf<typeof UserPost>;

export const LikesPerCommunity = t.exact(t.type({ likesPerCommunity: t.array(CommunityLikes) }));
export type LikesPerCommunity = t.TypeOf<typeof LikesPerCommunity>;
