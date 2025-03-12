import { DEFAULT_LINE_ITEM_PROPERTIES, VALID_DEAL_STAGES, INVALID_DEAL_STAGES } from '../property_constants.mjs';
import { CATEGORY_TO_SKU_DICT } from '../../data/item_lists.mjs';
import { hubspotClient } from '../../crm_client.mjs';

/**
 * @param {GetLineItemConfig} ParamObject GetLineItemConfig = { lineItemId, properties, propertiesWithHistory, associations, archived }
 * @param {string | number} lineItemId string | number
 * @param {Array<string>} properties Array\<string>
 * @param {Array<string>} propertiesWithHistory Array\<string>
 * @param {Array<string>} associations Array\<string>
 * @param {boolean} archived boolean
 * 
 * @returns {Promise<SimplePublicObjectWithAssociations>} {@link SimplePublicObjectWithAssociations}
*/
export async function getLineItemById({
    lineItemId, 
    properties = DEFAULT_LINE_ITEM_PROPERTIES, 
    propertiesWithHistory = undefined, 
    associations = ['deals'], 
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.lineItems.basicApi.getById(
            lineItemId, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4)) 
            : console.error('<< Error getting line item:', e.body.message);
        return null;
    }
}

/**
 * @deprecated
 * @param {*} param0 
 * @returns 
 */
export async function getLineItemByPage({
    limit = 5, 
    after = undefined, 
    properties = DEFAULT_LINE_ITEM_PROPERTIES,  
    propertiesWithHistory = undefined, 
    associations = undefined,
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.lineItems.basicApi.getPage(
            limit, after, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse;
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4)) 
            : console.error(e);
        return null;
    }
}

/**
 * lineItemData = getLineItemById(. . .).properties
 * @param {LineItemDataConfig} ParamObject LineItemDataConfig = { lineItemData }
 * @param {Object.<string, any>} lineItemData Object.<string, any>
 * @returns {string} sku — string
 */
export function extractSkuFromLineItem({lineItemData}) {
    let sku = undefined;
    if (lineItemData.hs_sku && lineItemData.hs_sku.includes(' - ')) {
        sku = lineItemData.hs_sku.split(' - ')[1] 
    } else if (lineItemData.hs_sku && lineItemData.hs_sku.includes('-Lot')) {
        sku = lineItemData.hs_sku.split('-Lot')[0]
    } else if (lineItemData.hs_sku && lineItemData.hs_sku.includes(' ')) { 
        lineItemData.hs_sku.split(' ')[0];
    } else {
        sku = lineItemData.hs_sku
    }
    return sku;
}
/**
 * 
 * @param {ValidateLineItemConfig} ParamObject ValidateLineItemConfig = { sku, price, dealstage }
 * @param {string} sku string
 * @param {number} price number
 * @param {string} dealstage string 
 * 
 * @returns {boolean} isValid — boolean
 */
export function isValidLineItem({sku, price, dealstage}) {
    return (
        sku 
        && price > 0 
        && !CATEGORY_TO_SKU_DICT['Marketing'].has(sku) 
        && !sku.startsWith('MM-') 
        && (VALID_DEAL_STAGES.includes(dealstage) 
            || !INVALID_DEAL_STAGES.includes(dealstage)
            )
    );
}