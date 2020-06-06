/* eslint-disable @typescript-eslint/camelcase */
import { Scraper, CHROME_USER_AGENT, IGNORABLE_RESOURCE_TYPES } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import axios from "axios";

@injectable()
export class Target implements Scraper {
    private static GET_ITEMS_URL = "https://api.target.com/registry_items_availabilities/v2/giftgivers/";
    private static WEBSITE = "https://www.target.com/";
    private static ASSETS_PREFIX_URL = "https://assets.targetimg1.com/ui/";
    private static ASSETS_SUFFIXES = ["home", "client", "content", "vendor"];
    private static STORE_ID = 3990;
    private apiKey?: string;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            if (!this.apiKey) {
                await this.refreshApiKey();
            }
            const targetId = this.parseTargetRegistryId(url);
            const registryItems = await this.getTargetRegistryItems(targetId);
            return registryItems;
        } catch (error) {
            // todo: return an either type with an error code
            this.logger.error(`error scraping Target`, { error });
            return [];
        }
    }

    private parseTargetRegistryId = (requestUrl: string): string => {
        const prefixRegex = /.*[\?\&]registryId=/g;
        const suffixRegex = /[\?\&].*/g;

        let registryId = requestUrl;
        registryId = registryId.replace(prefixRegex, "");
        registryId = registryId.replace(suffixRegex, "");
        return registryId;
    };

    private parseUrlForApiKey = (requestUrl: string): string => {
        const prefixRegex = /.*[\?\&]key=/g;
        const suffixRegex = /[\?\&].*/g;

        let key = requestUrl;
        key = key.replace(prefixRegex, "");
        key = key.replace(suffixRegex, "");
        return key;
    };

    private refreshApiKey = async (): Promise<void> => {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");
        await page.setRequestInterception(true);
        page.on("request", request => {
            const requestUrl = request.url();
            if (this.containsApiKey(requestUrl)) {
                const apiKey = this.parseUrlForApiKey(requestUrl);
                this.setApiKey(apiKey);
            }
            if (IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        // networkidle0 - wait until no network traffic for 500ms
        await page.goto(Target.WEBSITE, { waitUntil: "networkidle0" });
        await page.close();
        await browser.close();
    };

    private containsApiKey = (requestUrl: string): boolean => {
        return requestUrl.includes("&key=") || requestUrl.includes("?key=");
    };

    private isAllowedNetworkRequest = (requestUrl: string): boolean => {
        if (!requestUrl) {
            return false;
        }
        // Allow base website
        if (requestUrl === Target.WEBSITE) {
            return true;
        }
        return Target.ASSETS_SUFFIXES.some(suffix => requestUrl.startsWith(Target.ASSETS_PREFIX_URL + suffix));
    };

    private setApiKey = (apiKey: string): void => {
        this.apiKey = apiKey;
    };

    private async getTargetRegistryItems(id: string): Promise<RegistryItem[]> {
        const apiKey = this.apiKey;
        if (!apiKey) {
            throw new Error(`API Key is not set, value: ${apiKey}`);
        }
        const requestUrl = `${Target.GET_ITEMS_URL}${id}/${Target.STORE_ID}?channel_name=web&key=${apiKey}`;
        const res = await axios.get(requestUrl, {
            headers: {
                accept: "application/json",
                "user-agent": CHROME_USER_AGENT,
            },
        });
        const products = res.data.registries.items;
        return products.map(this.formatItem);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private formatItem(product: any): RegistryItem {
        return {
            title: product.title,
            img: product.images.primaryUri,
            price: product.price.current_retail,
            needed: product.requested_quantity,
            purchased: product.purchased_quantity,
            url: product.target_dot_com_uri,
            source: RegistrySource.Target,
        };
    }
}
