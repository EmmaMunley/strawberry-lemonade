import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { RegistrySource } from "../../types/registry/RegistryTypes";
import { RegistryPartner } from "../../types/registry/Registry";

@injectable()
export class RegistryPartnerQueries extends CategorizedQueries {
    private static NUM_COLS_IN_REGISTRY_PARTNER = 4;
    private addRegistryPartnerQuery: string;
    private getRegistryPartnersQuery: string;
    private deleteRegistryPartnerQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "registry_partner");
        this.addRegistryPartnerQuery = this.loadSQLFile("CreateRegistryPartner");
        this.getRegistryPartnersQuery = this.loadSQLFile("GetRegistryPartner");
        this.deleteRegistryPartnerQuery = this.loadSQLFile("DeleteRegistryPartner");
    }

    public addRegistryPartner(userId: string, registryId: string, url: string, source: RegistrySource): Query {
        return { query: this.addRegistryPartnerQuery, values: [userId, registryId, source, url] };
    }

    public getRegistryPartners(userId: string, registryId: string): Query {
        return { query: this.getRegistryPartnersQuery, values: [userId, registryId] };
    }

    public deleteRegistryPartner(userId: string, registryId: string, source: RegistrySource): Query {
        return { query: this.deleteRegistryPartnerQuery, values: [userId, registryId, source] };
    }

    public addRegistryPartners(userId: string, registryId: string, registryPartners: RegistryPartner[]): Query {
        const valueString = this.getValueString(
            RegistryPartnerQueries.NUM_COLS_IN_REGISTRY_PARTNER,
            registryPartners.length,
        );
        const query = `INSERT INTO registry_partner(user_id, registry_id, source, url) ` + `VALUES ${valueString};`;
        const values = registryPartners.flatMap(registryPartner => [
            userId,
            registryId,
            registryPartner.source,
            registryPartner.url,
        ]);
        return { query, values };
    }
}
