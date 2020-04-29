import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { NewCommunity } from "../../types/community/Community";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { LoggerFactory } from "../../logger/LoggerFactory";

@injectable()
export class CommunityQueries extends CategorizedQueries {
    private getCommunityIdQuery: string;
    private communityExistsQuery: string;
    private createCommunityQuery: string;
    private getCommunitiesForUserQuery: string;
    private getTrendingCommunitiesQuery: string;

    constructor(config: AppConfiguration, loggerFactory: LoggerFactory) {
        super(config, loggerFactory, "community");
        this.getCommunityIdQuery = this.loadSQLFile("GetCommunityId");
        this.communityExistsQuery = this.loadSQLFile("CommunityExists");
        this.createCommunityQuery = this.loadSQLFile("CreateCommunity");
        this.getCommunitiesForUserQuery = this.loadSQLFile("GetCommunitiesForUser");
        this.getTrendingCommunitiesQuery = this.loadSQLFile("GetTrendingCommunities");
    }

    public getCommunityId(communityName: string): Query {
        return { query: this.getCommunityIdQuery, values: [communityName] };
    }

    public communityExists(communityName: string): Query {
        return { query: this.communityExistsQuery, values: [communityName] };
    }

    public createCommunity(community: NewCommunity): Query {
        return { query: this.createCommunityQuery, values: [community.ownerId, community.name, community.description, community.public] };
    }

    public getCommunitiesForUser(userId: string): Query {
        return { query: this.getCommunitiesForUserQuery, values: [userId] };
    }

    public getTrendingCommunities(userId: string, limit: number, offset: number): Query {
        return { query: this.getTrendingCommunitiesQuery, values: [userId, limit, offset] };
    }
}
