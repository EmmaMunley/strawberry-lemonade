import * as t from "io-ts";
import ErrorCodes from "../../error/errorCodes";
import url from "url";

export enum RegistrySource {
    Wayfair = "Wayfair",
    Amazon = "Amazon",
    Target = "Target",
    BedBathAndBeyond = "BedBathAndBeyond",
    Macys = "Macys",
    CrateAndBarrel = "CrateAndBarrel",
    WilliamsSonoma = "WilliamsSonoma",
    RestorationHardware = "RestorationHardware",
    Walmart = "Walmart",
}

// to do: clean up registry source typing
const RegistryHostNames = new Set([
    "www.wayfair.com",
    "www.target.com",
    "www.amazon.com",
    "www.bedbathandbeyond.com",
    "www.macys.com",
    "www.crateandbarrel.com",
    "www.williams-sonoma.com",
    "www.rhmodern.com",
    "www.walmart.com",
]);

const isValidRegistryUrl = (registryUrl: string): boolean => {
    try {
        const hostname = url.parse(registryUrl, true).hostname;
        return hostname !== null && RegistryHostNames.has(hostname);
    } catch (error) {
        return false;
    }
};

export const RegistryUrlInternal = new t.Type<string, string, unknown>(
    "RegistryUrl",
    (registryUrl): registryUrl is string => typeof registryUrl === "string",
    (registryUrl, context) =>
        typeof registryUrl === "string" && isValidRegistryUrl(registryUrl)
            ? t.success(registryUrl)
            : t.failure(registryUrl, context, ErrorCodes.invalidRegistryUrl),
    t.identity,
);

const isValidRegistrySource = (registrySource: string): boolean => {
    // todo(emmamunley) find a way to gaurantee enums are strings
    const sources = Object.values(RegistrySource) as string[];
    return sources.includes(registrySource);
};

export const RegistrySourceInternal = new t.Type<RegistrySource, string, unknown>(
    "RegistrySource",
    (registrySource): registrySource is RegistrySource =>
        typeof registrySource === "string" && isValidRegistrySource(registrySource),
    (registrySource, context) =>
        typeof registrySource === "string" && isValidRegistrySource(registrySource)
            ? t.success(registrySource as RegistrySource)
            : t.failure(registrySource, context, ErrorCodes.invalidRegistrySource),
    String,
);
