import * as t from "io-ts";
import { RegistryUrlInternal, RegistrySourceInternal } from "./RegistryTypes";

export const RegistryItem = t.type({
    title: t.string,
    img: t.string,
    price: t.number,
    needed: t.number,
    purchased: t.number,
    url: t.string,
    source: t.string,
});
export type RegistryItem = t.TypeOf<typeof RegistryItem>;

export const RegistryUrl = t.type({
    url: RegistryUrlInternal,
});
export type RegistryUrl = t.TypeOf<typeof RegistryUrl>;

export const Registry = t.type({
    url: RegistryUrlInternal,
    source: RegistrySourceInternal,
});
export type Registry = t.TypeOf<typeof Registry>;
