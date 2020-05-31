import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { RegistrySource } from "../../types/registry/RegistryTypes";

@injectable()
export class RegistryQueries extends CategorizedQueries {
    private addRegistryQuery: string;
    private getRegistryQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "registry");
        this.addRegistryQuery = this.loadSQLFile("CreateRegistry");
        this.getRegistryQuery = this.loadSQLFile("GetRegistry");
    }

    public addRegistry(userId: string, url: string, source: RegistrySource): Query {
        return { query: this.addRegistryQuery, values: [userId, url, source] };
    }

    public getRegistry(userId: string): Query {
        return { query: this.getRegistryQuery, values: [userId] };
    }
}
