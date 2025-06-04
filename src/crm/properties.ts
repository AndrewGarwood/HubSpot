/**
 * @file src/crm/properties.ts
 */
import { hubspotClient, DELAY } from "../config/env";
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from "../config/setupLog";
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

/**
 * @description 
 * 1. call {@link getObjectById}`(objectType, objectId, Object.keys(propDict))`
 * 2. for `key` of `propDict`: see if `response.properties[key]` === `propDict[key]`
 * 3. log if they are the same and return, no need to call `api.update` else, call `api.update`
 * @param objectType {@link CrmObjectEnum}
 * @param objectId `string`
 * @param propDict `Record<string, any>` for each `key` in `Object.keys(propDict)`, if `CrmObject[key]` != `properties[key]` then set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`updateRes`** `Promise<`{@link HS_SimplePublicObject} | {@link SimplePublicObject} | `undefined>` 
 */
export async function updatePropertyByObjectId(
    objectType: CrmObjectEnum, 
    objectId: string | number, 
    propDict: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject> {
    let updateRes = {} as SimplePublicObject;
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`Error in setPropertyByObjectId(): Invalid 'objectType' param.`,
            TAB + `Expected a string, but received: ${typeof objectType} = ${objectType}`
        );
        return updateRes;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`Error in setPropertyByObjectId(): Invalid 'objectType' param.`,
            TAB + `Invalid objectType provided. objectType must be a key or value of CrmObjectEnum.`
        );
        return updateRes;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        mlog.error(`ERROR in setPropertyByObjectId(): Invalid 'objectId' param.`,
            TAB + `Expected a string or number, but received: ${typeof objectId} = ${objectId}`
        );
        return updateRes;
    }
    if (!propDict || typeof propDict !== 'object' || Object.keys(propDict).length === 0) {
        mlog.error(`Error in setPropertyByObjectId(): Invalid 'propDict' param.`,
            TAB + `Expected Record<string, any>, but received: ${typeof propDict} = ${JSON.stringify(propDict || {})}`
        );
        return updateRes;
    }
    const debugLogs: any[] = [`Start of updatePropertyByObjectId(${objectType})`];
    const initialObjectRes = await getObjectById(
        objectType, 
        objectId, 
        Object.keys(propDict)
    ) as SimplePublicObject;
    if (!initialObjectRes || !initialObjectRes.properties) {
        mlog.error(`Error in setPropertyByObjectId(): undefined initialObjectRes`,
            TAB + `Unable to find existing ${objectType} with id='${objectId}'`,
            TAB + `propDict.keys=${Object.keys(propDict)}`
        );
        return updateRes;
    }
    const propsWithChanges: string[] = [];
    const initialProps: Record<string, any> = initialObjectRes.properties;
    for (let propName of Object.keys(propDict)) {
        const initialPropValue =  String(initialProps[propName]);
        if (initialPropValue === propDict[propName]) { 
            continue; 
        } 
        propsWithChanges.push(propName);
    }
    if (propsWithChanges.length === 0) {
        debugLogs.push(TAB + `No changes made for ${objectType} with id='${objectId}' (All property valeus are the same)`);
        // log.debug(...debugLogs);
        return initialObjectRes;
    }
    // debugLogs.push(
    //     TAB + `Trying to update '${objectType}' with id='${objectId}'`, 
    //     TAB + `propsWithChanges: ${JSON.stringify(propsWithChanges)}`
    // );
    const simpleObjectInput = { properties: {} } as HS_SimplePublicObjectInput;
    for (let propName of propsWithChanges) {
        simpleObjectInput.properties[propName] = propDict[propName];
    }
    const objectApi = hubspotClient.crm[objectType].basicApi;
    try {
        updateRes = await objectApi.update(
            String(objectId), simpleObjectInput, idProperty
        ) as SimplePublicObject;
        debugLogs.push(
            TAB + `Updated ${objectType} with id='${objectId}'`,
            TAB + `propsWithChanges: ${JSON.stringify(propsWithChanges)}`,
            TAB +` -> returning update response.`
        );
    } catch (e) {
        mlog.error(`Error updating ${objectType} with id='${objectId}'`,
            TAB + `properties=${JSON.stringify(simpleObjectInput.properties)}`, 
            TAB + ` -> returning undefined;`,
            TAB + `Error:`, e
        );
    }
    // log.debug(...debugLogs);
    return updateRes;
}

/**
 * @param objectType {@link CrmObjectEnum}
 * @param objectIds `Array<string>` — `string` ids of the objects to update
 * @param propDict `Record<string, any>` for each `key` in `Object.keys(propDict)`, if `CrmObject[key]` != `properties[key]` then set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`responses`** = `Promise<`{@link SimplePublicObject}`[]>`
 */
export async function batchUpdatePropertyByObjectId(
    objectType: CrmObjectEnum,
    objectIds: Array<string>,
    propDict: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject[]> {
    const responses: SimplePublicObject[] = [];
    try {
        let i = 0
        for (let objectId of objectIds) {
            let updateRes = await updatePropertyByObjectId(
                objectType,
                objectId,
                propDict,
                idProperty
            );
            await DELAY(1000, 
                ` > Finished updatePropertyByObjectId() call (${i+1}/${objectIds.length}) for ${objectType}`,
                TAB + ` ->  pausing for 1 second...`
            );
            i++;
            if (!updateRes) {
                log.error(`batchUpdatePropertyByObjectId(): Error at objectIds[index=${i}]`,
                    TAB + `undefined response for ${objectType} with id='${objectId}'`
                );
                continue;
            } 
            responses.push(updateRes);
        }
        mlog.info(`End of batchUpdatePropertyByObjectId()`,
            TAB + `updated (${responses.length}/${objectIds.length}) ${objectType}(s)`,
            TAB + `propDict: ${JSON.stringify(propDict)}`
        );
    } catch (e) {
        mlog.error(`Error updating ${objectType}s with IDs: ${objectIds}:`, e);
    }
    return responses;
}


/**
 * @param objectType {@link CrmObjectEnum}
 * @param objectId `string`
 * @param properties `Record<string, any>` for each `key` in `properties`, set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | `undefined>`
 */
export async function setPropertyByObjectId(
    objectType: CrmObjectEnum, 
    objectId : string | number, 
    properties: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`setPropertyByObjectId() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        mlog.error(`setPropertyByObjectId() Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`setPropertyByObjectId() Invalid objectType provided. objectType must be a key or value of CrmObjectEnum.`, JSON.stringify(CrmObjectEnum));
        return undefined;
    }
    const propsToSet: HS_SimplePublicObjectInput = { properties: properties };
    try {
        const objectApi = hubspotClient.crm[objectType].basicApi;
        const response = await objectApi.update(String(objectId), propsToSet, idProperty);
        return response as SimplePublicObject;
    } catch (e) {
        mlog.error(`setPropertyByObjectId() Error updating ${objectType} with ID ${objectId}:`, e);
        return undefined;
    }
}

/**
 * @param objectType `string`
 * @param objectIds `Array<string>`
 * @param properties `Record<string, any>` 
 * - for each key in `properties`, set object.key = value
 * @param idProperty `string` `(optional)`
 * @returns **`responses`** = `Promise<`{@link SimplePublicObject}`[]>`
 */
export async function batchSetPropertyByObjectId( 
    objectType: CrmObjectEnum, 
    objectIds: Array<string>, 
    properties: Record<string, any>, 
    idProperty?: string
): Promise<SimplePublicObject[]> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`batchSetPropertyByObjectId() Invalid objectType provided.`,
            TAB + `Expected a string from CrmObjectEnum.`
        );
        return [];
    }
    if (!objectIds || !Array.isArray(objectIds) || objectIds.length === 0) {
        mlog.error(`batchSetPropertyByObjectId() Invalid objectIds provided.`,
            TAB + `Expected a non-empty array of strings.`
        );
        return [];
    }
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
        mlog.error(`batchSetPropertyByObjectId() Invalid properties provided.`,
            TAB + `Expected a non-empty Record<string, any>.`
        );
        return [];
    }
    const responses: SimplePublicObject[] = [];
    try {
        let i = 0;
        for (let objectId of objectIds) {
            let res = await setPropertyByObjectId(
                objectType,
                objectId,
                properties,
                idProperty
            );
            await DELAY(1000, 
                NL + `Finished setPropertyByObjectId() call (${i+1}/${objectIds.length}) for ${objectType}`,
                TAB + ` -> pausing for 1 second...`
            );
            i++;
            if (!res) continue;
            responses.push(res);
        }
        mlog.debug(`End of batchSetPropertyByObjectId()`,
            TAB + `set (${responses.length}/${objectIds.length}) ${objectType}(s)`,
            TAB + `properties: ${JSON.stringify(properties)}`
        );
    } catch (e) {
        mlog.error(
            `batchSetPropertyByObjectId() Error updating ${objectType}(s)`, 
            e
        );
    }
    return responses;
}


/**
 * @param objectType {@link CrmObjectEnum}
 * @param searchRequest — {@link PublicObjectSearchRequest} = `{ filterGroups`?: `Array<`{@link FilterGroup}`>`, `properties`?: `Array<string>`, `limit`?: `number`, `after`?: `string | number }`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponse}`>`
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    searchRequest: PublicObjectSearchRequest,
    responseProps?: string[],
): Promise<PublicObjectSearchResponse>;

/** 
 * @param objectType {@link CrmObjectEnum}
 * @param filterGroups — `Array<`{@link FilterGroup}`>`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponse}`>`
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    filterGroups: FilterGroup[],
    responseProps?: string[],
    searchLimit?: number,
    after?: string | number,
): Promise<PublicObjectSearchResponse>;


/** 
 * @param objectType {@link CrmObjectEnum}
 * @param arg2 `Array<`{@link FilterGroup}`>` | {@link PublicObjectSearchRequest}
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponse}`>`
 */
export async function searchObjectByProperty(
    objectType: CrmObjectEnum,
    arg2: FilterGroup[] | PublicObjectSearchRequest,
    responseProps: string[] = ['hs_object_id', 'name'],
    searchLimit: number = 200,
    after: string | number = 0,
): Promise<PublicObjectSearchResponse> {
    let searchRequest: PublicObjectSearchRequest = {};
    let searchResponse = { 
        objectIds: [], objects: [], after: -1, total: 0 
    } as PublicObjectSearchResponse;
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
        mlog.error(`searchObjectByProperty() Invalid filterGroups or searchRequest provided. Expected an array of FilterGroup or a PublicObjectSearchRequest object.`);
        return searchResponse;
    }
    try {
        const apiResponse = await hubspotClient.crm[objectType].searchApi.doSearch(
            searchRequest as HS_PublicObjectSearchRequest
        ) as HS_CollectionResponseWithTotalSimplePublicObjectForwardPaging;
        
        
        searchResponse.objectIds = apiResponse.results.map(object => object.id),
        searchResponse.objects = apiResponse.results as SimplePublicObject[],
        searchResponse.after = apiResponse && apiResponse.paging && apiResponse.paging.next && apiResponse.paging.next.after ? apiResponse.paging.next.after : -1,
        searchResponse.total = apiResponse.total
        
        if (searchResponse.total === 0 || searchResponse.objectIds.length === 0) {
            mlog.warn(`No '${objectType}' object found with filterGroups =`, JSON.stringify(arg2));
        }
        mlog.debug(`Found ${searchResponse.total} ${objectType}(s)`);
    } catch (e) {
        mlog.error(`ERROR in searchObjectByProperty() when searching for ${objectType}` , (e as any).body);
    }
    return searchResponse;
}
