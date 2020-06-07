/* eslint-disable @typescript-eslint/camelcase */
import { Scraper } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatUrl } from "../utils/parsing";

@injectable()
export class Crate implements Scraper {
    private static IGNORABLE_RESOURCE_TYPES = ["font", "image"];
    // private static REGISTRY_SELECTOR = "body";
    private static REGISTRY_SELECTOR = ".tab-panel-container";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            const html = await this.getCrateRegistryHTML(url);
            const products = this.parseCrateRegistryHTML(html);
            return products;
        } catch (error) {
            this.logger.error(`error fetching html`, { error });
            // todo: return an either type with an error code
            return [];
        }
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

        const registryHtml = await page.$eval(Crate.REGISTRY_SELECTOR, e => e.innerHTML);
        await page.close();
        await browser.close();

        return registryHtml.toString();
    }

    private parseCrateRegistryHTML(registryHtml: string): RegistryItem[] {
        const $ = cheerio.load(registryHtml);
        const items: RegistryItem[] = [];

        $(".list-item-container").each((_, productHTML) => {
            const item = this.formatItem(productHTML);
            items.push(item);
        });

        return items;
    }

    private formatItem(product: CheerioElement): RegistryItem {
        const $ = cheerio.load(product);

        console.log("test", $);
        const title = $(".list-item-title")
            .text()
            .trim() as string;
        let url = "www.crateandbeyond.com"; // todo get real url

        url = formatUrl("www.crateandbeyond.com", url);
        const priceText = $(".list-item-price")
            .text()
            .trim();
        const price = Number(priceText.replace("$", ""));
        const img = $("img").attr("src") as string;
        const neededText = $("div.wants-has-container span.item-wants")
            .text()
            .trim();
        const needed = Number(neededText.replace(/\D/g, ""));
        const purchasedText = $("span.item-has")
            .text()
            .trim();
        const purchased = Number(purchasedText.replace(/\D/g, ""));
        return {
            title,
            img,
            price,
            needed,
            purchased,
            url,
            source: RegistrySource.Crate,
        };
    }
}
