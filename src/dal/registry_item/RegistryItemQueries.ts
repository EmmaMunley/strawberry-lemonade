import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { RegistryItem } from "../../types/registry/Registry";
import { RegistrySource } from "../../types/registry/RegistryTypes";

@injectable()
export class RegistryItemQueries extends CategorizedQueries {
    // Number of columns in a registry_item row
    private static NUM_COLS_IN_REGISTRY_ITEM = 8;
    private getRegistryItemsQuery: string;
    private deleteRegistryItemsQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "registry_item");
        this.getRegistryItemsQuery = this.loadSQLFile("GetRegistryItems");
        this.deleteRegistryItemsQuery = this.loadSQLFile("DeleteRegistryItems");
    }

    public getRegistryItems(userId: string, registryId: string, source: RegistrySource): Query {
        return { query: this.getRegistryItemsQuery, values: [userId, registryId, source] };
    }

    public addRegistryItems(userId: string, registryId: string, items: RegistryItem[]): Query {
        const valueString = this.getValueString(RegistryItemQueries.NUM_COLS_IN_REGISTRY_ITEM, items.length);
        const query =
            `INSERT INTO registry_item (user_id, registry_id, title, price, needed, purchased, img, url, source) ` +
            `VALUES ${valueString};`;
        const values = this.flattenRegistryItems(userId, registryId, items);
        return { query, values };
    }

    public deleteRegistryItems(userId: string, registryId: string): Query {
        return { query: this.deleteRegistryItemsQuery, values: [userId, registryId] };
    }

    private flattenRegistryItems(userId: string, registryId: string, items: RegistryItem[]): (string | number)[] {
        // Lift an array of items into an array of values -- order of elements must match query column order
        return items.flatMap(item => [
            userId,
            registryId,
            item.title,
            item.price,
            item.needed,
            item.purchased,
            item.img,
            item.url,
            item.source,
        ]);
    }
}
