/* eslint-disable @typescript-eslint/camelcase */
import { Scraper } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import axios from "axios";
import cheerio from "cheerio";
import qs from "querystringify";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import { formatPrice } from "../utils/parsing";

@injectable()
export class Amazon implements Scraper {
    private static WEBSITE = `https://www.amazon.com`;
    private logger = LoggerFactory.getLogger(module);
    private static GIFTCARD = "B01E5XD8OM";

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            const amazonId = this.parseAmazonRegistryId(url);
            console.log("amazonId", amazonId);
            const html = await this.getAmazonRegistryHTML(amazonId);
            const products = this.parseAmazonRegistryHTML(html);
            return products;
        } catch (error) {
            this.logger.error(`error fetching html`, { error });
            // todo: return an either type with an error code
            return [];
        }
    }

    private parseAmazonRegistryId = (requestUrl: string): string => {
        const prefixRegex = /\?.*/g;
        const suffixRegex = /.*\/registry\//g;

        let registryId = requestUrl;
        registryId = registryId.replace(prefixRegex, "");
        registryId = registryId.replace(suffixRegex, "");
        return registryId;
    };

    private async getAmazonRegistryHTML(registryId: string): Promise<string> {
        const registryURL = `${Amazon.WEBSITE}/wedding/get-product-grid/guestView`;
        const data = {
            registryId,
            sort: "priority",
            direction: "descending",
        };
        const productGridResponse = await axios.post(registryURL, qs.stringify(data));

        const productGridHtml = productGridResponse.data;
        return productGridHtml;
    }

    private parseAmazonRegistryHTML(registryHtml: string): RegistryItem[] {
        const $ = cheerio.load(registryHtml);
        const items: RegistryItem[] = [];

        $("div[data-wr-product-card-item]").each((_, productHTML) => {
            const item = this.formatItem(productHTML);
            if (item !== null) {
                items.push(item);
            }
        });
        return items;
    }

    private formatItem(product: CheerioElement): RegistryItem | null {
        const $ = cheerio.load(product);

        const productASIN = $("div").attr("data-wr-product-card-asin");
        if (productASIN === Amazon.GIFTCARD) {
            return null;
        }
        const title = $("div.wr-product-grid-card-title")
            .text()
            .trim() as string;
        const priceText = $("span.wr-product-grid-card-price")
            .text()
            .trim();
        const price = formatPrice(priceText);
        const img = $("img").attr("src") as string;
        const needed = Number($("div").attr("data-wr-product-card-qty-needed"));
        const purchased = Number($("div").attr("data-wr-product-card-qty-needed"));
        const url = `${Amazon.WEBSITE}/dp/${productASIN}`;

        return {
            title,
            img,
            price,
            needed,
            purchased,
            url,
            source: RegistrySource.Amazon,
        };
    }
}
