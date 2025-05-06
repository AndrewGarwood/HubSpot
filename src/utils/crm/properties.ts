/**
 * @file src/utils/crm/properties.ts
 */
import { hubspotClient, DELAY } from "../../config/env";
import { 
    CrmObjectWithBasicApiEndpointEnum as BasicCrmObjectEnum, 
    CrmAssociationObjectEnum, 
    FilterOperatorEnum 
} from "./types/Crm";
import { PublicObjectSearchRequest, Filter, FilterGroup } from "@hubspot/api-client/lib/codegen/crm/objects";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { SimplePublicObjectInput } from "@hubspot/api-client/lib/codegen/crm/objects";
import { CollectionResponseWithTotalSimplePublicObjectForwardPaging } from "@hubspot/api-client/lib/codegen/crm/objects";

const PATCH_DELAY = 1000;


/**
 * @param {BasicCrmObjectEnum} objectType `see` {@link BasicCrmObjectEnum}
 * @param {string | number} objectId `string`
 * @param {Record<string, any>} properties `Record<string, any>` for each key in properties, set object.key = value
 * @param {string | undefined} idProperty `string | undefined`
 * 
 * @returns {Promise<void>}
 */
export async function setPropertyByObjectId(
    objectType: BasicCrmObjectEnum, 
    objectId : string | number, 
    properties: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        console.error(`setPropertyByObjectId() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        console.error(`setPropertyByObjectId() Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (Object.keys(BasicCrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = BasicCrmObjectEnum[objectType.toUpperCase() as keyof typeof BasicCrmObjectEnum];
    } else if (Object.values(BasicCrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`setPropertyByObjectId() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(BasicCrmObjectEnum));
        return undefined;
    }
    const propsToSet: SimplePublicObjectInput = { properties: properties };
    try {
        const api = hubspotClient.crm[objectType].basicApi;
        const response = await api.update(String(objectId), propsToSet, idProperty);
        return response;
    } catch (e) {
        console.error(`setPropertyByObjectId() Error updating ${objectType} with ID ${objectId}:`, e);
        return undefined;
    }
}

/**
 * @param {BasicCrmObjectEnum} objectType `string`
 * @param {Array<string>} objectIds `Array<string>`
 * @param {Record<string, any>} properties `Record<string, any>` for each key in properties, set object.key = value
 * @param {string | undefined} idProperty `string | undefined`
 * 
 * @returns {Promise<void>}
 */
export async function batchSetPropertyByObjectId( 
    objectType: BasicCrmObjectEnum, 
    objectIds: Array<string>, 
    properties: Record<string, any>, 
    idProperty: string | undefined = undefined 
): Promise<void> {
    try {
        let count = 0;
        for (let objectId of objectIds) {
            await setPropertyByObjectId(
                objectType,
                objectId,
                properties,
                idProperty
            );
            count++;
            await DELAY(PATCH_DELAY);
        }
        console.log(`<< Batch Set ${count} ${objectType} with ${JSON.stringify(properties)} >>`);
    } catch (e) {
        console.error(`batchSetPropertyByObjectId() Error updating ${objectType}s with IDs: ${objectIds}:`, e);
    }
}




/**
 * To include multiple filter criteria, you can group filters within filterGroups:
 * To apply AND logic, include a comma-separated list of conditions within one set of filters.
 * To apply OR logic, include multiple filters within a filterGroup.
 * You can include a maximum of five filterGroups with up to 6 filters in each group, 
 * with a maximum of 18 filters in total. If you've included too many groups 
 * or filters, you'll receive a VALIDATION_ERROR error response.
 * */
/**
 * @typedefn `{Object}` `PublicObjectSearchResponse`
 */
export type PublicObjectSearchResponse = {
    objectIds: Array<string>;
    objects: Array<SimplePublicObject>;
    after: string | number;
    total: number;
}
/** 
 * @param {BasicCrmObjectEnum} objectType {@link BasicCrmObjectEnum}
 * @param {Array<FilterGroup>} filterGroups `Array<`{@link FilterGroup}`>`
 * @param {Array<string>} responseProperties `Array<string>` — default=['hs_object_id', 'name']
 * @param {number} searchLimit `number <= 200` — default=200
 * @param {number | string} after `number` — default=0
 * 
 * @returns {Promise<PublicObjectSearchResponse | undefined>}
 */
export async function searchObjectByProperty(
    objectType: BasicCrmObjectEnum,
    filterGroups: FilterGroup[],
    responseProperties: string[] = ['hs_object_id', 'name'],
    searchLimit: number = 200,
    after: string | number = 0
): Promise<PublicObjectSearchResponse | undefined> {
    const searchRequest: PublicObjectSearchRequest = {
        filterGroups: filterGroups,
        properties: responseProperties,
        limit: searchLimit,
        after: String(after)
    };
    try {
        const apiResponse = await hubspotClient.crm[objectType].searchApi.doSearch(
            searchRequest
        ) as CollectionResponseWithTotalSimplePublicObjectForwardPaging;
        
        let resData: PublicObjectSearchResponse = {
            objectIds: apiResponse.results.map(object => object.id),
            objects: apiResponse.results,
            after: apiResponse && apiResponse.paging && apiResponse.paging.next && apiResponse.paging.next.after ? apiResponse.paging.next.after : -1,
            total: apiResponse.total
        };
        if (!resData || resData.total === 0 || !resData.objectIds) {
            console.log(`No ${objectType} found with these filterGroups:`, filterGroups);
            return;
        }
        console.log(`Found ${resData.total} ${objectType}(s) with the search filter:\n`, filterGroups);
        return resData;
    } catch (e) {
        console.error(`searchObjectByProperty() Error searching ${objectType} with filterGroups:`, filterGroups, e);
        return undefined;
    }
}