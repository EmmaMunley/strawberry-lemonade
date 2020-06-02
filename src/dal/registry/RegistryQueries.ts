import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { RegistrySource } from "../../types/registry/RegistryTypes";

@injectable()
export class RegistryQueries extends CategorizedQueries {
    private addRegistryQuery: string;
    private getRegistriesQuery: string;
    private deleteRegistryQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "registry");
        this.addRegistryQuery = this.loadSQLFile("CreateRegistry");
        this.getRegistriesQuery = this.loadSQLFile("GetRegistries");
        this.deleteRegistryQuery = this.loadSQLFile("DeleteRegistry");
    }

    public addRegistry(userId: string, url: string, source: RegistrySource): Query {
        return { query: this.addRegistryQuery, values: [userId, url, source] };
    }

    public getRegistries(userId: string): Query {
        return { query: this.getRegistriesQuery, values: [userId] };
    }

    public deleteRegistry(userId: string, source: RegistrySource): Query {
        return { query: this.deleteRegistryQuery, values: [userId, source] };
    }
}
