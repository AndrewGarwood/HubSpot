import { printJson, printConsoleGroup, toPacificTime } from '../io/io_utils.mjs';
import { getContactById, getDealById, getLineItemById } from './crm_object_utils.mjs';
import '../../types/types.js';



/**
 * 
 * @param {SkuHistoryUpdateConfig} ParamObject {skuHistory, sku, lineItemData, dealData, enableConsoleLog}
 * @param {Object.<string, SkuData>} skuHistory { [k: string]: {@link SkuData} }
 * @param {string} sku string
 * @param {{ [k: string]: any }} lineItemData {[k: string]: any;}
 * @param {{ [k: string]: any }} dealData {[k: string]: any;}
 * @param {boolean} enableConsoleLog boolean
 * @returns {Object.<string, SkuData>} updatedSkuHistory — { [k: string]: {@link SkuData} }
 */
export function updateSkuHistory({skuHistory, sku, lineItemData, dealData, enableConsoleLog=false}) {
    if (sku && !skuHistory.hasOwnProperty(sku) && lineItemData.amount > 0) {
        skuHistory[sku] = {
            sku: sku,
            name: lineItemData.name,
            dealCount: 1, 
            quantity: Number(lineItemData.quantity), 
            amount: lineItemData.price * Number(lineItemData.quantity),
            firstPurchaseDate: dealData.createdate, // assume update called chronologically
            associatedDeals: [dealData.hs_object_id],
            associatedLineItems: [lineItemData.hs_object_id]
        };
        if (enableConsoleLog) {
            printConsoleGroup({
                label: `[New Sku] ${dealData.dealname}`,
                logStatements: [
                    `[${sku.split(' ')[0]}, ${lineItemData.quantity} x $${lineItemData.price}] = $${lineItemData.price*Number(lineItemData.quantity)}`,
                    `index: 1`, 
                    `timestamp: ${toPacificTime(dealData.createdate)}`
                ]
            });
        }
    } else if (sku && skuHistory.hasOwnProperty(sku)) {
        let skuData = skuHistory[sku];
        skuData.quantity += Number(lineItemData.quantity);
        skuData.amount += lineItemData.price * Number(lineItemData.quantity);
        if (!skuData.associatedDeals.includes(dealData.hs_object_id)) {
            skuData.associatedDeals.push(dealData.hs_object_id);
        }
        if (!skuData.associatedLineItems.includes(lineItemData.hs_object_id)) {
            skuData.associatedLineItems.push(lineItemData.hs_object_id);
        }
        skuData.dealCount = skuData.associatedDeals.size;
        skuHistory[sku] = skuData;
        if (enableConsoleLog) {
            printConsoleGroup({
                label: `[Repeat Sku] ${dealData.dealname}`, 
                logStatements: [
                    `[${sku.split(' ')[0]}, ${lineItemData.quantity} x $${lineItemData.price}] = $${lineItemData.price*Number(lineItemData.quantity)}`,
                    `index: ${skuData.dealCount}`, 
                    `timestamp: ${toPacificTime(dealData.createdate)}`
                ],
                collapse: true
            });
        }
    }
    return skuHistory;
}

/**
 * 
 * @param {Array<string>} dealIdList Array\<string>
 * @returns {Array<string>} chronologicalDealIds — Array\<string>
 */
export async function sortDealsChronologically(dealIdList) {
    let dealsWithDates = [];
    for (let dealId of dealIdList) {
        let dealDateResponse = await getDealById({ 
            dealId: dealId, 
            properties: ['createdate'] 
        });
        let dealDate = dealDateResponse.properties.createdate;
        dealsWithDates.push({dealId, dealDate});
    }
    let chronologicalDealIds = dealsWithDates
        .sort((a, b) => new Date(a.dealDate) - new Date(b.dealDate))
        .map(deal => deal.dealId);
    return chronologicalDealIds
}

/**
 * @deprecated
 * @param {string | number} contactId string | number
 * @returns {Object.<string, SkuData>} skuHistory — Object.<string, {@link SkuData}>
 */
export async function loadSkuHistoryOfContact({contactId}={}) {
    let contactResponse = await getContactById({
        contactId: contactId, 
        propertiesWithHistory: []
    });
    let contactData = contactResponse.properties;
    let contactName = `${contactData.firstname} ${contactData.lastname}`;
    let skuHistory = new Map();
    let associatedDealsOfContact = contactResponse.associations.deals.results;
    let chronologicalDealIds = 
        await sortDealsChronologically(associatedDealsOfContact.map(deal => deal.id));
    console.log(`Reading deals of contact: ${contactName}... ${chronologicalDealIds.length} deals found.`);
    for (let dealId of chronologicalDealIds) {
        let dealResponse = await getDealById({ dealId: dealId });
        let dealData = dealResponse.properties;
        if (!dealResponse.associations['line items']) {
            console.log(`Deal [${dealData.dealname}] has no line items`);
            continue;
        }
        let lineItemIdList = dealResponse.associations['line items']
            .results.map(associatedLineItem => associatedLineItem.id);
        for (let lineItemId of lineItemIdList) { 
            let lineItemResponse = await getLineItemById({ lineItemId: lineItemId });
            let lineItemData = lineItemResponse.properties;
            let sku = lineItemData.hs_sku;
            if (sku && !sku.startsWith('MM')) {
                skuHistory = updateSkuHistory({skuHistory, sku, lineItemData, dealData});
            }
        }
    }
    console.log();
    console.log(`skuHistory: `, skuHistory);
    return skuHistory;
}

