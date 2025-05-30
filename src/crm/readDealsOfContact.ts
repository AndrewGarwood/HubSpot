/**
 * @file src/utils/crm/readDealsOfContact.ts
 * @TODO maybe rewrite this
 */

import { SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getContactById, getDealById, getLineItemById } from "./objects";
import { SkuData } from "./types/NetNew";
import { printConsoleGroup as print, toPacificTime } from "../utils/io";

/**
 * 
 * @param {Record<string, SkuData>} skuHistory `Record<string, `{@link SkuData}`>`
 * @param {string} sku `string`
 * @param {Record<string, any>} lineItemData `Record<string, any>}`
 * @param {Record<string, any>} dealData `Record<string, any>}`
 * @param {boolean} enableConsoleLog `boolean`
 * @returns {Record<string, SkuData>} `updatedSkuHistory` — `Record<string, `{@link SkuData}`>`
 */
export function updateSkuHistory(
    skuHistory: Record<string, SkuData>, 
    sku: string, 
    lineItemData: Record<string, any>, 
    dealData: Record<string, any>, 
    enableConsoleLog: boolean=false
): Record<string, SkuData> {    
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
            print({
                label: `[New Sku] ${dealData.dealname}`,
                details: [
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
        skuData.dealCount = skuData.associatedDeals.length;
        skuHistory[sku] = skuData;
        if (enableConsoleLog) {
            print({
                label: `[Repeat Sku] ${dealData.dealname}`, 
                details: [
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
 * @param {Array<string>} dealIdList `Array<string>`
 * @returns {Array<string>} `chronologicalDealIds` — `Array<string>`
 */
export async function sortDealsChronologically(dealIdList: Array<string>): Promise<Array<string>> {
    let dealsWithDates: {dealId: string, dealDate: string}[] = [];
    for (let dealId of dealIdList) {
        let dealDateResponse = await getDealById({ 
            dealId: dealId, 
            properties: ['createdate'] 
        });
        if (!dealDateResponse || !dealDateResponse.properties || !dealDateResponse.properties.createdate) {
            console.log(`Deal with ID ${dealId} not found or has no createdate property.`);
            continue;
        }
        let dealDate = dealDateResponse.properties.createdate;
        dealsWithDates.push({dealId, dealDate});
    }
    let chronologicalDealIds = dealsWithDates
        .sort((a, b) => new Date(a.dealDate || 0).getTime() - new Date(b.dealDate || 0).getTime())
        .map(deal => deal.dealId);
    return chronologicalDealIds
}


/**
 * 
 * @param {string | number} contactId string | number
 * @returns {Record<string, SkuData> } `skuHistory` `Record<string, `{@link SkuData}`>`
 */
export async function loadSkuHistoryOfContact(contactId: string | number): Promise<Record<string, SkuData>> {
    let contactResponse = await getContactById({
        contactId: contactId, 
        propertiesWithHistory: []
    }) as SimplePublicObjectWithAssociations;
    if (!contactResponse || !contactResponse.properties || !contactResponse.associations || !contactResponse.associations.deals) {
        console.log(`Contact with ID ${contactId} not found or has no associated deals.`);
        return {};
    }
    let contactData = contactResponse.properties;
    let contactName = `${contactData.firstname} ${contactData.lastname}`;
    let skuHistory = {};
    let associatedDealsOfContact = contactResponse.associations.deals.results;
    let chronologicalDealIds = 
        await sortDealsChronologically(associatedDealsOfContact.map((deal: Record<string, any>) => deal.id));
    console.log(`Reading deals of contact: ${contactName}... ${chronologicalDealIds.length} deals found.`);
    for (let dealId of chronologicalDealIds) {
        let dealResponse = await getDealById({ dealId: dealId }) as SimplePublicObjectWithAssociations;
        if (!dealResponse || !dealResponse.properties || !dealResponse.associations || !dealResponse.associations['line items']) {
            console.log(`Deal with ID ${dealId} not found is either undefined or has no line items.`);
            continue;
        }
        let dealProps = dealResponse.properties;
        let lineItemIdList = dealResponse.associations['line items']
            .results.map(associatedLineItem => associatedLineItem.id);
        for (let lineItemId of lineItemIdList) { 
            let lineItemResponse = await getLineItemById({ lineItemId: lineItemId });
            if (!lineItemResponse || !lineItemResponse.properties) {
                console.log(`Line item with ID ${lineItemId} not found.`);
                continue;
            }
            let lineItemProps = lineItemResponse.properties;
            let sku = lineItemProps?.hs_sku;
            if (sku && !sku.startsWith('MM')) {
                skuHistory = updateSkuHistory(skuHistory, sku, lineItemProps, dealProps);
            }
        }
    }
    console.log(`\n skuHistory: `, skuHistory);
    return skuHistory;
}
