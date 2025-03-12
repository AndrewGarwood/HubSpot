/**
 * @file deals.mjs
 */
import { DEFAULT_DEAL_PROPERTIES } from '../property_constants.mjs';
import { hubspotClient } from '../../config/env.mjs';


/**
 * @param {GetDealConfig} ParamObject GetDealConfig = {dealId, properties, propertiesWithHistory, associations, archived}
 * @param {string | number} dealId string | number
 * @param {Array<string>} properties Array\<string> - default=[
    'hs_object_id', 'dealname','dealstage', 'createdate', 'closedate', 'amount', 
    'unific_order_number', 'unific_last_skus_bought', 'unific_last_products_bought',
    'unific_shipping_postal_code', 'unific_shipping_city', 'unific_shipping_state'
    ]
 * @param {Array<string>} propertiesWithHistory Array\<string>
 * @param {Array<string>} associations Array\<string> - default=['line_items']
 * @param {boolean} archived boolean
 * @returns {Promise<SimplePublicObjectWithAssociations>} 
*/
export async function getDealById({
    dealId = '', 
    properties = DEFAULT_DEAL_PROPERTIES, 
    propertiesWithHistory = undefined, 
    associations = ['line_items'], //, 'contacts'
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.deals.basicApi.getById(
            dealId, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2)) 
            : console.error(e);
    }
}

export async function getDealPage({
    limit = 5,
    after = undefined, 
    properties = DEFAULT_DEAL_PROPERTIES, 
    propertiesWithHistory = [''], 
    associations = ['contacts'], 
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.deals.basicApi.getPage(
            limit, after, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2)) 
            : console.error(e);
    }
}
// printJSON(await getDealById({dealId: sampleDealId}));

// {
//     "associations": {
//       "line items": {
//         "results": [
//           {
//             "id": "25373672868",
//             "type": "deal_to_line_item"
//           },
//           {
//             "id": "25373672869",
//             "type": "deal_to_line_item"
//           }
//         ]
//       },
//       "contacts": {
//         "results": [
//           {
//             "id": "16074123906",
//             "type": "deal_to_contact"
//           }
//         ]
//       },
//       "products": {
//         "results": [
//           {
//             "id": "2776332365",
//             "type": "deal_to_product"
//           },
//           {
//             "id": "2776343824",
//             "type": "deal_to_product"
//           }
//         ]
//       }
//     },
//     "createdAt": "2024-11-20T21:09:29.000Z",
//     "archived": false,
//     "id": "29395367261",
//     "properties": {
//       "closedate": "2024-11-20T21:09:32Z",
//       "createdate": "2024-11-20T21:09:29Z",
//       "dealname": "17010 - Joyce Solar",
//       "hs_lastmodifieddate": "2024-11-20T22:33:43.923Z",
//       "hs_object_id": "29395367261",
//       "unific_last_products_bought": "Exosome Regenerative Complex + || GF Hydrogel Moisturizing Mask Kit [5 Masks]",
//       "unific_last_skus_bought": "GF-10EP || GF-10HM",
//       "unific_order_number": "17010"
//     },
//     "updatedAt": "2024-11-20T22:33:43.923Z"
//   }