import { PoolClient } from "pg";
import { QueryClient, Queriable, Query } from "./QueryClient";
import * as t from "io-ts";

export class Transaction extends QueryClient implements Queriable {
    private connection: PoolClient;
    private static BEGIN_TRANSACTION = "BEGIN TRANSACTION;";
    private static COMMIT_TRANSACTION = "COMMIT;";
    private static ROLLBACK_TRANSACTION = "ROLLBACK;";

    constructor(connection: PoolClient) {
        super();
        this.connection = connection;
    }

    async begin(): Promise<Transaction> {
        await this.connection.query(Transaction.BEGIN_TRANSACTION);
        return this;
    }

    async query(sql: string): Promise<Transaction> {
        await this.connection.query(sql);
        return this;
    }

    async commit(): Promise<void> {
        await this.connection.query(Transaction.COMMIT_TRANSACTION);
        await this.connection.release();
    }

    async rollback(): Promise<void> {
        await this.connection.query(Transaction.ROLLBACK_TRANSACTION);
        await this.connection.release();
    }

    async returningOne<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A> {
        return await this.returningOneWithClient(query, type, this.connection);
    }

    async returningMaybeOne<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A | undefined> {
        return await this.returningMaybeOneWithClient(query, type, this.connection);
    }

    async returningMany<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A[]> {
        return await this.returningManyWithClient(query, type, this.connection);
    }

    async returningNone(query: Query): Promise<void> {
        return await this.returningNoneWithClient(query, this.connection);
    }
}
