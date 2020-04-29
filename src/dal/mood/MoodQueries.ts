import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CommunityMoodWithId } from "../../types/mood/Mood";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { LoggerFactory } from "../../logger/LoggerFactory";

@injectable()
export class MoodQueries extends CategorizedQueries {
    private getCommunityMoodHistoryQuery: string;
    private getCommunityMoodQuery: string;
    private createCommunityMoodHistoryQuery: string;
    private createCommunityMoodQuery: string;
    private updateCommunityMoodQuery: string;

    constructor(config: AppConfiguration, loggerFactory: LoggerFactory) {
        super(config, loggerFactory, "mood");
        this.getCommunityMoodQuery = this.loadSQLFile("GetCommunityMood");
        this.getCommunityMoodHistoryQuery = this.loadSQLFile("GetCommunityMoodHistory");
        this.createCommunityMoodQuery = this.loadSQLFile("CreateCommunityMood");
        this.createCommunityMoodHistoryQuery = this.loadSQLFile("CreateCommunityMoodHistory");
        this.updateCommunityMoodQuery = this.loadSQLFile("UpdateCommunityMood");
    }

    public getCommunityMood(communityId: string): Query {
        return { query: this.getCommunityMoodQuery, values: [communityId] };
    }

    public getCommunityMoodHistory(communityId: string): Query {
        return { query: this.getCommunityMoodHistoryQuery, values: [communityId] };
    }

    public updateCommunityMood(mood: CommunityMoodWithId): Query {
        return {
            query: this.updateCommunityMoodQuery,
            values: [mood.moodValue, mood.submissionCount, mood.calculatedAt, mood.delta, mood.communityId],
        };
    }

    public createCommunityMood(mood: CommunityMoodWithId): Query {
        return {
            query: this.createCommunityMoodQuery,
            values: [mood.communityId, mood.moodValue, mood.submissionCount, mood.calculatedAt, mood.delta],
        };
    }

    public createCommunityMoodHistory(mood: CommunityMoodWithId): Query {
        return {
            query: this.createCommunityMoodHistoryQuery,
            values: [mood.communityId, mood.moodValue, mood.submissionCount, mood.calculatedAt, mood.delta],
        };
    }
}
