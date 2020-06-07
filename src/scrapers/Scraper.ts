import { RegistryItem } from "../types/registry/Registry";

export interface Scraper {
    scrape(url: string, userId: string): Promise<RegistryItem[]>;
}

export const IGNORABLE_RESOURCE_TYPES = ["font", "image"];

export const CHROME_USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
// "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36";
