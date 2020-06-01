import * as t from "io-ts";
import { RegistrySourceInternal } from "../../types/registry/RegistryTypes";

export const DeleteRegistryDTO = t.type({ registrySource: RegistrySourceInternal });
export type DeleteRegistryDTO = t.TypeOf<typeof DeleteRegistryDTO>;
