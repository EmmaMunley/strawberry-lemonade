import { Pool } from "../../database/pool/Pool";
import { injectable } from "inversify";
import { RegistryQueries } from "./RegistryQueries";
import RegistryPartnerDal from "../registry_partner/RegistryPartnerDal";
import {
    InternalRegistry,
    RegistryItemsResponse,
    CreateRegistry,
    RegistryResponse,
    RegistryPartner,
} from "../../types/registry/Registry";
import Scrapers from "../../scrapers/Scrapers";
import { isLeft } from "fp-ts/lib/Either";
import { Queriable } from "../../database/pool/QueryClient";

@injectable()
export default class RegistryDal {
    private pool: Pool;
    private queries: RegistryQueries;
    private registryPartnerDal: RegistryPartnerDal;
    private scrapers: Scrapers;

    constructor(queries: RegistryQueries, pool: Pool, registryPartnerDal: RegistryPartnerDal, scrapers: Scrapers) {
        this.queries = queries;
        this.pool = pool;
        this.registryPartnerDal = registryPartnerDal;
        this.scrapers = scrapers;
    }

    async createRegistry(userId: string, createRegistryRequest: CreateRegistry): Promise<RegistryResponse> {
        const transaction = await this.pool.transaction();
        transaction.begin();
        try {
            // Insert registry
            const query = this.queries.createRegistry(userId, createRegistryRequest);
            const registryDetails = await transaction.returningOne(query, InternalRegistry);

            // Insert registry partners
            await this.registryPartnerDal.addRegistryPartnersWithClient(
                userId,
                registryDetails.id,
                createRegistryRequest.registries,
                transaction,
            );

            // Fetch and format registry data to return to front-end
            const registryItems = await this.getRegistryItemsFromSourceUrl(
                userId,
                registryDetails.id,
                transaction,
                createRegistryRequest.registries,
            );
            const registry = this.formatRegistry(registryDetails, registryItems);

            transaction.commit();
            return registry;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // We don't require a registryId here because we assume there will be exactly one registryId for
    // a given userId at this point in time. If more than one registry-type is supported in the future,
    // a registryId will have to be included in this get request for it to return accurate results
    async getRegistry(userId: string): Promise<RegistryResponse | undefined> {
        const query = this.queries.getRegistry(userId);
        const registryDetails = await this.pool.returningMaybeOne(query, InternalRegistry);
        if (registryDetails === undefined) {
            return undefined;
        }
        const registryItems = await this.getRegistryItemsFromSourceUrl(userId, registryDetails.id);
        return this.formatRegistry(registryDetails, registryItems);
    }

    private formatRegistry(
        registryDetails: InternalRegistry,
        registryItemResponses: RegistryItemsResponse[],
    ): RegistryResponse {
        return {
            registryId: registryDetails.id,
            user: {
                firstName: registryDetails.firstName,
                lastName: registryDetails.lastName,
            },
            fiance: {
                firstName: registryDetails.fianceFirstName,
                lastName: registryDetails.fianceLastName,
            },
            wedding: {
                date: registryDetails.eventDate,
                size: registryDetails.eventSize,
            },
            registries: registryItemResponses,
        };
    }

    // Beware
    private async getRegistryItemsFromSourceUrl(
        userId: string,
        registryId: string,
        _client?: Queriable,
        _registryPartners?: RegistryPartner[],
    ): Promise<RegistryItemsResponse[]> {
        const client = _client ?? this.pool;
        const registryPartners =
            _registryPartners ??
            (await this.registryPartnerDal.getRegistryPartnersWithClient(userId, registryId, client));

        const registrySourceUrlItems = await Promise.all(
            registryPartners.map(async sourceUrl => {
                const response = await this.scrapers.getRegistryItems(userId, registryId, sourceUrl);
                if (isLeft(response)) {
                    const failureResponse = {
                        ...sourceUrl,
                        error: true,
                        items: [],
                    };
                    return failureResponse;
                }

                const successResponse = {
                    ...sourceUrl,
                    error: false,
                    items: response.right,
                };
                return successResponse;
            }),
        );
        return registrySourceUrlItems;
    }
}
