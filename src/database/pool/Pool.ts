import { Pool as PgPool } from "pg";
import { Transaction } from "./Transaction";
import * as t from "io-ts";
import { AppConfiguration } from "../../config/Configuration";
import { types, PoolClient } from "pg";
import { injectable } from "inversify";
import { QueryClient, Queriable, Query } from "./QueryClient";
import { timestampToSwiftApprovedFormat } from "../../utils/date";
import { LoggerFactory } from "../../logger/LoggerFactory";

@injectable()
export class Pool extends QueryClient implements Queriable {
    private pool: PgPool;
    private logger = LoggerFactory.getLogger(module);

    constructor(config: AppConfiguration) {
        super();
        this.disableTimestampParsing();
        this.pool = new PgPool(config.get().postgres.pool);
    }

    printStats(): void {
        this.logger.info(`== PG Connection pool stats ==`);
        this.logger.info(`Total: ${this.pool.totalCount}`);
        this.logger.info(`Idle: ${this.pool.idleCount}`);
        this.logger.info(`Waiting: ${this.pool.waitingCount}`);
    }
    async getConnection(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    private disableTimestampParsing(): void {
        types.setTypeParser(types.builtins.TIMESTAMPTZ, timestampToSwiftApprovedFormat);
    }

    async transaction(): Promise<Transaction> {
        const connection = await this.getConnection();
        return new Transaction(connection);
    }

    async returningOne<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A> {
        return await this.returningOneWithClient(query, type, this.pool);
    }

    async returningMaybeOne<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A | undefined> {
        return await this.returningMaybeOneWithClient(query, type, this.pool);
    }

    async returningMany<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A[]> {
        return await this.returningManyWithClient(query, type, this.pool);
    }

    async returningNone(query: Query): Promise<void> {
        return await this.returningNoneWithClient(query, this.pool);
    }
}
