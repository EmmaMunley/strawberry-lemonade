import * as t from "io-ts";
import { RegistrySourceInternal } from "../../types/registry/RegistryTypes";

export const GetRegistrySourceItemsDto = t.type({ source: RegistrySourceInternal, url: t.string });
export type GetRegistrySourceItemsDto = t.TypeOf<typeof GetRegistrySourceItemsDto>;
