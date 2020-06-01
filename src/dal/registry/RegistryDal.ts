import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryQueries } from "./RegistryQueries";
import { RegistrySource } from "../../types/registry/RegistryTypes";
import { RegistryUrl } from "../../types/registry/Registry";

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

    async getRegistry(userId: string): Promise<RegistryUrl | undefined> {
        const query = this.queries.getRegistry(userId);
        return await this.pool.returningMaybeOne(query, RegistryUrl);
    }

    async deleteRegistry(userId: string, source: RegistrySource): Promise<void> {
        const query = this.queries.deleteRegistry(userId, source);
        await this.pool.returningNone(query);
    }
}
