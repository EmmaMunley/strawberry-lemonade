import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { Pool } from "./pool/Pool";
import { Queries } from "../dal/Queries";
@injectable()
export class Database extends Queries {
    private pool: Pool;
    constructor(pool: Pool, config: AppConfiguration) {
        super(config);
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
        await this.pool.query(this.loadQuery("registry", "CreateRegistryTable"));
        await this.pool.query(this.loadQuery("registry_item", "CreateRegistryItemTable"));
    }
    private async initializeViews(): Promise<void> {
        await this.pool.query(this.loadQuery("registry_item", "CreateRegistryItemView"));
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
