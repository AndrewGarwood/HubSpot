/**
 * @file src/utils/crm/objects/deals.ts
 */
import { CrmObjectEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations, CrmObjectEnum, FilterOperatorEnum, FilterGroup, Filter, PublicObjectSearchResponse, PublicObjectSearchRequest } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_DEAL_PROPERTIES } from "../constants";
import { DELAY, STOP_RUNNING } from "../../config/env";
import { searchObjectByProperty } from "../properties";
import { mainLogger as log } from "../../config/setupLog";


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

const DEAL_ORDER_NUM_PROP = 'unific_order_number';

export async function getDealByOrderNumber(
    orderNumber: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    const filterGroups: FilterGroup[] = [
        {
            filters: [
                {
                    propertyName: DEAL_ORDER_NUM_PROP,
                    operator: FilterOperatorEnum.EQUAL_TO,
                    value: orderNumber,
                } as Filter,
            ] as Filter[],
        } as FilterGroup,
    ]
    const searchRequest: PublicObjectSearchRequest = {
        query: undefined,
        limit: 5,
        after: undefined,
        sorts: undefined,
        properties: properties || DEFAULT_DEAL_PROPERTIES,
        filterGroups: filterGroups,
    }
    const searchRes = await searchObjectByProperty(
        CrmObjectEnum.DEALS, 
        searchRequest,
        ['hs_object_id']
    ) as PublicObjectSearchResponse;
    await DELAY(1000);
    const responseIsInvalid: boolean = !searchRes || !searchRes.objectIds || searchRes.objectIds.length === 0;
    if (responseIsInvalid) {
        log.info(`searchResponse is undefined or No deal was found for order number "${orderNumber}".`);
        return;
    } 
    if (searchRes.objectIds.length > 1) {
        log.warn(`Multiple deals found for order number "${orderNumber}". searchResponse.objectIds.length = ${searchRes.objectIds.length}`);
    }
    const dealId = searchRes.objectIds[0];
    return await getDealById(
        dealId, properties, propertiesWithHistory, associations, archived
    ) as SimplePublicObject | SimplePublicObjectWithAssociations | undefined;
}