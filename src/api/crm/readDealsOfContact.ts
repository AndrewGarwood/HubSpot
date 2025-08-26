/**
 * @file src/crm/readDealsOfContact.ts
 */

import { SimplePublicObject, SimplePublicObjectWithAssociations, isValidLineItem, CrmAssociationObjectEnum, isSimplePublicObject } from "."
import { getContactById, getDealById, getLineItemById, getSkuFromLineItem } from "./objects";
import { SkuData } from "./types/NetNew";
import { 
    mainLogger as mlog,
    apiLogger as alog, 
    INDENT_LOG_LINE as TAB, 
    NEW_LINE as NL,
} from "../../config/setupLog";
import { hasKeys, isStringArray } from "typeshi:utils/typeValidation";
import { toPacificTime } from "@typeshi/io";
import { extractFileName } from "@typeshi/regex";
import { getSourceString } from "@typeshi/io";
import { getObjectPropertyDictionary } from "src/config/dataLoader";
const F = extractFileName(__filename);
/**
 * @param skuHistory `Record<string, `{@link SkuData}`>`
 * @param lineItem {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @returns **`updatedSkuHistory`** `Record<string, `{@link SkuData}`>`
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
    if (sku 
        && !skuHistory[sku] 
        && !skuHistory.hasOwnProperty(sku) 
        && Number(lineItemProps.amount) > 0) {
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
        alog.debug([`New SKU: "${sku}" from deal "${dealProps.dealname}"`,
            `{ ${sku}, ${quantity} x $${price} = $${amount} }`,
            `     dealIndex: 1`, 
            `dealCreateDate: ${toPacificTime(dealCreateDate)}`
        ].join(TAB));
        
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
        alog.debug([`Repeat SKU: "${sku}" from deal "${dealProps.dealname}"`,
            `{ "${sku}", ${quantity} x $${price} = $${amount} }`,
            `     dealIndex: ${skuData.dealCount}`, 
            `dealCreateDate: ${toPacificTime(dealCreateDate)}`
        ].join(TAB));
    }
    return skuHistory;
}

/**
 * @param dealIds `string[]`
 * @returns **`chronologicalDealIds`** `string[]`
 */
export async function sortDealsChronologically(
    dealIds: string[],
): Promise<string[]> {
    const source = getSourceString(F, sortDealsChronologically);
    let dealsWithDates: {dealId: string, dealDate: string}[] = [];
    
    const invalidDealStages = getObjectPropertyDictionary().INVALID_DEAL_STAGES;
    for (let dealId of dealIds) {
        let deal = await getDealById({ 
            dealId: dealId, 
            properties: ['createdate', 'dealstage', 'closedate'] 
        });
        if (!deal || !deal.properties) { // @TODO implement retry logic ?
            mlog.error([`${source} Invalid getDealById() response`,
                `skipping dealId: '${dealId}'`
            ].join(TAB))
            continue;
        }
        const properties = deal.properties;
        if ((!properties.dealstage || invalidDealStages.includes(properties.dealstage))) {
            alog.debug([`${source} Skipping deal with bad dealstage (null or invalid)`,
                `   dealId: '${dealId}'`,
                `dealstage: '${properties.dealstage}'`
            ].join(TAB));
            continue;
        }
        let dealDate = properties.closedate ?? properties.createdate;
        if (!dealDate) {
            mlog.warn([`${source}: invalid deal (not sortable) - dealId: '${dealId}'`,
                `deal.properties.createdate: ${properties.createdate}`,
                ` deal.properties.closedate: ${properties.closedate}`,
                ` deal.properties.dealstage: ${properties.dealstage}`
            ].join(TAB));
            continue;
        }
        dealsWithDates.push({dealId, dealDate});
    }
    let chronologicalDealIds = (dealsWithDates
        .sort((a, b) => new Date(a.dealDate || 0).getTime() - new Date(b.dealDate || 0).getTime())
        .map(deal => deal.dealId)
    );
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
        let deal = await getDealById(dealId) as SimplePublicObjectWithAssociations;
        if (!deal || !deal.properties || !deal.associations) {
            mlog.warn(`Deal with ID ${dealId} not found is either undefined or has no line items.`);
            continue;
        }
        let lineItemIdList = (
            deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_REQUEST] 
            ?? deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_RESPONSE]
            ?? { results: [] }
        ).results.map(associatedLineItem => associatedLineItem.id);
        for (let lineItemId of lineItemIdList) { 
            let lineItem = await getLineItemById(lineItemId) as SimplePublicObjectWithAssociations;
            if (!lineItem || !lineItem.properties) {
                mlog.warn(`Line item with ID ${lineItemId} not found.`);
                continue;
            }
            if (isValidLineItem(lineItem, deal)) {
                skuHistory = updateSkuHistory(skuHistory, lineItem, deal);
            }
        }
    }
    mlog.info(`skuHistory: `, skuHistory);
    return skuHistory;
}
