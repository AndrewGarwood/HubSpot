import { DEFAULT_PRODUCT_PROPERTIES } from '../property_constants.mjs';
import { hubspotClient } from '../../../config/env.mjs';


/**
 * @param {GetProductConfig} ParamObject GetProductConfig = {productId, properties, propertiesWithHistory, associations, archived}
 * @param {string | number} productId string | number
 * @param {Array<string>} properties Array\<string>
 * @param {Array<string>} propertiesWithHistory Array\<string>
 * @param {Array<string>} associations Array\<string>
 * @param {boolean} archived boolean
 * 
 * @returns {Promise<SimplePublicObjectWithAssociations | undefined>} 
*/
export async function getProductById({
    productId, 
    properties = DEFAULT_PRODUCT_PROPERTIES, 
    propertiesWithHistory = undefined, 
    associations = undefined, 
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.products.basicApi.getById(
            productId, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2)) 
            : console.error(e);
    }
}


/**
 * @deprecated
 * @param {*} param0 
 */
export async function setProductPropertyValues({
    productId, 
    properties,
    idProperty = undefined
} = {}) {
    const SimplePublicObjectInput = { objectWriteTraceId: "string", properties };
    try {
        const apiResponse = await hubspotClient.crm.products.basicApi.update(productId, SimplePublicObjectInput, idProperty);
        console.log(JSON.stringify(apiResponse, null, 2));
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(e)
    }
}

/**
 * @deprecated
 * @param {SearchProductIdConfig} param0 
 * @returns 
 */
export async function getProductIdByPropertySearch({
    propertyFilters = {'hs_object_id': ['CONTAINS_TOKEN', 'token']},
    // propertyFilters = {propertyName: ['operator', 'value1', 'value2', ...]},
    resultColumns: responseProperties = ['hs_object_id', 'hs_sku', 'name', 'unific_product_sku'],
} = {}) { // -> Promise<Array<string>>
    
    let filters = [];
    Object.entries(propertyFilters).forEach(([propertyName, filter]) => {
        const operator = filter[0];
        let values = filter.slice(1);
        values.forEach(value => {
            filters.push({ propertyName, operator, value });
        });
    });
    const filterGroups = [{
        filters: filters
    }];

    const publicObjectSearchRequest = {
        filterGroups,
        properties: responseProperties,
        limit: 200,
        after: 0
    };

    try {
        const apiResponse = await hubspotClient.crm.products.searchApi.doSearch(publicObjectSearchRequest);
        const productIds = apiResponse.results.map(product => product.id) || [];
        return productIds;
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4))
            : console.error(e);
    }
}



export async function getProductByPage({
    limit = 5, 
    after = undefined, 
    properties = DEFAULT_PRODUCT_PROPERTIES,
    propertiesWithHistory = undefined, 
    associations = undefined,
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.products.basicApi.getPage(
            limit, after, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse;
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4)) 
            : console.error(e);
    } 
}