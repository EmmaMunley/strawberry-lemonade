import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryPartnerQueries } from "./RegistryPartnerQueries";
import { RegistrySource } from "../../types/registry/RegistryTypes";
import { RegistryPartner } from "../../types/registry/Registry";
import { Queriable } from "../../database/pool/QueryClient";

@injectable()
export default class RegistryPartnerDal {
    private pool: Pool;
    private queries: RegistryPartnerQueries;

    constructor(queries: RegistryPartnerQueries, pool: Pool) {
        this.queries = queries;
        this.pool = pool;
    }

    async addRegistryPartners(userId: string, registryId: string, registryPartners: RegistryPartner[]): Promise<void> {
        await this.addRegistryPartnersWithClient(userId, registryId, registryPartners, this.pool);
    }

    async addRegistryPartnersWithClient(
        userId: string,
        registryId: string,
        registryPartners: RegistryPartner[],
        client: Queriable,
    ): Promise<void> {
        if (registryPartners.length === 0) {
            return;
        }
        const query = this.queries.addRegistryPartners(userId, registryId, registryPartners);
        return await client.returningNone(query);
    }

    async addRegistryPartner(userId: string, registryId: string, url: string, source: RegistrySource): Promise<void> {
        const query = this.queries.addRegistryPartner(userId, registryId, url, source);
        await this.pool.returningNone(query);
    }

    async getRegistryPartners(userId: string, registryId: string): Promise<RegistryPartner[]> {
        return this.getRegistryPartnersWithClient(userId, registryId, this.pool);
    }

    async getRegistryPartnersWithClient(
        userId: string,
        registryId: string,
        client: Queriable,
    ): Promise<RegistryPartner[]> {
        const query = this.queries.getRegistryPartners(userId, registryId);
        return await client.returningMany(query, RegistryPartner);
    }

    async deleteRegistryPartner(userId: string, registryId: string, source: RegistrySource): Promise<void> {
        const query = this.queries.deleteRegistryPartner(userId, registryId, source);
        await this.pool.returningNone(query);
    }
}
