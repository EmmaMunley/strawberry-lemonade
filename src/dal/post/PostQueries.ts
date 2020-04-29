import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { LoggerFactory } from "../../logger/LoggerFactory";

@injectable()
export class PostQueries extends CategorizedQueries {
    private createPostQuery: string;
    private likePostQuery: string;
    private unlikePostQuery: string;
    private getPostsForCommunityQuery: string;
    private getPostsForUserQuery: string;
    private getLikesPerCommunityQuery: string;
    private getPostByIdQuery: string;
    private getCommunityPostCountQuery: string;
    private getMoodsWithinWindowQuery: string;

    constructor(config: AppConfiguration, loggerFactory: LoggerFactory) {
        super(config, loggerFactory, "post");
        this.createPostQuery = this.loadSQLFile("CreatePost");
        this.likePostQuery = this.loadSQLFile("LikePost");
        this.unlikePostQuery = this.loadSQLFile("UnlikePost");
        this.getPostsForCommunityQuery = this.loadSQLFile("GetPostsForCommunity");
        this.getPostsForUserQuery = this.loadSQLFile("GetPostsForUser");
        this.getLikesPerCommunityQuery = this.loadSQLFile("GetLikesPerCommunity");
        this.getPostByIdQuery = this.loadSQLFile("GetPostById");
        this.getCommunityPostCountQuery = this.loadSQLFile("GetCommunityPostCount");
        this.getMoodsWithinWindowQuery = this.loadSQLFile("GetMoodsWithinWindow");
    }

    public getPostsForCommunity(userId: string, communityId: string, limit: number, offset: number): Query {
        return { query: this.getPostsForCommunityQuery, values: [userId, communityId, limit, offset] };
    }

    public getPostsForUser(userId: string, limit: number, offset: number): Query {
        return { query: this.getPostsForUserQuery, values: [userId, limit, offset] };
    }

    public getLikesPerCommunity(postId: string): Query {
        return { query: this.getLikesPerCommunityQuery, values: [postId] };
    }

    public getPostById(userId: string, postId: string): Query {
        return { query: this.getPostByIdQuery, values: [userId, postId] };
    }

    public getCommunityPostCount(communityId: string): Query {
        return { query: this.getCommunityPostCountQuery, values: [communityId] };
    }

    public createPost(userId: string, body: string, moodValue: number, imageFile?: string | null): Query {
        return { query: this.createPostQuery, values: [userId, body, moodValue, imageFile] };
    }

    public likePost(postId: string, communityId: string, userId: string): Query {
        return { query: this.likePostQuery, values: [postId, communityId, userId] };
    }

    public unlikePost(postId: string, communityId: string, userId: string): Query {
        return { query: this.unlikePostQuery, values: [postId, communityId, userId] };
    }

    public getMoodsWithinWindow(windowMinutes: number): Query {
        return { query: this.getMoodsWithinWindowQuery, values: [this.minutes(windowMinutes)] };
    }

    // todo: special case - how can we cleanly insert a dynamic amount of rows?
    public insertPostCommunities(postId: string, communityIds: string[]): Query {
        let query = "INSERT INTO post_communities (post_id, community_id) VALUES ";
        const insertValues = [];
        for (let i = 2; i <= communityIds.length + 1; i++) {
            insertValues.push(`($1, $${i})`);
        }
        query = query.concat(insertValues.join(","));
        return { query, values: [postId, ...communityIds] };
    }
}
