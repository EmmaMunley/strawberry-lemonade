import * as t from "io-ts";
import { RegistrySourceInternal } from "../../types/registry/RegistryTypes";

export const DeleteRegistryDTO = t.type({ source: RegistrySourceInternal, registryId: t.string });
export type DeleteRegistryDTO = t.TypeOf<typeof DeleteRegistryDTO>;
