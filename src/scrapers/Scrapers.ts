import { injectable } from "inversify";
import { Scraper } from "./Scraper";
import { Wayfair } from "./Wayfair";
import { BedBathAndBeyond } from "./BedBathAndBeyond";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { Registry, RegistryItem } from "../types/registry/Registry";
import { Macys } from "./Macys";
import { CrateAndBarrel } from "./CrateAndBarrel";
import { Target } from "./Target";
import { Amazon } from "./Amazon";
import { WilliamsSonoma } from "./WilliamsSonoma";
import { RestorationHardware } from "./RestorationHardware";
import { Walmart } from "./Walmart";
import { LoggerFactory } from "../logger/loggerFactory";
import { validate } from "../types";
import { isLeft } from "fp-ts/lib/Either";
import RegistryItemDal from "../dal/registry_item/RegistryItemDal";

@injectable()
export default class Scrapers {
    private logger = LoggerFactory.getLogger(module);
    private sourceScrapers: { [key in RegistrySource]?: Scraper };
    private registryItemDal: RegistryItemDal;

    constructor(
        registryItemDal: RegistryItemDal,
        wayfairScraper: Wayfair,
        bedBathAndBeyondScraper: BedBathAndBeyond,
        targetScaper: Target,
        macysScraper: Macys,
        crateAndBarrelScraper: CrateAndBarrel,
        amazonScraper: Amazon,
        williamsSonomaScraper: WilliamsSonoma,
        restorationHardwareScraper: RestorationHardware,
        walmartScraper: Walmart,
    ) {
        this.registryItemDal = registryItemDal;
        this.sourceScrapers = {
            [RegistrySource.Wayfair]: wayfairScraper,
            [RegistrySource.BedBathAndBeyond]: bedBathAndBeyondScraper,
            [RegistrySource.Macys]: macysScraper,
            [RegistrySource.CrateAndBarrel]: crateAndBarrelScraper,
            [RegistrySource.Amazon]: amazonScraper,
            [RegistrySource.Target]: targetScaper,
            [RegistrySource.WilliamsSonoma]: williamsSonomaScraper,
            [RegistrySource.RestorationHardware]: restorationHardwareScraper,
            [RegistrySource.Walmart]: walmartScraper,
        };
    }

    public async getAllRegistryItems(userId: string, registries: Registry[]): Promise<RegistryItem[]> {
        const registryItems = await Promise.all(
            registries.map(async registry => await this.getRegistryItems(userId, registry)),
        );
        return registryItems.flat().filter(this.isValidRegistryItem);
    }

    private async getRegistryItems(userId: string, registry: Registry): Promise<RegistryItem[]> {
        try {
            const scraper = this.getScraperForSource(registry.source);
            const items = await scraper.scrape(registry.url, userId);
            return items;
        } catch (error) {
            this.logger.error(`Failed to get registry items from: ${JSON.stringify(registry)}`, { error });
            return this.getFallbackRegistryItems(userId, registry);
        }
    }

    private async getFallbackRegistryItems(userId: string, registry: Registry): Promise<RegistryItem[]> {
        try {
            const items = this.registryItemDal.getRegistryItems(userId, registry.source);
            return items;
        } catch (error) {
            this.logger.error(`Failed to get fallback registry items from: ${JSON.stringify(registry)}`, { error });
            return [];
        }
    }

    private getScraperForSource(source: RegistrySource): Scraper {
        const scraper = this.sourceScrapers[source];
        if (!scraper) {
            throw new Error(`No scraper exists for source ${source}`);
        }
        return scraper;
    }

    private isValidRegistryItem = (item: RegistryItem): boolean => {
        const result = validate(RegistryItem, item);
        if (isLeft(result)) {
            this.logger.error(`Invalid registry item: ${JSON.stringify(item)}`);
            return false;
        } else {
            return true;
        }
    };
}
