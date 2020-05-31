/* eslint-disable @typescript-eslint/camelcase */
import { Scraper, CHROME_USER_AGENT } from "./Scraper";
import { RegistryItem } from "../types/registry/Registry";
import { injectable } from "inversify";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import axios from "axios";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { LoggerFactory } from "../logger/LoggerFactory";
import fs from "fs";

@injectable()
export class Wayfair implements Scraper {
    private static IGNORABLE_RESOURCE_TYPES = ["font", "image"];
    // private static REGISTRY_SELECTOR = "body";
    private static REGISTRY_SELECTOR = ".WedRegistryProductCollection-productGroup";
    private static REGISTRY_LOAD_TIMEOUT_MS = 5000;
    private logger = LoggerFactory.getLogger(module);

    public async scrape(url: string): Promise<RegistryItem[]> {
        try {
            const html = await this.getWayfairRegistryHTML(url);
            this.logger.info(`html: ${html}`);
            fs.writeFileSync("./wayfair.html", html, "utf8");

            return [];
        } catch (error) {
            this.logger.error(`error fetching html`, { error });
            // todo: return an either type with an error code
            return [];
        }
    }

    private async getWayfairRegistryHTML(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        // Improve page load times by skipping useless requests
        page.on("request", request => {
            if (Wayfair.IGNORABLE_RESOURCE_TYPES.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.goto(url);
        await page.waitFor(Wayfair.REGISTRY_SELECTOR, { visible: true, timeout: Wayfair.REGISTRY_LOAD_TIMEOUT_MS });

        const registryHtml = await page.$eval(Wayfair.REGISTRY_SELECTOR, e => e.innerHTML);
        return registryHtml;

        <div data-enzyme-id="RG_PRODUCT_CARD_TEST_ID" role="button" tabindex="0" class="ProductCard" data-sku="W002898676">
    }
}
