/* eslint-disable @typescript-eslint/camelcase */
import { Scraper, CHROME_USER_AGENT } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import axios from "axios";
import { RegistrySource } from "../types/registry/RegistryTypes";
import Keyv from "keyv";
import { LoggerFactory } from "../logger/LoggerFactory";

@injectable()
export class Wayfair implements Scraper {
    private GET_ITEMS_URL = "https://www.wayfair.com/a/registry/get_items";
    // cache of userId to wayfair registry id
    private registryIdCache = new Keyv<number>();
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string, userId: string): Promise<RegistryItem[]> {
        try {
            const wayfairId = await this.getWayfairRegistryId(url, userId);
            const registryItems = await this.getWayfairRegistryItems(wayfairId);
            return registryItems;
        } catch (error) {
            // todo: return an either type with an error code
            this.logger.error(`error scraping wayfair`, { error });
            return [];
        }
    }

    private async getWayfairRegistryId(url: string, userId: string): Promise<number> {
        let wayfairId = await this.registryIdCache.get(userId);

        if (wayfairId === undefined) {
            wayfairId = await this._getWayfairRegistryId(url);
            this.registryIdCache.set(userId, wayfairId);
            this.logger.info(`Wayfair cache miss!`);
        } else {
            this.logger.info(`Wayfair cache hit!`);
        }
        this.logger.info(`wayfairId:${wayfairId}`);
        return wayfairId;
    }

    private async _getWayfairRegistryId(url: string): Promise<number> {
        const res = await axios.get(url, {
            headers: {
                "User-Agent": CHROME_USER_AGENT,
                Accept: "application/json",
                "X-Remote-IP": "127.0.0.1",
            },
        });
        const registryId = res.data.registry.registry_id as number;
        return registryId;
    }

    private async getWayfairRegistryItems(id: number): Promise<RegistryItem[]> {
        const res = await axios.post(
            this.GET_ITEMS_URL,
            { registry_id: id },
            {
                headers: {
                    accept: "application/json",
                    "user-agent": CHROME_USER_AGENT,
                },
            },
        );
        const products = res.data.product_groups[0].products;
        return products.map(this.formatItem);
    }

    private formatItem(product: any): RegistryItem {
        return {
            title: product.productName,
            img: product.imageUrl,
            price: product.salePrice,
            needed: product.quantityRequested,
            purchased: product.quantityFulfilled,
            url: product.productUrl,
            source: RegistrySource.Wayfair,
        };
    }
}
