import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryItemQueries } from "./RegistryItemQueries";
import { RegistryItem } from "../../types/registry/Registry";
import { RegistrySource } from "../../types/registry/RegistryTypes";

@injectable()
export default class RegistryItemDal {
    private pool: Pool;
    private queries: RegistryItemQueries;

    constructor(queries: RegistryItemQueries, pool: Pool) {
        this.queries = queries;
        this.pool = pool;
    }

    async getRegistryItems(userId: string, source: RegistrySource): Promise<RegistryItem[]> {
        const query = this.queries.getRegistryItems(userId, source);
        return await this.pool.returningMany(query, RegistryItem);
    }

    async updateRegistryItems(userId: string, items: RegistryItem[]): Promise<void> {
        const transaction = await this.pool.transaction();
        await transaction.begin();
        try {
            const deleteItemsQuery = this.queries.deleteRegistryItems(userId);
            const addItemsQuery = this.queries.addRegistryItems(userId, items);
            await transaction.returningNone(deleteItemsQuery);
            await transaction.returningNone(addItemsQuery);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
