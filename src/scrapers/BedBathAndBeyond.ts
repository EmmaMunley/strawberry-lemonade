/* eslint-disable @typescript-eslint/camelcase */
import { Scraper, IGNORABLE_RESOURCE_TYPES } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatUrl, formatPrice } from "../utils/parsing";

@injectable()
export class BedBathAndBeyond implements Scraper {
    private static REGISTRY_SELECTOR = "div.pb25";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        const html = await this.getBedBathAndBeyondRegistryHTML(url);
        const products = this.parseBedBathAndBeyondRegistryHTML(html);
        return products;
    }

    private async getBedBathAndBeyondRegistryHTML(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        // Improve page load times by skipping useless requests
        page.on("request", request => {
            if (IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(url);
        await page.waitFor(BedBathAndBeyond.REGISTRY_SELECTOR, {
            visible: true,
            timeout: BedBathAndBeyond.REGISTRY_LOAD_TIMEOUT_MS,
        });

        const registryHtml = await page.$eval(BedBathAndBeyond.REGISTRY_SELECTOR, e => e.innerHTML);
        await page.close();
        await browser.close();

        return registryHtml.toString();
    }

    private parseBedBathAndBeyondRegistryHTML(registryHtml: string): RegistryItem[] {
        const $ = cheerio.load(registryHtml);
        const items: RegistryItem[] = [];

        $("div[data-sku]").each((_, productHTML) => {
            const item = this.formatItem(productHTML);
            items.push(item);
        });

        return items;
    }

    private formatItem(product: CheerioElement): RegistryItem {
        const $ = cheerio.load(product);
        const title = $("header a").text() as string;
        let url = $("header a").attr("href") as string;

        url = formatUrl("www.bedbathandbeyond.com", url);
        const priceText = $("[class^=Price]")
            .children()
            .first()
            .text();
        const price = formatPrice(priceText);
        const img = $("img").attr("src") as string;
        const quantityText = $("div.pb2 span[class^='ProductGridTile']").text();
        const neededIdx = quantityText.indexOf("Requested:") + "Requested:".length + 1;
        const purchasedIdx = quantityText.indexOf("Purchased:") + "Purchased:".length + 1;
        const needed = Number(quantityText[neededIdx]);
        const purchased = Number(quantityText[purchasedIdx]);

        return {
            title,
            img,
            price,
            needed,
            purchased,
            url,
            source: RegistrySource.BedBathAndBeyond,
        };
    }
}
