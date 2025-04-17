/**
 * @file properties.mjs
 */

import '../../types/Types.js';
import '../../types/Enums.js';
import { FilterOperatorEnum, PropertyCreateTypeEnum, PropertyCreateFieldTypeEnum } from '../../types/Enums.js';
import { CrmObjectTypeEnum } from '../../types/crm/CrmEnums.js';
import '../../types/HubSpot.js';
import { hubspotClient, PATCH_DELAY, delay } from '../../config/env.mjs';


// TODO: Make getObjectById function with await hubspotClient.crm[objectType].basicApi.getById(objectId, properties, associations, archived);


/**
 * "To include multiple filter criteria, you can group filters within filterGroups:
 *- To apply AND logic, include a comma-separated list of conditions within one set of filters.
 *- To apply OR logic, include multiple filters within a filterGroup.
 *- You can include a maximum of five filterGroups with up to 6 filters in each group, 
 * with a maximum of 18 filters in total. If you've included too many groups 
 * or filters, you'll receive a VALIDATION_ERROR error response."
 * 
 *- filterGroups: Array<{@link FilterGroup}> = Array<Array<{@link Filter}>>
 *-
 * @param {SearchConfig} ParamObject
 * @param {CrmObjectTypeEnum} objectType {@link CrmObjectTypeEnum}
 * @param {Array<FilterGroup>} filterGroups Array\<FilterGroup>
 * @param {Array<string>} responseProperties Array\<string> — default=['hs_object_id', 'name']
 * @param {number} searchLimit number <=200 — default=200
 * @param {number} after number — default=0
 * 
 * @returns {Promise<SearchResult>} searchResult: Promise<{@link SearchResult}> = { objectIds: Array\<string>, objects: Array\<{@link SimplePublicObject}>, after: number, total: number }
 */
export async function searchObjectByProperty({
    objectType,
    filterGroups,
    responseProperties = ['hs_object_id', 'name'],
    searchLimit = 200,
    after = 0
} = {}) {
    /**@type {PublicObjectSearchRequest} */
    const searchRequest = {
        filterGroups: filterGroups,
        properties: responseProperties,
        limit: searchLimit,
        after: after
    };
    try {
        // const apiResponseExample = await hubspotClient.crm.products.searchApi.doSearch(publicObjectSearchRequest);

        /**@type {CollectionResponseWithTotalSimplePublicObjectForwardPaging} */
        const apiResponse = await hubspotClient.crm[objectType].searchApi.doSearch(searchRequest);
        
        /**@type {SearchResult} */
        let searchResult = {
            objectIds: apiResponse.results.map(object => object.id),
            objects: apiResponse.results,
            after: apiResponse && apiResponse.paging && apiResponse.paging.next && apiResponse.paging.next.after ? apiResponse.paging.next.after : -1,
            total: apiResponse.total
        };
        if (!searchResult || searchResult.total === 0 || !searchResult.objectIds) {
            console.log(`No ${objectType} found with these filterGroups:`, filterGroups);
            return;
        }
        console.log(`Found ${searchResult.total} ${objectType} with the search filter:\n`, filterGroups);
        return searchResult;
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4))
            : console.error(`<< Error in searchObjectByProperty() ${objectType}:`, e);
    }
}



/**
 * @deprecated
 * TODO: {@link PropertyCreate}
 * TODO: refactor params into PropertyCreate object
 * @param {CreatePropertyConfig} ParamObject CreatePropertyConfig = { objectType, groupName, name, label, type, fieldType, options }
 * @param {CrmObjectTypeEnum} objectType {@link CrmObjectTypeEnum}
 * @param {string} groupName string
 * @param {string} name string
 * @param {string} label string
 * @param {string} type string
 * @param {string} fieldType string
 * @param {Array<OptionInput>} options Array\<OptionInput> 
 * 
 * @returns {Promise<void>}
 */
export async function createProperty({
    objectType,
    groupName,
    name,
    label,
    type,
    fieldType,
    options = undefined
} = {}) {
    const property = {
        'groupName':groupName,
        'name':name,
        'label':label,
        'type':type,
        'fieldType':fieldType,
        'options':options
    };
    try {
        const apiResponse = await hubspotClient.crm.properties.coreApi.create(objectType, property);
        console.log(JSON.stringify(apiResponse, null, 4));
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4))
            : console.error('<< Error in createProperty()', e);
    }
}


/**
 * @param {SetPropertyConfig} ParamObject SetPropertyConfig = { objectType, objectId, properties, idProperty }
 * @param {CrmObjectTypeEnum} objectType {@link CrmObjectTypeEnum}
 * @param {string} objectId string
 * @param {Object.<string, string>} properties Object\<string, string> for each key in properties, set object.key = value
 * @param {string | undefined} idProperty string | undefined
 * 
 * @returns {Promise<void>}
 */
export async function setPropertyByObjectId({
    objectType, 
    objectId, 
    properties,
    idProperty = undefined,
} = {}) {
    const SimplePublicObjectInput = { 
        objectWriteTraceId: "string", 
        properties: properties
    };
    try {
        // const apiResponseExample = await hubspotClient.crm.products.basicApi.update(productId, SimplePublicObjectInput, idProperty); // (for reference)
        const apiResponse = await hubspotClient.crm[objectType].basicApi.update(objectId, SimplePublicObjectInput, idProperty);
        // console.log(`Setting Property of: ${objectType} ${apiResponse.id} such that ${JSON.stringify(properties)}`);
        return apiResponse;
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4))
            : console.error('<< Error in setPropertyByObjectId():', e.body.message)
    }
}
/**
 * @param {BatchSetPropertyConfig} ParamObject BatchSetPropertyConfig = { objectType, objectIds, properties, idProperty }
 * @param {CrmObjectTypeEnum} objectType {@link CrmObjectTypeEnum}
 * @param {Array<string>} objectIds Array\<string>
 * @param {Object.<string, string>} properties Object.<string, string> for each key in properties, set object.key = value
 * @param {string | undefined} idProperty string | undefined
 * 
 * @returns {Promise<void>}
 */
export async function batchSetPropertyByObjectId({ 
    objectType, 
    objectIds, 
    properties, 
    idProperty = undefined 
} = {}) {
    try {
        let count = 0;
        for (let objectId of objectIds) {
            await setPropertyByObjectId({
                objectType: objectType,
                objectId: objectId,
                properties: properties,
                idProperty: idProperty
            });
            count++;
            await delay(PATCH_DELAY);
        }
        console.log(`<< Batch Set ${count} ${objectType} with ${JSON.stringify(properties)} >>`);
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4))
            : console.error('<< Error in batchSetPropertyValues():', e)
    }
}