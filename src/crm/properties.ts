/**
 * @file src/utils/crm/properties.ts
 */
import { hubspotClient, DELAY } from "../config/env";
import { mainLogger as log } from "../config/setupLog";
import { 
    CrmObjectEnum,
    CrmAssociationObjectEnum, 
    FilterOperatorEnum,
    SimplePublicObject,
    SimplePublicObjectWithAssociations,
    PublicObjectSearchResponse, 
    PublicObjectSearchRequest, 
    Filter, 
    FilterGroup
} from "./types";
import { getObjectById } from "./objects";
import { PublicObjectSearchRequest as HS_PublicObjectSearchRequest, Filter as HS_Filter, FilterGroup as HS_FilterGroup } from "@hubspot/api-client/lib/codegen/crm/objects";
import { SimplePublicObject as HS_SimplePublicObject, SimplePublicObjectWithAssociations as HS_SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { SimplePublicObjectInput as HS_SimplePublicObjectInput } from "@hubspot/api-client/lib/codegen/crm/objects";
import { CollectionResponseWithTotalSimplePublicObjectForwardPaging as HS_CollectionResponseWithTotalSimplePublicObjectForwardPaging } from "@hubspot/api-client/lib/codegen/crm/objects";
const PATCH_DELAY = 1000;

/**
 * @description 
 * 1. call {@link getObjectById}`(objectType, objectId, Object.keys(propDict))`
 * 2. for `key` of `propDict`: see if `response.properties[key]` === `propDict[key]`
 * 3. log if they are the same and return, no need to call `api.update` else, call `api.update`
 * @param {CrmObjectEnum} objectType `see` {@link CrmObjectEnum}
 * @param {string | number} objectId `string`
 * @param {Record<string, any>} propDict `Record<string, any>` for each `key` in `Object.keys(propDict)`, if `CrmObject[key]` != `properties[key]` then set `CrmObject[key]` = `properties[key]`
 * @param {string | undefined} idProperty `string | undefined`
 * @returns `objectRes` `Promise<`{@link HS_SimplePublicObject} | {@link SimplePublicObject} | `undefined>` 
 */
export async function updatePropertyByObjectId(
    objectType: CrmObjectEnum, 
    objectId: string | number, 
    propDict: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<HS_SimplePublicObject | SimplePublicObject | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        console.error(`ERROR in setPropertyByObjectId() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        console.error(`ERROR in setPropertyByObjectId() Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (!propDict || typeof propDict !== 'object' || Object.keys(propDict).length === 0) {
        console.error(`ERROR in setPropertyByObjectId() Invalid propDict provided. Expected Record<string, any>`);
        return undefined;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`ERROR in setPropertyByObjectId() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum));
        return undefined;
    }

    const initialObjectRes = await getObjectById(objectType, objectId, Object.keys(propDict)) as SimplePublicObject;
    if (!initialObjectRes || !initialObjectRes.properties) {
        console.error(`ERROR in setPropertyByObjectId() - unable to find existing ${objectType} with id=${objectId} and propertyKeys=${Object.keys(propDict)}`);
        return undefined;
    }
    const propsWithChanges: string[] = [];
    const initialProps: Record<string, any> = initialObjectRes.properties;
    for (let propName of Object.keys(propDict)) {
        const initialPropValue =  String(initialProps[propName]);
        if (initialPropValue === propDict[propName]) {
            log.info(`No change for property "${propName}" of object (type=${objectType}, id=${objectId}): `, 
                `Current value: "${initialPropValue}" === "${propDict[propName]}"`);
            continue;
        } 
        // log.info(`Change proposed for "${propName}" of object (type=${objectType}, id=${objectId}): `, 
        //     `Current value: "${initialPropValue}" !== "${propDict[propName]}"`);
        propsWithChanges.push(propName);
    }
    log.debug(`propsWithChanges.length=${propsWithChanges.length} for ${objectType} with id=${objectId}:`, `Object.keys(propDict).length=${Object.keys(propDict).length}`); 
    if (propsWithChanges.length === 0) {
        log.info(`No changes to be made for ${objectType} with id=${objectId}.`);
        return initialObjectRes;
    }
    log.info(`Updating ${objectType} with id=${objectId} with propWithChanges:`, JSON.stringify(propsWithChanges));
    const simpleObjectInput = { properties: {} } as HS_SimplePublicObjectInput;
    for (let propName of propsWithChanges) {
        simpleObjectInput.properties[propName] = propDict[propName];
    }
    const api = hubspotClient.crm[objectType].basicApi;
    try {
        const updatedObjectRes = await api.update(String(objectId), simpleObjectInput, idProperty);
        log.info(`Updated ${objectType} with id=${objectId} with properties:`, 
            JSON.stringify(simpleObjectInput.properties));
        return updatedObjectRes;
    } catch (e) {
        log.error(`unable to update ${objectType} with id=${objectId} and properties=${JSON.stringify(simpleObjectInput.properties)}`, e);
        return undefined;
    }
}

export async function batchUpdatePropertyByObjectId(
    objectType: CrmObjectEnum,
    objectIds: Array<string>,
    propDict: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<void> {
    try {
        let count = 0;
        for (let objectId of objectIds) {
            let updateRes = await updatePropertyByObjectId(
                objectType,
                objectId,
                propDict,
                idProperty
            );
            if (updateRes) {
                count++;
            } else {
                log.error(`unable to update object (type=${objectType}, id=${objectId}) and properties=${JSON.stringify(propDict)}`);
            }
            await DELAY(PATCH_DELAY);
        }
        log.info(`<< Batch updated ${count}/${objectIds.length} ${objectType}(s) with ${JSON.stringify(propDict)} >>`);
    } catch (e) {
        log.error(`Error updating ${objectType}s with IDs: ${objectIds}:`, e);
    }
}


/**
 * @param {CrmObjectEnum} objectType `see` {@link CrmObjectEnum}
 * @param {string | number} objectId `string`
 * @param {Record<string, any>} properties `Record<string, any>` for each `key` in `properties`, set `CrmObject[key]` = `properties[key]`
 * @param {string | undefined} idProperty `string | undefined`
 * 
 * @returns {Promise<void>}
 */
export async function setPropertyByObjectId(
    objectType: CrmObjectEnum, 
    objectId : string | number, 
    properties: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<HS_SimplePublicObject | SimplePublicObject | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        console.error(`setPropertyByObjectId() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        console.error(`setPropertyByObjectId() Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`setPropertyByObjectId() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum));
        return undefined;
    }
    const propsToSet: HS_SimplePublicObjectInput = { properties: properties };
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
 * @param {CrmObjectEnum} objectType `string`
 * @param {Array<string>} objectIds `Array<string>`
 * @param {Record<string, any>} properties `Record<string, any>` for each key in properties, set object.key = value
 * @param {string | undefined} idProperty `string | undefined`
 * 
 * @returns {Promise<void>}
 */
export async function batchSetPropertyByObjectId( 
    objectType: CrmObjectEnum, 
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
 * 
 * @param objectType {@link CrmObjectEnum}
 * @param searchRequest — {@link PublicObjectSearchRequest} = `{ filterGroups`?: `Array<`{@link FilterGroup}`>`, `properties`?: `Array<string>`, `limit`?: `number`, `after`?: `string | number }`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * 
 * @returns {Promise<PublicObjectSearchResponse | undefined>}
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    searchRequest: PublicObjectSearchRequest,
    responseProps?: string[],
): Promise<PublicObjectSearchResponse | undefined>;

/** 
 * @param objectType {@link CrmObjectEnum}
 * @param filterGroups — `Array<`{@link FilterGroup}`>`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * 
 * @returns {Promise<PublicObjectSearchResponse | undefined>}
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    filterGroups: FilterGroup[],
    responseProps?: string[],
    searchLimit?: number,
    after?: string | number,
): Promise<PublicObjectSearchResponse | undefined>;


/** 
 * @param objectType {@link CrmObjectEnum}
 * @param arg2 `Array<`{@link FilterGroup}`>` | {@link PublicObjectSearchRequest}
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * 
 * @returns {Promise<PublicObjectSearchResponse | undefined>}
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    arg2: FilterGroup[] | PublicObjectSearchRequest,
    responseProps: string[] = ['hs_object_id', 'name'],
    searchLimit: number = 200,
    after: string | number = 0,
): Promise<PublicObjectSearchResponse | undefined> {
    let searchRequest: PublicObjectSearchRequest | undefined = undefined;
    if (Array.isArray(arg2)) {
        searchRequest = {
            filterGroups: arg2,
            properties: responseProps,
            limit: searchLimit,
            after: String(after)
        } as PublicObjectSearchRequest;
    } else if (typeof arg2 === 'object') {
        searchRequest = arg2 as PublicObjectSearchRequest;
    } else {
        console.error(`searchObjectByProperty() Invalid filterGroups or searchRequest provided. Expected an array of FilterGroup or a PublicObjectSearchRequest object.`);
        return undefined;
    }
    try {
        const apiResponse = await hubspotClient.crm[objectType].searchApi.doSearch(
            searchRequest as HS_PublicObjectSearchRequest
        ) as HS_CollectionResponseWithTotalSimplePublicObjectForwardPaging;
        
        let resData: PublicObjectSearchResponse = {
            objectIds: apiResponse.results.map(object => object.id),
            objects: apiResponse.results as SimplePublicObject[],
            after: apiResponse && apiResponse.paging && apiResponse.paging.next && apiResponse.paging.next.after ? apiResponse.paging.next.after : -1,
            total: apiResponse.total
        };
        if (!resData || resData.total === 0 || !resData.objectIds) {
            console.log(`No ${objectType} found with filterGroups =`, JSON.stringify(arg2));
            return;
        }
        // console.log(`\t Found ${resData.total} ${objectType}(s) with the search filter:`, JSON.stringify(filterGroups));
        return resData;
    } catch (e) {
        console.error(`ERROR in searchObjectByProperty() when searching for ${objectType}` , (e as any).body); // );//
        return undefined;
    }
}