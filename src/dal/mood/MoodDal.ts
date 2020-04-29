import { CommunityMood, CommunityMoodWithId } from "../../types/mood/Mood";
import { injectable } from "inversify";
import { MoodQueries } from "./MoodQueries";
import { Pool } from "../../database/pool/Pool";

@injectable()
export default class MoodDal {
    private pool: Pool;
    private queries: MoodQueries;

    constructor(pool: Pool, queries: MoodQueries) {
        this.pool = pool;
        this.queries = queries;
    }

    public async getCommunityMood(communityId: string): Promise<CommunityMood | undefined> {
        const query = this.queries.getCommunityMood(communityId);
        const result = await this.pool.returningMaybeOne(query, CommunityMood);
        return result;
    }

    public async createCommunityMood(mood: CommunityMoodWithId): Promise<CommunityMood | undefined> {
        const query = this.queries.createCommunityMood(mood);
        return await this.pool.returningOne(query, CommunityMood);
    }

    // todo: rethink how updating is done when history/deletion is done in tandem
    public async updateCommunityMood(mood: CommunityMoodWithId): Promise<void> {
        const query = this.queries.updateCommunityMood(mood);
        await this.pool.returningNone(query);
    }

    public async getCommunityMoodHistory(communityId: string): Promise<CommunityMood[]> {
        const query = this.queries.getCommunityMoodHistory(communityId);
        return await this.pool.returningMany(query, CommunityMood);
    }

    public async createCommunityMoodHistory(mood: CommunityMoodWithId): Promise<void> {
        const query = this.queries.createCommunityMoodHistory(mood);
        await this.pool.returningNone(query);
    }
}
