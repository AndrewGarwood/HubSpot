/**
 * @file src/crm/readDealsOfContact.ts
 */

import { SimplePublicObject, SimplePublicObjectWithAssociations, isValidLineItem } from '.'
import { getContactById, getDealById, getLineItemById, getSkuFromLineItem } from "./objects";
import { SkuData } from "./types/NetNew";
import { toPacificTime } from "../../utils/io";
import { 
    mainLogger as mlog,
    apiLogger as log, 
    INDENT_LOG_LINE as TAB, 
    NEW_LINE as NL, INFO_LOGS, DEBUG_LOGS 
} from "../../config/setupLog";
import { hasKeys } from '../../utils/typeValidation';

/**
 * @param skuHistory `Record<string, `{@link SkuData}`>`
 * @param lineItem {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @returns **`updatedSkuHistory`** — `Record<string, `{@link SkuData}`>`
 */
export function updateSkuHistory(
    skuHistory: Record<string, SkuData>, 
    lineItem: SimplePublicObject | SimplePublicObjectWithAssociations, 
    deal: SimplePublicObject | SimplePublicObjectWithAssociations
): Record<string, SkuData> {
    const lineItemProps = lineItem.properties;
    const dealProps = deal.properties;
    if (!lineItemProps || !dealProps) {
        mlog.warn(`Line item or deal properties are undefined.`);
        return skuHistory;
    }
    if (!hasKeys(lineItemProps, ['hs_sku', 'hs_object_id', 'name', 'quantity', 'price'])) {
        mlog.warn(`lineItem.properties missing at least one of required keys: ${Object.keys(lineItemProps).join(', ')}`);
        return skuHistory;
    }
    const sku = getSkuFromLineItem(lineItem);
    const name = lineItemProps.name as string;
    const quantity = Number(lineItemProps.quantity);
    const price = Number(lineItemProps.price);
    const amount = price * quantity;
    const lineItemId = lineItemProps.hs_object_id as string;
    const dealId = dealProps.hs_object_id as string;
    const dealCreateDate = dealProps.createdate as string;
    if (sku && !skuHistory[sku] &&!skuHistory.hasOwnProperty(sku) && Number(lineItemProps.amount) > 0) {
        skuHistory[sku] = {
            sku: sku,
            name: name,
            dealCount: 1, 
            quantity: quantity, 
            amount: price * quantity,
            firstPurchaseDate: dealCreateDate, // assume update called chronologically
            associatedDeals: [dealId],
            associatedLineItems: [lineItemId]
        };
        // INFO_LOGS.push(NL + `New SKU: "${sku}" from deal "${dealProps.dealname}"`,
        //     // TAB + `{ ${sku}, ${quantity} x $${price} = $${amount} }`,
        //     TAB + `     dealIndex: 1`, 
        //     TAB + `dealCreateDate: ${toPacificTime(dealCreateDate)}`
        // );
        
    } else if (sku && (skuHistory.hasOwnProperty(sku) || skuHistory[sku])) {
        let skuData = skuHistory[sku];
        skuData.quantity += quantity;
        skuData.amount += amount;
        if (!skuData.associatedDeals.includes(dealId)) {
            skuData.associatedDeals.push(dealId);
        }
        if (!skuData.associatedLineItems.includes(lineItemId)) {
            skuData.associatedLineItems.push(lineItemId);
        }
        skuData.dealCount = skuData.associatedDeals.length;
        skuHistory[sku] = skuData;
        // INFO_LOGS.push(NL + `Repeat SKU: "${sku}" from deal "${dealProps.dealname}"`,
        //     // TAB + `{ "${sku}", ${quantity} x $${price} = $${amount} }`,
        //     TAB + `     dealIndex: ${skuData.dealCount}`, 
        //     TAB + `dealCreateDate: ${toPacificTime(dealCreateDate)}`
        // );
    }
    return skuHistory;
}

/**
 * @param dealIds `Array<string>`
 * @returns **`chronologicalDealIds`** — `Array<string>`
 */
export async function sortDealsChronologically(dealIds: Array<string>): Promise<Array<string>> {
    let dealsWithDates: {dealId: string, dealDate: string}[] = [];
    for (let dealId of dealIds) {
        let deal = await getDealById({ 
            dealId: dealId, 
            properties: ['createdate', 'dealstage'] 
        });
        if (!deal || !deal.properties || !deal.properties.createdate) {
            mlog.warn(`sortDealsChronologically(): invalid deal (not sortable); dealId='${dealId}' `,
                TAB + `             Boolean(deal): ${Boolean(deal)}`,
                TAB + ` Boolean(deal?.properties): ${Boolean(deal?.properties)}`,
                TAB + `deal.properties.createdate: ${deal?.properties?.createdate}`,
                TAB + ` deal.properties.dealstage: ${deal?.properties?.dealstage}`);
            continue;
        }
        let dealDate = deal.properties.createdate;
        dealsWithDates.push({dealId, dealDate});
    }
    let chronologicalDealIds = dealsWithDates
        .sort((a, b) => new Date(a.dealDate || 0).getTime() - new Date(b.dealDate || 0).getTime())
        .map(deal => deal.dealId);
    return chronologicalDealIds
}


/**
 * @deprecated
 * @param contactId `string | number`
 * @returns **`skuHistory`** = `Promise<Record<string, `{@link SkuData}`>>`
 */
export async function loadSkuHistoryOfContact(contactId: string | number): Promise<Record<string, SkuData>> {
    let contactResponse = await getContactById({
        contactId: contactId, 
        propertiesWithHistory: []
    }) as SimplePublicObjectWithAssociations;
    if (!contactResponse || !contactResponse.properties || !contactResponse.associations || !contactResponse.associations.deals) {
        mlog.warn(`Contact with ID ${contactId} not found or has no associated deals.`);
        return {};
    }
    let contactData = contactResponse.properties;
    let contactName = `${contactData.firstname} ${contactData.lastname}`;
    let skuHistory = {};
    let associatedDealsOfContact = contactResponse.associations.deals.results;
    let chronologicalDealIds = 
        await sortDealsChronologically(associatedDealsOfContact.map((deal: Record<string, any>) => deal.id));
    mlog.info(`Reading deals of contact: ${contactName}... ${chronologicalDealIds.length} deals found.`);
    for (let dealId of chronologicalDealIds) {
        let dealResponse = await getDealById(dealId) as SimplePublicObjectWithAssociations;
        if (!dealResponse || !dealResponse.properties || !dealResponse.associations || !dealResponse.associations['line items']) {
            mlog.warn(`Deal with ID ${dealId} not found is either undefined or has no line items.`);
            continue;
        }
        let lineItemIdList = dealResponse.associations['line items']
            .results.map(associatedLineItem => associatedLineItem.id);
        for (let lineItemId of lineItemIdList) { 
            let lineItemResponse = await getLineItemById(lineItemId) as SimplePublicObjectWithAssociations;
            if (!lineItemResponse || !lineItemResponse.properties) {
                mlog.warn(`Line item with ID ${lineItemId} not found.`);
                continue;
            }
            if (isValidLineItem(lineItemResponse, dealResponse)) {
                skuHistory = updateSkuHistory(skuHistory, lineItemResponse, dealResponse);
            }
        }
    }
    mlog.info(`skuHistory: `, skuHistory);
    return skuHistory;
}
