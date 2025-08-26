/**
 * @file src/crm/objects/deals.ts
 */
import { ApiObjectEnum, 
    CrmAssociationObjectEnum,
    FilterOperatorEnum, FilterGroup, Filter, 
    PublicObjectSearchResponseSummary, PublicObjectSearchRequest,
    SimplePublicObject, SimplePublicObjectWithAssociations 
} from "../types";
import { getObjectById } from "./objects";
import { DELAY, STOP_RUNNING } from "../../../config/env";
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from "../../../config/setupLog";
import { getObjectPropertyDictionary as getCrmConstants } from "../../../config/dataLoader";
import { searchObjectByProperty } from "../properties";

/**
 * @property {string} dealId `string` = `hs_object_id`
 * @property {string[]} properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @property {string[]} propertiesWithHistory `string[]` 
 * @property {Array<CrmAssociationObjectEnum.LINE_ITEMS_REQUEST | CrmAssociationObjectEnum.CONTACTS | CrmAssociationObjectEnum.PRODUCTS>} associations `Array<`{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST} | {@link CrmAssociationObjectEnum.CONTACTS} | {@link CrmAssociationObjectEnum.PRODUCTS}`>`defaults to [{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST}]
 * @property {boolean} archived `boolean` defaults to `false`.
 */
export type GetDealByIdParams = {
    dealId: string | number;
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: Array<CrmAssociationObjectEnum.LINE_ITEMS_REQUEST | CrmAssociationObjectEnum.CONTACTS | CrmAssociationObjectEnum.PRODUCTS>;
    archived?: boolean;
}

/**
 * @param dealId `string` = `hs_object_id`
 * @param properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @param propertiesWithHistory `string[]`
 * @param associations `Array<`{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST} | {@link CrmAssociationObjectEnum.CONTACTS} | {@link CrmAssociationObjectEnum.PRODUCTS}`>`defaults to [{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST}]
 * @param archived `boolean` defaults to `false`.
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The deal with the specified ID, or undefined if not found.
 */
export async function getDealById(
    dealId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<CrmAssociationObjectEnum.LINE_ITEMS_REQUEST | CrmAssociationObjectEnum.CONTACTS | CrmAssociationObjectEnum.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

/**
 * @see {@link GetDealByIdParams}
 * @param params.dealId `string` = `hs_object_id`
 * @param params.properties `string[]` defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @param params.propertiesWithHistory `string[]` 
 * @param params.associations `Array<`{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST} | {@link CrmAssociationObjectEnum.CONTACTS} | {@link CrmAssociationObjectEnum.PRODUCTS}`>`defaults to [{@link CrmAssociationObjectEnum.LINE_ITEMS_REQUEST}].
 * @param params.archived `boolean` defaults to `false`.
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The deal with the specified ID, or undefined if not found.
 */
export async function getDealById(
    params: GetDealByIdParams
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

export async function getDealById(
    /**string | number | GetDealByIdParams */
    arg1: string | number | GetDealByIdParams,
    properties: string[] = getCrmConstants().DEFAULT_DEAL_PROPERTIES ?? [],
    propertiesWithHistory?: string[],
    associations: Array<CrmAssociationObjectEnum.LINE_ITEMS_REQUEST | CrmAssociationObjectEnum.CONTACTS | CrmAssociationObjectEnum.PRODUCTS>=[CrmAssociationObjectEnum.LINE_ITEMS_REQUEST],
    archived: boolean=false
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into GetDealByIdParams
    const params = typeof arg1 === 'object' && 'dealId' in arg1
        ? arg1 as GetDealByIdParams
        : {
            dealId: arg1 as string,
            properties: properties ?? getCrmConstants().DEFAULT_DEAL_PROPERTIES ?? [],
            propertiesWithHistory: propertiesWithHistory || undefined,
            associations: associations || [CrmAssociationObjectEnum.LINE_ITEMS_REQUEST],
            archived: archived || false
        } as GetDealByIdParams;

    try {
        const response = await getObjectById(
            ApiObjectEnum.DEALS,
            params.dealId,
            params.properties,
            params.propertiesWithHistory,
            params.associations,
            params.archived
        );
        return response;
    } catch (e) {
        mlog.error(`getDealById() Error retrieving deal with ID: ${params.dealId}`);
        return undefined;
    }
}

const DEAL_ORDER_NUM_PROP = 'unific_order_number';

export async function getDealByOrderNumber(
    orderNumber: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<CrmAssociationObjectEnum.LINE_ITEMS_REQUEST | CrmAssociationObjectEnum.CONTACTS | CrmAssociationObjectEnum.PRODUCTS>,
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
        properties: properties ?? getCrmConstants().DEFAULT_DEAL_PROPERTIES ?? [],
        filterGroups: filterGroups,
    }
    const searchRes = await searchObjectByProperty(
        ApiObjectEnum.DEALS, 
        searchRequest
    ) as PublicObjectSearchResponseSummary;
    await DELAY(1000);
    const responseIsInvalid: boolean = !searchRes || !searchRes.objectIds || searchRes.objectIds.length === 0;
    if (responseIsInvalid) {
        mlog.info(`searchResponse is undefined or No deal was found for order number "${orderNumber}".`);
        return;
    } 
    if (searchRes.objectIds.length > 1) {
        mlog.warn(`Multiple deals found for order number "${orderNumber}". searchResponse.objectIds.length = ${searchRes.objectIds.length}`);
    }
    const dealId = searchRes.objectIds[0];
    return await getDealById(
        dealId, properties, propertiesWithHistory, associations, archived
    ) as SimplePublicObject | SimplePublicObjectWithAssociations | undefined;
}

