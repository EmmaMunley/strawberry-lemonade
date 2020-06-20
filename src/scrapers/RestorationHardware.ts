/* eslint-disable @typescript-eslint/camelcase */
import { Scraper } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatUrl, formatPrice, formatQty } from "../utils/parsing";

@injectable()
export class RestorationHardware implements Scraper {
    private static IGNORABLE_RESOURCE_TYPES = ["font"];
    private static REGISTRY_SELECTOR = "table";
    private static ITEM_SELECTOR = "tr.order-item-row";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        const html = await this.getRestorationHardwareRegistryHTML(url);
        const products = this.parseRestorationHardwareRegistryHTML(html);
        return products;
    }

    private async getRestorationHardwareRegistryHTML(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        // Improve page load times by skipping useless requests
        page.on("request", request => {
            if (RestorationHardware.IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(url);
        const registryHtml = await page.$eval(RestorationHardware.REGISTRY_SELECTOR, e => e.outerHTML);
        await page.close();
        await browser.close();
        return registryHtml.toString();
    }

    private parseRestorationHardwareRegistryHTML(registryHtml: string): RegistryItem[] {
        const $ = cheerio.load(registryHtml);
        const items: RegistryItem[] = [];

        $(RestorationHardware.ITEM_SELECTOR).each((_, productHTML) => {
            const item = this.formatItem(productHTML);
            items.push(item);
        });

        return items;
    }

    private formatItem(product: CheerioElement): RegistryItem {
        const $ = cheerio.load(product);
        const title = $(".order-item-name a")
            .text()
            .trim() as string;
        let url = $("a").attr("href") as string;
        url = formatUrl("www.rhmodern.com", url);
        const priceText = $(".item-price__amount")
            .text()
            .trim();
        const price = formatPrice(priceText);
        let img = $(".order-item-image a img").attr("src") as string;
        img = img.replace("//", "");
        const requestedText = $(".gift-list-item-requested").text();
        const requested = formatQty(requestedText);
        const neededText = $(".gift-list-item-needs").text();
        const needed = formatQty(neededText);
        const purchased = requested - needed;

        return {
            title,
            img,
            price,
            needed,
            purchased,
            url,
            source: RegistrySource.RestorationHardware,
        };
    }
}
