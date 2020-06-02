import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryQueries } from "./RegistryQueries";
import { RegistrySource } from "../../types/registry/RegistryTypes";
import { Registry } from "../../types/registry/Registry";

@injectable()
export default class RegistryDal {
    private pool: Pool;
    private queries: RegistryQueries;

    constructor(queries: RegistryQueries, pool: Pool) {
        this.queries = queries;
        this.pool = pool;
    }

    async addRegistry(userId: string, url: string, source: RegistrySource): Promise<void> {
        const query = this.queries.addRegistry(userId, url, source);
        await this.pool.returningNone(query);
    }

    async getRegistries(userId: string): Promise<Registry[]> {
        const query = this.queries.getRegistries(userId);
        return await this.pool.returningMany(query, Registry);
    }

    async deleteRegistry(userId: string, source: RegistrySource): Promise<void> {
        const query = this.queries.deleteRegistry(userId, source);
        await this.pool.returningNone(query);
    }
}
