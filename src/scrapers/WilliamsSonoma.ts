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
export class WilliamsSonoma implements Scraper {
    private static IGNORABLE_RESOURCE_TYPES = ["font"];
    private static REGISTRY_SELECTOR = "div.concept-group-item-container";
    private static WAIT_FOR_SELECTOR = "div.concept-group-item-container .hero-image a img";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        const html = await this.getWilliamsSonomaRegistryHTML(url);
        const products = this.parseWilliamsSonomaRegistryHTML(html);
        return products;
    }

    private async getWilliamsSonomaRegistryHTML(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        // Improve page load times by skipping useless requests
        page.on("request", request => {
            if (WilliamsSonoma.IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(url);
        await page.waitFor(WilliamsSonoma.WAIT_FOR_SELECTOR, {
            visible: true,
            timeout: WilliamsSonoma.REGISTRY_LOAD_TIMEOUT_MS,
        });
        const registryHtml = await page.$eval(WilliamsSonoma.REGISTRY_SELECTOR, e => e.innerHTML);
        await page.close();
        await browser.close();

        return registryHtml.toString();
    }

    private parseWilliamsSonomaRegistryHTML(registryHtml: string): RegistryItem[] {
        const $ = cheerio.load(registryHtml);
        const items: RegistryItem[] = [];

        $("registry-item").each((_, productHTML) => {
            const item = this.formatItem(productHTML);
            items.push(item);
        });

        return items;
    }

    private formatItem(product: CheerioElement): RegistryItem {
        const $ = cheerio.load(product);
        const title = $(".item-name")
            .text()
            .trim() as string;
        let url = $(".item-name a").attr("href") as string;

        url = formatUrl("www.williams-sonoma.com", url);
        const priceText = $(".our-price span.price-amount span.product-price")
            .eq(1)
            .text();
        const price = formatPrice(priceText);
        const img = $(".hero-image a img").attr("src") as string;
        const quantityText = $("div.quantity-input").text();
        const purchasedText = $("div.still-needs-qty").text();
        const needed = formatQty(quantityText);
        const purchased = formatQty(purchasedText);

        return {
            title,
            img,
            price,
            needed,
            purchased,
            url,
            source: RegistrySource.WilliamsSonoma,
        };
    }
}
