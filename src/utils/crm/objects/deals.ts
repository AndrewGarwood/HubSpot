/**
 * @file src/utils/crm/objects/deals.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_DEAL_PROPERTIES } from "../constants";


/**
 * @property {string} dealId `string` = `hs_object_id`
 * @property {string[]} properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @property {string[]} propertiesWithHistory `string[]` 
 * @property {Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS>} associations `Array<`{@link Associations.LINE_ITEMS} | {@link Associations.CONTACTS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.LINE_ITEMS}]
 * @property {boolean} archived `boolean` defaults to `false`.
 */
export type GetDealByIdParams = {
    dealId: string | number;
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS>;
    archived?: boolean;
}


/**
 * @param dealId `string` = `hs_object_id`
 * @param properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @param propertiesWithHistory `string[]`
 * @param associations `Array<`{@link Associations.LINE_ITEMS} | {@link Associations.CONTACTS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.LINE_ITEMS}]
 * @param archived `boolean` defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The deal with the specified ID, or undefined if not found.
 */
export async function getDealById(
    dealId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

/**
 * @see {@link GetDealByIdParams}
 * @param params.dealId `string` = `hs_object_id`
 * @param params.properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @param params.propertiesWithHistory `string[]` 
 * @param params.associations `Array<`{@link Associations.LINE_ITEMS} | {@link Associations.CONTACTS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.LINE_ITEMS}].
 * @param params.archived `boolean` defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The deal with the specified ID, or undefined if not found.
 */
export async function getDealById(
    params: GetDealByIdParams
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

export async function getDealById(
    dealIdOrParams: string | number | GetDealByIdParams,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into a single object
    const params = typeof dealIdOrParams === 'object' && 'dealId' in dealIdOrParams
        ? dealIdOrParams
        : {
            dealId: dealIdOrParams,
            properties,
            propertiesWithHistory,
            associations,
            archived
        };

    // Apply defaults and destructure
    const {
        dealId,
        properties: props = DEFAULT_DEAL_PROPERTIES,
        propertiesWithHistory: historyProps,
        associations: assoc = [Associations.LINE_ITEMS],
        archived: arch = false
    } = params;

    try {
        const response = await getObjectById(
            BasicCrmObjects.DEALS,
            dealId,
            props,
            historyProps,
            assoc,
            arch
        );
        return response;
    } catch (e) {
        console.error(`\t getDealById() Error retrieving deal with ID: ${dealId}`);
        return undefined;
    }
}