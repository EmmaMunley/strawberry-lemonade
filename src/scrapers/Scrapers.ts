import { injectable } from "inversify";
import { Scraper } from "./Scraper";
import { Wayfair } from "./Wayfair";
import { BedBath } from "./BedBath";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { Registry, RegistryItem } from "../types/registry/Registry";
import { Macys } from "./Macys";
import { Crate } from "./Crate";
import { Target } from "./Target";

@injectable()
export default class Scrapers {
    private sourceScrapers: { [key in RegistrySource]?: Scraper };

    constructor(wayfairScraper: Wayfair, bedBathScraper: BedBath, targetScaper: Target, macysScraper: Macys, crateScraper: Crate) {
        this.sourceScrapers = {
            [RegistrySource.Wayfair]: wayfairScraper,
            [RegistrySource.BedBath]: bedBathScraper,
            [RegistrySource.Macys]: macysScraper,
            [RegistrySource.Crate]: crateScraper,
            // todo: replace with real scrapers
            [RegistrySource.Amazon]: wayfairScraper,
            [RegistrySource.Target]: targetScaper,
        };
    }

    public async getAllRegistryItems(userId: string, registries: Registry[]): Promise<RegistryItem[]> {
        const registryItems = await Promise.all(registries.map(async registry => await this.getRegistryItems(userId, registry)));
        return registryItems.flat();
    }

    private getRegistryItems(userId: string, registry: Registry): Promise<RegistryItem[]> {
        const scraper = this.sourceScrapers[registry.source];
        return scraper!.scrape(registry.url, userId);
    }
}
