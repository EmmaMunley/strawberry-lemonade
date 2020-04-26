import * as t from "io-ts";

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
