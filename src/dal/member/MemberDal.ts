import { CommunityMember, MemberCount } from "../../types/member/Member";
import { injectable } from "inversify";
import { Pool } from "../../database/pool/Pool";
import { MemberQueries } from "./MemberQueries";
import { Queriable } from "../../database/pool/QueryClient";
import { Exists } from "../../types/StandardTypes";
import { CommunityId } from "../../types/community/Community";

@injectable()
export default class MemberDal {
    public queries: MemberQueries;
    private pool: Pool;

    constructor(pool: Pool, queries: MemberQueries) {
        this.pool = pool;
        this.queries = queries;
    }

    public async joinCommunity(userId: string, communityId: string): Promise<CommunityMember> {
        return await this.joinCommunityWithClient(userId, communityId, this.pool);
    }

    public async leaveCommunity(userId: string, communityId: string): Promise<void> {
        const query = this.queries.leaveCommunity(userId, communityId);
        await this.pool.returningNone(query);
    }

    public async getMemberCount(communityId: string): Promise<number> {
        const query = this.queries.getCommunityMemberCount(communityId);
        const result = await this.pool.returningOne(query, MemberCount);
        return result.memberCount;
    }

    public async joinCommunityWithClient(userId: string, communityId: string, client: Queriable): Promise<CommunityMember> {
        const result = await client.returningOne(this.queries.joinCommunity(userId, communityId), CommunityMember);
        return result;
    }

    public async isMember(userId: string, communityId: string): Promise<boolean> {
        const result = await this.pool.returningOne(this.queries.memberExists(userId, communityId), Exists);
        return result.exists;
    }

    public async getUserMemberships(userId: string): Promise<string[]> {
        const result = await this.pool.returningMany(this.queries.getUserMemberships(userId), CommunityId);
        return result.map(r => r.communityId);
    }
}
