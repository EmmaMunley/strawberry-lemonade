import * as t from "io-ts";
import { RegistryUrlInternal, RegistrySourceInternal } from "./RegistryTypes";
import { createUUIDType } from "../StandardTypes";
import ErrorCodes from "../../error/errorCodes";

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

export const RegistryPartner = t.type({
    url: RegistryUrlInternal,
    source: RegistrySourceInternal,
});
export type RegistryPartner = t.TypeOf<typeof RegistryPartner>;

export const InternalRegistry = t.type({
    id: t.string,
    userId: t.string,
    firstName: t.string,
    lastName: t.string,
    fianceFirstName: t.string,
    fianceLastName: t.string,
    eventDate: t.string,
    eventSize: t.string,
});
export type InternalRegistry = t.TypeOf<typeof InternalRegistry>;

export const RegistryItemsResponse = t.intersection([
    RegistryPartner,
    t.type({
        items: t.array(RegistryItem),
        error: t.boolean,
    }),
]);
export type RegistryItemsResponse = t.TypeOf<typeof RegistryItemsResponse>;

const RegistryBase = t.type({
    user: t.type({
        firstName: t.string,
        lastName: t.string,
    }),
    fiance: t.type({
        firstName: t.string,
        lastName: t.string,
    }),
    wedding: t.type({
        date: t.string,
        size: t.string,
    }),
});
type RegistryBase = t.TypeOf<typeof RegistryBase>;

// Registry sent from front-end when creating a registry
export const CreateRegistry = t.intersection([RegistryBase, t.type({ registries: t.array(RegistryPartner) })]);
export type CreateRegistry = t.TypeOf<typeof CreateRegistry>;

// Registry sent back to front-end on response
export const RegistryResponse = t.intersection([
    RegistryBase,
    t.type({
        registries: t.array(RegistryItemsResponse),
        registryId: createUUIDType("RegistryId", ErrorCodes.invalidRegistryId),
    }),
]);
export type RegistryResponse = t.TypeOf<typeof RegistryResponse>;
