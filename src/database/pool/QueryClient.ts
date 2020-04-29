import { isRight, isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { validate } from "../../types";
import { injectable } from "inversify";
// eslint-disable-next-line import/default
import camelcase from "camelcase";

export type Primitive = number | string | boolean | null | undefined;
export type Querier = { query: (sql: string, values: Primitive[]) => { rows: unknown[] } };
export type Query = { query: string; values: Primitive[] };

export interface Queriable {
    returningOne<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A>;

    returningMany<A, O, I>(query: Query, type: t.Type<A, O, I>): Promise<A[]>;

    returningNone(query: Query): Promise<void>;
}

@injectable()
export abstract class QueryClient {
    protected async returningOneWithClient<A, O, I>(query: Query, type: t.Type<A, O, I>, client: Querier): Promise<A> {
        const { rows } = await client.query(query.query, query.values);
        if (rows.length > 0) {
            const data = this.camelCase(rows[0]);
            const decoded = validate(type, data);
            if (isRight(decoded)) {
                return decoded.right;
            }
            throw new Error(`Failed to decode ${JSON.stringify(rows)}, recieved: ${JSON.stringify(decoded.left)}`);
        }
        throw new Error(`Expected result from query: ${JSON.stringify(query)}, recieved: ${JSON.stringify(rows)}`);
    }

    protected async returningMaybeOneWithClient<A, O, I>(query: Query, type: t.Type<A, O, I>, client: Querier): Promise<A | undefined> {
        const { rows } = await client.query(query.query, query.values);
        if (rows.length > 0) {
            const data = this.camelCase(rows[0]);
            const decoded = validate(type, data);
            if (isRight(decoded)) {
                return decoded.right;
            }
            throw new Error(`Failed to decode ${JSON.stringify(rows)}, recieved: ${JSON.stringify(decoded.left)}`);
        }
        return undefined;
    }

    protected async returningManyWithClient<A, O, I>(query: Query, type: t.Type<A, O, I>, client: Querier): Promise<A[]> {
        const { rows } = await client.query(query.query, query.values);
        if (rows.length > 0) {
            const decodedRows: t.TypeOf<typeof type>[] = [];
            for (let i = 0; i < rows.length; i++) {
                const row = this.camelCase(rows[i]);
                const decoded = validate(type, row);
                // Return first occurrence of a decoding error
                if (isLeft(decoded)) {
                    throw new Error(`Failed to decode ${JSON.stringify(rows)}, recieved: ${JSON.stringify(decoded.left)}`);
                } else {
                    decodedRows.push(decoded.right);
                }
            }
            return decodedRows;
        }
        return [];
    }

    protected async returningNoneWithClient(query: Query, client: Querier): Promise<void> {
        await client.query(query.query, query.values);
    }

    // Performs shallow camelCasing -- used for converting between psql snake_cased columns and the camelCased keys used within the app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private camelCase(data: any): any {
        if (typeof data === "object") {
            const result: Record<string, unknown> = {};
            Object.entries(data).forEach(([key, value]) => (result[camelcase(key)] = value));
            return result;
        }
        return data;
    }
}
