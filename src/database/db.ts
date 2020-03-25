import knex from "knex";
import { initializeUsersTable } from "./usersTable";
import Knex from "knex";
import { LoggerFactory } from "../logger/LoggerFactory";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";

@injectable()
export class Database {
    private db: Knex;
    private config: AppConfiguration;
    private logger = LoggerFactory.getLogger(module);

    constructor(config: AppConfiguration) {
        this.db = knex({
            client: "pg",
            connection: {
                host: "localhost",
                user: "postgres",
                password: "password",
                database: "bliss-registry",
            },
        });
        this.config = config;
    }

    async initializeDatabase(): Promise<void> {
        const configData = this.config.get();
        await this.initializeExtensions();
        await initializeUsersTable(this.db, configData);
        this.logger.info("Database finished initializing");
    }

    async initializeExtensions(): Promise<void> {
        this.logger.info("Initializing Postgres uuid extension");
        await this.db.raw('create extension if not exists "uuid-ossp"');
    }

    public getConnection(): Knex {
        return this.db;
    }
}
