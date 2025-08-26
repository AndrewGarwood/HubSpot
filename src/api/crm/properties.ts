/**
 * @file src/api/crm/properties.ts
 */
import { hubspotClient, DELAY } from "../../config/env";
import { 
    mainLogger as mlog, apiLogger as alog,
    INDENT_LOG_LINE as TAB, 
    NEW_LINE as NL,
} from "../../config/setupLog";
import { 
    ApiObjectEnum,
    CrmAssociationObjectEnum, 
    FilterOperatorEnum,
    SimplePublicObject,
    SimplePublicObjectWithAssociations,
    PublicObjectSearchResponseSummary, 
    PublicObjectSearchRequest, 
    Filter, 
    FilterGroup
} from "./types";
import { getObjectById } from "./objects";
import { 
    PublicObjectSearchRequest as HS_PublicObjectSearchRequest, 
    SimplePublicObjectInput as HS_SimplePublicObjectInput,
    CollectionResponseWithTotalSimplePublicObjectForwardPaging as HS_CollectionResponse 
} from "@hubspot/api-client/lib/codegen/crm/objects";
import * as validate from "typeshi:utils/argumentValidation";

let NUMBER_OF_CHANGES = 0;

/**
 * @description 
 * 1. call {@link getObjectById}`(objectType, objectId, Object.keys(propDict))`
 * 2. for `key` of `propDict`: see if `response.properties[key]` === `propDict[key]`
 * 3. log if they are the same and return, no need to call `api.update` else, call `api.update`
 * @param objectType {@link ApiObjectEnum}
 * @param objectId `string`
 * @param propDict `Record<string, any>` for each `key` in `Object.keys(propDict)`, if `object[key]` != `properties[key]` then set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`updateRes`** = `Promise<`{@link SimplePublicObject}`>` 
 */
export async function updatePropertyByObjectId(
    objectType: ApiObjectEnum, 
    objectId: string | number, 
    propDict: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject> {
    const source = `${__filename}.updatePropertyByObjectId`;
    validate.enumArgument(source, {ApiObjectEnum, objectType});
    validate.numericStringArgument(source, {objectId});
    validate.objectArgument(source, {propDict});
    let updateRes = {} as SimplePublicObject;
    const debugLogs: any[] = [
        `[START updatePropertyByObjectId(type: '${objectType}')]`
    ];
    const initialObjectRes = await getObjectById(
        objectType, 
        objectId, 
        Object.keys(propDict)
    ) as SimplePublicObject;
    if (!initialObjectRes || !initialObjectRes.properties) {
        mlog.error(`[ERROR setPropertyByObjectId()]: undefined initialObjectRes`,
            TAB + `Unable to find existing ${objectType} with id = '${objectId}'`,
            TAB + `propDict.keys: ${JSON.stringify(Object.keys(propDict))}`
        );
        return updateRes;
    }
    const propsWithChanges: string[] = [];
    for (let propName of Object.keys(propDict)) {
        const initialPropValue =  String(initialObjectRes.properties[propName]);
        if (initialPropValue === propDict[propName]) { continue; }
        alog.debug(
            NL + `Property '${propName}' has changed for ${objectType} with id='${objectId}'`,
            TAB + `Initial Value: ${initialPropValue}`,
            TAB + `    New Value: ${propDict[propName]}`
        );
        propsWithChanges.push(propName);
    }
    if (propsWithChanges.length === 0) {
        debugLogs.push(TAB + `No changes made for ${objectType} with id='${objectId}' (All property valeus are the same)`);
        alog.debug(...debugLogs);
        return initialObjectRes;
    }
    NUMBER_OF_CHANGES += propsWithChanges.length;
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
    // mlog.debug(...debugLogs);
    return updateRes;
}

/**
 * @param objectType {@link ApiObjectEnum}
 * @param objectIds `Array<string>` — `string` ids of the objects to update
 * @param propDict `Record<string, any>` for each `key` in `Object.keys(propDict)`, if `CrmObject[key]` != `properties[key]` then set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`responses`** = `Promise<`{@link SimplePublicObject}`[]>`
 */
export async function batchUpdatePropertyByObjectId(
    objectType: ApiObjectEnum,
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
            await DELAY(1000, null);
            i++;
            if (!updateRes) {
                mlog.error(`[batchUpdatePropertyByObjectId()]: Error at objectIds[index=${i}]`,
                    TAB + `undefined response for ${objectType} with id='${objectId}'`
                );
                continue;
            } 
            responses.push(updateRes);
        }
        mlog.info(`[END batchUpdatePropertyByObjectId()]`,
            TAB + 'Number of changes made:', NUMBER_OF_CHANGES,
            TAB + `processed (${responses.length}/${objectIds.length}) ${objectType}(s)`,
            TAB + `propDict: ${JSON.stringify(propDict)}`
        );
        NUMBER_OF_CHANGES = 0; // reset for next batch
    } catch (e) {
        mlog.error(`[batchUpdatePropertyByObjectId()]: Error updating ${objectType}s with IDs: ${objectIds}:`, e);
    }
    return responses;
}


/**
 * @param objectType {@link ApiObjectEnum}
 * @param objectId `string`
 * @param properties `Record<string, any>` for each `key` in `properties`, set `CrmObject[key]` = `properties[key]`
 * @param idProperty `string | undefined`
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | `undefined>`
 */
export async function setPropertyByObjectId(
    objectType: ApiObjectEnum, 
    objectId : string | number, 
    properties: Record<string, any>,
    idProperty: string | undefined = undefined
): Promise<SimplePublicObject | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`[setPropertyByObjectId()] Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        mlog.error(`[setPropertyByObjectId()] Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (Object.keys(ApiObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = ApiObjectEnum[objectType.toUpperCase() as keyof typeof ApiObjectEnum];
    } else if (Object.values(ApiObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`[setPropertyByObjectId()] Invalid objectType provided. objectType must be a key or value of CrmObjectEnum.`, JSON.stringify(ApiObjectEnum));
        return undefined;
    }
    const propsToSet: HS_SimplePublicObjectInput = { properties: properties };
    try {
        const objectApi = hubspotClient.crm[objectType].basicApi;
        const response = await objectApi.update(String(objectId), propsToSet, idProperty);
        return response as SimplePublicObject;
    } catch (e) {
        mlog.error(`[setPropertyByObjectId()] Error updating ${objectType} with ID ${objectId}:`, e);
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
    objectType: ApiObjectEnum, 
    objectIds: Array<string>, 
    properties: Record<string, any>, 
    idProperty?: string
): Promise<SimplePublicObject[]> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`[batchSetPropertyByObjectId()] Invalid objectType provided.`,
            TAB + `Expected a string from CrmObjectEnum.`
        );
        return [];
    }
    if (!objectIds || !Array.isArray(objectIds) || objectIds.length === 0) {
        mlog.error(`[batchSetPropertyByObjectId()] Invalid objectIds provided.`,
            TAB + `Expected a non-empty array of strings.`
        );
        return [];
    }
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
        mlog.error(`[batchSetPropertyByObjectId()] Invalid properties provided.`,
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
            await DELAY(1000, null);
            // await DELAY(1000, 
            //     NL + `Finished setPropertyByObjectId() call (${i+1}/${objectIds.length}) for ${objectType}`,
            //     TAB + ` -> pausing for 1 second...`
            // );
            i++;
            if (!res) continue;
            responses.push(res);
        }
        mlog.debug(`[END batchSetPropertyByObjectId()]`,
            TAB + `set (${responses.length}/${objectIds.length}) ${objectType}(s)`,
            TAB + `properties: ${JSON.stringify(properties)}`
        );
    } catch (e) {
        mlog.error(
            `[batchSetPropertyByObjectId()] Error updating ${objectType}(s)`, 
            e
        );
    }
    return responses;
}


/**
 * @param objectType {@link ApiObjectEnum}
 * @param searchRequest — {@link PublicObjectSearchRequest} = `{ filterGroups`?: `Array<`{@link FilterGroup}`>`, `properties`?: `Array<string>`, `limit`?: `number`, `after`?: `string | number }`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponseSummary}`>`
 */
export async function searchObjectByProperty(
    objectType: ApiObjectEnum,
    searchRequest: PublicObjectSearchRequest,
): Promise<PublicObjectSearchResponseSummary>;

/** 
 * @param objectType {@link ApiObjectEnum}
 * @param filterGroups — `Array<`{@link FilterGroup}`>`
 * - {@link FilterGroup} = `Array<`{@link Filter}`>` 
 * - {@link Filter} = `{ propertyName`?: `string`, `operator`?: {@link FilterOperatorEnum}, `value`?: `string | number }`
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponseSummary}`>`
 */
export async function searchObjectByProperty(
    objectType: ApiObjectEnum,
    filterGroups: FilterGroup[],
    responseProps?: string[],
    searchLimit?: number,
    after?: string | number,
): Promise<PublicObjectSearchResponseSummary>;


/** 
 * @param objectType {@link ApiObjectEnum}
 * @param arg2 `Array<`{@link FilterGroup}`>` | {@link PublicObjectSearchRequest}
 * @param responseProps `Array<string>` — default=`['hs_object_id', 'name']`
 * @param searchLimit `number <= 200` — default=`200`
 * @param after `number | string` — default=`0`
 * @returns **`searchResponse`** = `Promise<`{@link PublicObjectSearchResponseSummary}`>`
 */
export async function searchObjectByProperty(
    objectType: ApiObjectEnum,
    arg2: FilterGroup[] | PublicObjectSearchRequest,
    responseProps: string[] = ['hs_object_id', 'name'],
    searchLimit: number = 200,
    after: string | number = 0,
): Promise<PublicObjectSearchResponseSummary> {
    let searchRequest: PublicObjectSearchRequest = {};
    let responseSummary = { 
        objectIds: [], objects: [], after: -1, total: 0 
    } as PublicObjectSearchResponseSummary;
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
        return responseSummary;
    }
    try {
        const apiResponse = await hubspotClient.crm[objectType].searchApi.doSearch(
            searchRequest as HS_PublicObjectSearchRequest
        ) as HS_CollectionResponse;
        
        
        responseSummary.objectIds = apiResponse.results.map(object => object.id) ?? [],
        responseSummary.objects = apiResponse.results as SimplePublicObject[] ?? [],
        responseSummary.after = (apiResponse 
            && apiResponse.paging 
            && apiResponse.paging.next 
            && apiResponse.paging.next.after 
            ? apiResponse.paging.next.after 
            : -1
        ),
        responseSummary.total = apiResponse.total ?? 0
        
        // if (searchResponse.total === 0 || searchResponse.objectIds.length === 0) {
        //     mlog.warn(`No '${objectType}' object found with filterGroups =`, JSON.stringify(arg2));
        // }
        alog.debug(`Found ${responseSummary.total} ${objectType}(s)`);
    } catch (e) {
        mlog.error(`ERROR in searchObjectByProperty() when searching for ${objectType}` , (e as any).body);
    }
    return responseSummary;
}
