import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { CreateRegistry } from "../../types/registry/Registry";

@injectable()
export class RegistryQueries extends CategorizedQueries {
    private createRegistryQuery: string;
    private getRegistryQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "registry");
        this.createRegistryQuery = this.loadSQLFile("CreateRegistry");
        this.getRegistryQuery = this.loadSQLFile("GetRegistry");
    }

    public createRegistry(userId: string, registry: CreateRegistry): Query {
        return {
            query: this.createRegistryQuery,
            values: [
                userId,
                registry.user.firstName,
                registry.user.lastName,
                registry.fiance.firstName,
                registry.fiance.lastName,
                registry.wedding.date,
                registry.wedding.size,
            ],
        };
    }

    // We don't require a registryId here because we assume there will be exactly one registryId for
    // a given userId at this point in time. If more than one registry-type is supported in the future,
    // a registryId will have to be included in this get request for it to return accurate results
    public getRegistry(userId: string): Query {
        return {
            query: this.getRegistryQuery,
            values: [userId],
        };
    }
}
