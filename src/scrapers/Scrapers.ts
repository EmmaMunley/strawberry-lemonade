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

@injectable()
export default class Scrapers {
    private logger = LoggerFactory.getLogger(module);
    private sourceScrapers: { [key in RegistrySource]?: Scraper };

    constructor(
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
        const registryItems = await Promise.all(registries.map(async registry => await this.getRegistryItems(userId, registry)));
        return registryItems.flat().filter(this.isValidRegistryItem);
    }

    private async getRegistryItems(userId: string, registry: Registry): Promise<RegistryItem[]> {
        const scraper = this.sourceScrapers[registry.source];
        const items = scraper?.scrape(registry.url, userId);
        return items ? items : [];
    }

    private isValidRegistryItem(item: RegistryItem): boolean {
        const result = validate(RegistryItem, item);
        if (isLeft(result)) {
            this.logger.error(`Invalid registry item: ${JSON.stringify(item)}`);
            return false;
        } else {
            return true;
        }
    }
}
