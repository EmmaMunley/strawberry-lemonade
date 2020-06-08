/* eslint-disable @typescript-eslint/camelcase */
import { Scraper } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatUrl } from "../utils/parsing";

@injectable()
export class Crate implements Scraper {
    private static IGNORABLE_RESOURCE_TYPES = ["font", "image"];
    private static REGISTRY_SELECTOR = ".tab-panel-container";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            const html = await this.getCrateRegistryHTML(url);
            const products = this.getProducts(html);
            return products;
        } catch (error) {
            this.logger.error(`error fetching html`, { error });
            // todo: return an either type with an error code
            return [];
        }
    }

    private getProducts(doc: string): RegistryItem[] {
        const script = this.getScriptTag(doc);
        const registryData = this.getRegistryData(script);
        const registryItems = this.getRegistryItems(registryData);
        return registryItems;
    }

    private async getCrateRegistryHTML(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        // Improve page load times by skipping useless requests
        page.on("request", request => {
            if (Crate.IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(url);
        await page.waitFor(Crate.REGISTRY_SELECTOR, { visible: true, timeout: Crate.REGISTRY_LOAD_TIMEOUT_MS });
        const doc = (await page.evaluate("new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML")) as string;
        await page.close();
        await browser.close();
        return doc;
    }

    private getScriptTag(doc: string): string {
        const matches = doc.match(/<!-- Begin Client Side Data-->.*<!-- End Client Side Data-->/s);
        if (!matches || !matches.length) {
            throw new Error("Error parsing C&B script tag");
        }
        return matches[0];
    }

    private getRegistryData(script: string): string {
        const matches = script.match(/"Items": \[\n.+\],\n/gs);
        if (!matches || !matches.length) {
            throw new Error("Error parsing C&B registry items");
        }
        return matches[0];
    }

    private getRegistryItems(data: string): RegistryItem[] {
        const registry = data.slice(9, data.length - 2);
        const registryItems = JSON.parse(registry);
        return registryItems.map(this.formatItem);
    }

    private formatItem(product: any): RegistryItem {
        return {
            title: product.Title,
            img: product.ImageUrl,
            price: product.Price.CurrentAsDecimal,
            needed: product.WantsQuantity,
            purchased: product.HasQuantity,
            url: formatUrl("www.crateandbarrel.com", product.NavigateUrl),
            source: RegistrySource.Crate,
        };
    }
}
