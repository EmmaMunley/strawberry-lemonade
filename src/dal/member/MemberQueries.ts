import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { LoggerFactory } from "../../logger/LoggerFactory";

@injectable()
export class MemberQueries extends CategorizedQueries {
    private joinCommunityQuery: string;
    private leaveCommunityQuery: string;
    private memberExistsQuery: string;
    private getCommunityMemberCountQuery: string;
    private getUserMembershipsQuery: string;

    constructor(config: AppConfiguration, loggerFactory: LoggerFactory) {
        super(config, loggerFactory, "member");
        this.joinCommunityQuery = this.loadSQLFile("JoinCommunity");
        this.leaveCommunityQuery = this.loadSQLFile("LeaveCommunity");
        this.memberExistsQuery = this.loadSQLFile("MemberExists");
        this.getCommunityMemberCountQuery = this.loadSQLFile("GetCommunityMemberCount");
        this.getUserMembershipsQuery = this.loadSQLFile("GetUserMemberships");
    }

    public joinCommunity(userId: string, communityId: string): Query {
        return { query: this.joinCommunityQuery, values: [userId, communityId] };
    }

    public leaveCommunity(userId: string, communityId: string): Query {
        return { query: this.leaveCommunityQuery, values: [userId, communityId] };
    }

    public memberExists(userId: string, communityId: string): Query {
        return { query: this.memberExistsQuery, values: [userId, communityId] };
    }

    public getCommunityMemberCount(communityId: string): Query {
        return { query: this.getCommunityMemberCountQuery, values: [communityId] };
    }

    public getUserMemberships(userId: string): Query {
        return { query: this.getUserMembershipsQuery, values: [userId] };
    }
}
