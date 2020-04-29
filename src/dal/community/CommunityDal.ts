import { ErrorResponse, communityNameTaken } from "../../error/ErrorResponses";
import { Community, NewCommunity, CommunityId, CommunityWithId } from "../../types/community/Community";
import { Either, left, right } from "fp-ts/lib/Either";
import { injectable } from "inversify";
import { CommunityQueries } from "./CommunityQueries";
import { Pool } from "../../database/pool/Pool";
import { Queriable } from "../../database/pool/QueryClient";
import { Exists } from "../../types/StandardTypes";
import { LoggerFactory } from "../../logger/LoggerFactory";
import PostDal from "../post/PostDal";
import MemberDal from "../member/MemberDal";
import { Logger } from "winston";
import MoodDal from "../mood/MoodDal";
import { CommunityPost } from "../../types/post/Post";

@injectable()
export default class CommunityDal {
    // TODO: WARNING:  there is no transaction in progress --- in Postgres logs
    private queries: CommunityQueries;
    private pool: Pool;
    private memberDal: MemberDal;
    private moodDal: MoodDal;
    private postDal: PostDal;
    private logger: Logger;

    constructor(queries: CommunityQueries, pool: Pool, memberDal: MemberDal, moodDal: MoodDal, postDal: PostDal, loggerFactory: LoggerFactory) {
        this.queries = queries;
        this.memberDal = memberDal;
        this.postDal = postDal;
        this.moodDal = moodDal;
        this.pool = pool;
        this.logger = loggerFactory.getLogger(module);
    }

    public async getCommunityId(communityName: string): Promise<string> {
        const query = this.queries.getCommunityId(communityName);
        const result = await this.pool.returningOne(query, CommunityId);
        return result.communityId;
    }

    public async communityExists(name: string, connection?: Queriable): Promise<boolean> {
        const query = this.queries.communityExists(name);
        const client = connection ? connection : this.pool;
        const result = await client.returningOne(query, Exists);
        return result.exists;
    }

    public async createCommunity(community: NewCommunity): Promise<Either<ErrorResponse, Community>> {
        const transaction = await this.pool.transaction();
        await transaction.begin();
        try {
            const exists = await this.communityExists(community.name, transaction);
            if (exists) {
                return left(communityNameTaken(community.name));
            }
            const communityData = await transaction.returningOne(this.queries.createCommunity(community), CommunityWithId);
            await this.memberDal.joinCommunityWithClient(communityData.ownerId, communityData.id, transaction);
            await transaction.commit();
            // Skip lookup for counts with known initial values
            return right({ ...communityData, postCount: 0, memberCount: 1, isMember: true });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async getCommunitiesForUser(userId: string): Promise<(Community & { topPosts: CommunityPost[] })[]> {
        const query = this.queries.getCommunitiesForUser(userId);
        const communities = await this.pool.returningMany(query, Community);

        // todo import wns: this is a bug, communityMood isn' included ever but is a partial field so it slips through
        return await Promise.all(
            communities.map(async community => {
                try {
                    const communityMood = await this.moodDal.getCommunityMood(community.id);
                    // todo - fix magic numbers
                    const topPosts = await this.postDal.getCommunityPosts(userId, community.id, 3, 0);
                    return { ...community, communityMood, topPosts };
                } catch (error) {
                    this.logger.error(`Error fetching communityMood and topPosts for community ${JSON.stringify(community)}`);
                    return { ...community, communityMood: undefined, topPosts: [] };
                }
            }),
        );
    }

    public async getTrendingCommunities(userId: string, limit: number, offset: number): Promise<Community[]> {
        const query = this.queries.getTrendingCommunities(userId, limit, offset);
        const communities = await this.pool.returningMany(query, Community);
        return await Promise.all(
            communities.map(async community => {
                const communityMood = await this.moodDal.getCommunityMood(community.id);
                return { ...community, communityMood };
            }),
        );
    }
}
