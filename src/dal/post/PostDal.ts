import { injectable } from "inversify";
import { PostQueries } from "./PostQueries";
import { Pool } from "../../database/pool/Pool";
import { CommunityPost, NewPost, PostsCount, PostId, UserPost, CommunityLikes, LikesPerCommunity } from "../../types/post/Post";
import { AppConfiguration } from "../../config/Configuration";
import { PostMood } from "../../types/mood/Mood";

@injectable()
export default class PostDal {
    private pool: Pool;
    private queries: PostQueries;
    private postExpirationMinutes: number;

    constructor(pool: Pool, queries: PostQueries, config: AppConfiguration) {
        this.pool = pool;
        this.queries = queries;
        this.postExpirationMinutes = config.get().posts.postExpirationMinutes;
    }

    public async getCommunityPostById(userId: string, postId: string): Promise<CommunityPost> {
        const query = this.queries.getPostById(userId, postId);
        return await this.pool.returningOne(query, CommunityPost);
    }

    public async createPost(newPost: NewPost): Promise<PostId> {
        const { userId, body, communityIds, imageFile, moodValue } = newPost;
        const transaction = await this.pool.transaction();
        await transaction.begin();
        try {
            const insertPostQuery = this.queries.createPost(userId, body, moodValue, imageFile);
            const postIdResult = await transaction.returningOne(insertPostQuery, PostId);
            const insertPostCommunitiesQuery = this.queries.insertPostCommunities(postIdResult.postId, communityIds);
            await transaction.returningNone(insertPostCommunitiesQuery);
            await transaction.commit();
            return postIdResult;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async getCommunityPostCount(communityId: string): Promise<number> {
        const query = this.queries.getCommunityPostCount(communityId);
        const result = await this.pool.returningOne(query, PostsCount);
        return result.postsCount;
    }

    public async getCommunityPosts(userId: string, communityId: string, limit: number, offset: number): Promise<CommunityPost[]> {
        const query = this.queries.getPostsForCommunity(userId, communityId, limit, offset);
        const result = await this.pool.returningMany(query, CommunityPost);
        return result;
    }

    public async getUserPosts(userId: string, limit: number, offset: number): Promise<(UserPost & LikesPerCommunity)[]> {
        const getPostsQuery = this.queries.getPostsForUser(userId, limit, offset);
        // minor hack -- using a transaction as a simple way to only use on connection across a single user posts request to avoid exhausting the pool
        const transaction = await this.pool.transaction();
        transaction.begin();
        const posts = await transaction.returningMany(getPostsQuery, UserPost);
        const postsWithCommunityLikes = await Promise.all(
            posts.map(async post => {
                const query = this.queries.getLikesPerCommunity(post.id);
                const likesPerCommunity = await transaction.returningMany(query, CommunityLikes);
                return { ...post, likesPerCommunity };
            }),
        );
        transaction.commit();
        return postsWithCommunityLikes;
    }

    public async likePost(postId: string, communityId: string, userId: string): Promise<void> {
        const query = this.queries.likePost(postId, communityId, userId);
        await this.pool.returningNone(query);
    }

    public async unlikePost(postId: string, communityId: string, userId: string): Promise<void> {
        const query = this.queries.unlikePost(postId, communityId, userId);
        await this.pool.returningNone(query);
    }

    public async getMoodsWithinWindow(): Promise<PostMood[]> {
        const query = this.queries.getMoodsWithinWindow(this.postExpirationMinutes);
        const result = this.pool.returningMany(query, PostMood);
        return result;
    }
}
