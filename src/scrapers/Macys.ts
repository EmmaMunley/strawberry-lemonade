/* eslint-disable @typescript-eslint/camelcase */
import { Scraper } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import axios from "axios";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatUrl, formatPrice } from "../utils/parsing";

@injectable()
export class Macys implements Scraper {
    private logger = LoggerFactory.getLogger(module);
    private static GET_ITEMS_URL = "https://www.macys.com/wgl/registry/api/registryInfo";
    private static GET_ID_REGEX = /guest\/\d+/;

    public async scrape(url: string): Promise<RegistryItem[]> {
        const macysId = this.getMacysIdFromUrl(url);
        const registryItems = await this.getMacysRegistryItems(macysId);
        return registryItems;
    }

    private getMacysIdFromUrl(url: string): string {
        const match = url.match(Macys.GET_ID_REGEX);
        if (match === null) {
            throw new Error(`Invalid Macys URL provided: ${url}`);
        }
        const macysID = match[0].replace("guest/", "");
        return macysID;
    }

    private async getMacysRegistryItems(macysId: string): Promise<RegistryItem[]> {
        const url = `${Macys.GET_ITEMS_URL}/${macysId}`;
        const res = await axios.get(url);
        const products = res.data.registry.items.item;
        return products.map((item: any, macysId: string) => this.formatItem(item, macysId));
    }

    private formatItem(product: any, macysId: string): RegistryItem {
        return {
            title: product.productDetails.productName,
            img: formatUrl("www.macys.com", product.productDetails.productImageUrl),
            price: formatPrice(product.productDetails.productSalePrice[0]),
            needed: product.qtyRequested,
            purchased: product.fulfilledQty,
            url: `https://www.macys.com/shop/registry/wedding/product?ID=${macysId}&upc_ID=${product.productId}`,
            source: RegistrySource.Macys,
        };
    }
}
