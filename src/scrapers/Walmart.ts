/* eslint-disable @typescript-eslint/camelcase */
import { Scraper, CHROME_USER_AGENT } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import axios from "axios";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";

@injectable()
export class Walmart implements Scraper {
    private logger = LoggerFactory.getLogger(module);
    private static GET_ITEMS_URL = "https://www.walmart.com/api/lists";
    private static GET_ID_REGEX = /id\=[\w\-]+/;

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            const walmartId = this.getWalmartIdFromUrl(url);
            const registryItems = await this.getWalmartRegistryItems(walmartId);
            return registryItems;
        } catch (error) {
            // todo: return an either type with an error code
            this.logger.error(`error scraping Walmart`, { error });
            return [];
        }
    }

    private getWalmartIdFromUrl(url: string): string {
        const match = url.match(Walmart.GET_ID_REGEX);

        if (match === null) {
            throw new Error(`Invalid Walmart URL provided: ${url}`);
        }
        const walmartId = match[0].replace("id=", "");
        return walmartId;
    }

    private async getWalmartRegistryItems(walmartId: string): Promise<RegistryItem[]> {
        const url = `${Walmart.GET_ITEMS_URL}/${walmartId}?cid:CID=&pass=SUBSCRIBED&response_groups=LIST.DETAILS&listType=WR`;
        const res = await axios.get(url, {
            headers: {
                accept: "application/json",
                "user-agent": CHROME_USER_AGENT,
            },
        });
        const products = res.data.items;
        return products.map(this.formatItem);
    }

    private formatItem(product: any): RegistryItem {
        return {
            title: product.name,
            img: product.assetUrl,
            price: product.price.current,
            needed: product.quantity.requested,
            purchased: product.quantity.received,
            url: `https://www.walmart.com/ip/${product.productId}`,
            source: RegistrySource.Walmart,
        };
    }
}
