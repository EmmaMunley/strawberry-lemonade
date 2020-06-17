import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryItemQueries } from "./RegistryItemQueries";
import { RegistryItem } from "../../types/registry/Registry";

@injectable()
export default class RegistryItemDal {
    private pool: Pool;
    private queries: RegistryItemQueries;

    constructor(queries: RegistryItemQueries, pool: Pool) {
        this.queries = queries;
        this.pool = pool;
    }

    async getRegistryItems(userId: string): Promise<RegistryItem[]> {
        const query = this.queries.getRegistryItems(userId);
        return await this.pool.returningMany(query, RegistryItem);
    }

    async addRegistryItems(userId: string, items: RegistryItem[]): Promise<void> {
        const query = this.queries.addRegistryItems(userId, items);
        await this.pool.returningNone(query);
    }

    async deleteRegistryItems(userId: string): Promise<void> {
        const query = this.queries.deleteRegistryItems(userId);
        await this.pool.returningNone(query);
    }
}
