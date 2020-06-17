import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";
import { RegistryItem } from "../../types/registry/Registry";

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

    public getRegistryItems(userId: string): Query {
        return { query: this.getRegistryItemsQuery, values: [userId] };
    }

    public addRegistryItems(userId: string, items: RegistryItem[]): Query {
        const valueString = this.getValueString(RegistryItemQueries.NUM_COLS_IN_REGISTRY_ITEM, items.length);
        const query =
            `INSERT INTO registry_item (user_id, title, price, needed, purchased, img, url, source) ` +
            `VALUES ${valueString};`;
        const values = this.flattenRegistryItems(userId, items);
        return { query, values };
    }

    public deleteRegistryItems(userId: string): Query {
        return { query: this.deleteRegistryItemsQuery, values: [userId] };
    }

    private flattenRegistryItems(userId: string, items: RegistryItem[]): (string | number)[] {
        // Lift an array of items into an array of values -- order of elements must match query column order
        return items.flatMap(item => [
            userId,
            item.title,
            item.price,
            item.needed,
            item.purchased,
            item.img,
            item.url,
            item.source,
        ]);
    }

    private getValueString(numCols: number, numRows: number): string {
        const values = [];
        for (let i = 0; i <= numCols; i++) {
            // Single row
            const rowVals = [];
            for (let j = 0; j <= numRows; j++) {
                rowVals.push(`$${i * j + 1}`);
            }
            const row = rowVals.join(", ");
            values.push(row);
        }
        return values.join(",");
    }
}
