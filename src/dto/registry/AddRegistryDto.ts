import * as t from "io-ts";
import { RegistryUrlInternal, RegistrySourceInternal } from "../../types/registry/RegistryTypes";

export const AddRegistryDTO = t.type({ registryUrl: RegistryUrlInternal, registrySource: RegistrySourceInternal });
export type AddRegistryDTO = t.TypeOf<typeof AddRegistryDTO>;
