import { LoggerFactory } from "../logger/LoggerFactory";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { Pool } from "./pool/Pool";
import { Queries } from "../dal/Queries";

@injectable()
export class Database extends Queries {
    private pool: Pool;

    constructor(pool: Pool, config: AppConfiguration, loggerFactory: LoggerFactory) {
        super(config, loggerFactory);
        this.pool = pool;
    }

    async close(): Promise<void> {
        await this.pool.close();
    }

    async initialize(): Promise<void> {
        await this.initializeExtensions();
        await this.initializeFunctions();
        await this.initializeTables();
        await this.initializeViews();
        await this.initializeTriggers();
    }

    private async initializeTables(): Promise<void> {
        await this.pool.query(this.loadQuery("user", "CreateUsersTable"));
        await this.pool.query(this.loadQuery("post", "CreatePostsTable"));
        await this.pool.query(this.loadQuery("community", "CreateCommunitiesTable"));
        await this.pool.query(this.loadQuery("post", "CreatePostCommunitiesTable"));
        await this.pool.query(this.loadQuery("member", "CreateMembersTable"));
        await this.pool.query(this.loadQuery("mood", "CreateCommunityMoodsTable"));
        await this.pool.query(this.loadQuery("mood", "CreateCommunityMoodsHistoryTable"));
        await this.pool.query(this.loadQuery("like", "CreateLikesTable"));
    }

    private async initializeViews(): Promise<void> {
        await this.pool.query(this.loadQuery("post", "CreatePostsDetailedView"));
        await this.pool.query(this.loadQuery("member", "CreateMembersDetailedView"));
        await this.pool.query(this.loadQuery("like", "CreateLikesDetailedView"));
    }

    private async initializeExtensions(): Promise<void> {
        await this.pool.query(this.loadQuery("extensions", "CreateUUIDExtension"));
    }

    private async initializeFunctions(): Promise<void> {
        await this.pool.query(this.loadQuery("functions", "CreateUpdatedAtTrigger"));
        await this.pool.query(this.loadQuery("functions", "TriggerSetUpdatedAt"));
    }

    private async initializeTriggers(): Promise<void> {
        await this.pool.query(this.loadQuery("triggers", "SetUpdatedAt"));
    }

    private loadQuery(queryDir: string, file: string): string {
        return this._loadSQLFile(queryDir, file);
    }
}
