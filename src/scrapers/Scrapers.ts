import { injectable } from "inversify";
import { Scraper } from "./Scraper";
import { Wayfair } from "./Wayfair";
import { BedBathAndBeyond } from "./BedBathAndBeyond";
import { RegistrySource } from "../types/registry/RegistryTypes";
import { RegistryPartner, RegistryItem } from "../types/registry/Registry";
import { Macys } from "./Macys";
import { CrateAndBarrel } from "./CrateAndBarrel";
import { Target } from "./Target";
import { Amazon } from "./Amazon";
import { WilliamsSonoma } from "./WilliamsSonoma";
import { RestorationHardware } from "./RestorationHardware";
import { Walmart } from "./Walmart";
import { LoggerFactory } from "../logger/loggerFactory";
import { validate } from "../types";
import { isLeft, Either, right, left } from "fp-ts/lib/Either";
import RegistryItemDal from "../dal/registry_item/RegistryItemDal";
import { ErrorResponse } from "../error/errorResponses";

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

    public async getAllRegistryItems(
        userId: string,
        registryId: string,
        registries: RegistryPartner[],
    ): Promise<RegistryItem[]> {
        const registryItems = await Promise.all(
            registries.map(async registry => {
                const getRegistryItemsResponse = await this.getRegistryItems(userId, registryId, registry);
                return isLeft(getRegistryItemsResponse) ? [] : getRegistryItemsResponse.right;
            }),
        );
        return registryItems.flat().filter(this.isValidRegistryItem);
    }

    public async getRegistryItems(
        userId: string,
        registryId: string,
        registry: RegistryPartner,
    ): Promise<Either<ErrorResponse, RegistryItem[]>> {
        try {
            const scraper = this.getScraperForSource(registry.source);
            const items = await scraper.scrape(registry.url, userId);
            return right(items);
        } catch (error) {
            this.logger.error(`Failed to get registry items from: ${JSON.stringify(registry)}`, { error });
            return await this.getFallbackRegistryItems(userId, registryId, registry);
        }
    }

    private async getFallbackRegistryItems(
        userId: string,
        registryId: string,
        registry: RegistryPartner,
    ): Promise<Either<ErrorResponse, RegistryItem[]>> {
        try {
            const items = await this.registryItemDal.getRegistryItems(userId, registryId, registry.source);
            if (items.length === 0) {
                const errorMsg = `No fallback registry items found for: ${JSON.stringify(registry)}`;
                this.logger.error(errorMsg);
                return left({ message: errorMsg });
            }
            return right(items);
        } catch (error) {
            const errorMsg = `Failed to get fallback registry items from: ${JSON.stringify(registry)}`;
            this.logger.error(errorMsg, { error });
            return left({ message: errorMsg });
        }
    }

    public async getRegistryItemsWithoutFallback(
        userId: string,
        registry: RegistryPartner,
    ): Promise<Either<ErrorResponse, RegistryItem[]>> {
        try {
            const scraper = this.getScraperForSource(registry.source);
            const items = await scraper.scrape(registry.url, userId);
            return right(items);
        } catch (error) {
            this.logger.error(`Failed to get registry items from: ${JSON.stringify(registry)}`, { error });
            return left({ message: `Failed to get registry items from: ${JSON.stringify(registry)}` });
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
