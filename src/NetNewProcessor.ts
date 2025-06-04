/**
 * @file src/NetNewProcessor.ts
 */
import { DATA_DIR, DELAY, STOP_RUNNING } from "./config/env";
import { CATEGORY_TO_SKU_DICT } from "./config/loadData";
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL, indentedStringify } from "./config/setupLog";
import { 
    getDealById, CrmObjectEnum, CrmAssociationObjectEnum, getContactById, 
    getLineItemById, setPropertyByObjectId, GetDealByIdParams, 
    getSkuFromLineItem, isValidLineItem, batchSetPropertyByObjectId, 
    DealCategorization, CategoryHistory, PurchaseHistory, NetNewValueEnum,
    SkuData, sortDealsChronologically, updateSkuHistory, batchUpdatePropertyByObjectId,
    ProductCategoryEnum, SimplePublicObject, DEFAULT_DEAL_PROPERTIES,
    GetContactByIdParams,
    SimplePublicObjectWithAssociations,
    VALID_DEAL_STAGES,
    INVALID_DEAL_STAGES
} from "./crm";
import { 
    readJsonFileAsObject as read,
    writeObjectToJson as write, 
    toPacificTime,
} from "./utils/io";

const NET_NEW_PROP = 'is_net_new';

main().catch((error) => {
    mlog.error('Error in NetNewProcessor.ts when executing main():', error);
});
/** 
 * main`()` -> {@link updateContactLineItems}`(contactIds)` ->
 * - {@link identifyNetNewLineItemsOfContact}`(contactId)` 
 * - - {@link processLineItem}`(for all lineItems associated with contact)`
 * - {@link updateLineItems}`(Record<`{@link NetNewValueEnum}, `Array<string>>)`
 * - - {@link batchUpdatePropertyByObjectId}`(...)`
 * */
async function main() {
    let filePath = `${DATA_DIR}/contacts_with_may2025_deals.json`;
    let contactIds = read(filePath)?.contactIds as string[] || [];
    // mlog.debug(`contactIds.length: ${contactIds.length}`);
    // STOP_RUNNING(0);
    // let contactIdSubset = contactIds.slice(1, 2);
    await updateContactLineItems(contactIds);
    STOP_RUNNING(0, `End of main() in NetNewProcessor.ts`);
}


/**
 * @param contactId `string` 
 * @returns **`purchaseHistory`** — {@link PurchaseHistory}
 */
async function identifyNetNewLineItemsOfContact(
    contactId: string
): Promise<PurchaseHistory> {
    if (!contactId) {
        mlog.error(`Error in identifyNetNewLineItemsOfContact({contactId}): contactId is undefined`);
        return {} as PurchaseHistory;
    }
    let purchaseHistory = {
        contactId: contactId,
        contactName: '',
        categoriesBought: {} as Record<string, string>,
        skuHistory: {} as Record<string, SkuData>,
        netNewLineItems: [] as Array<string>,
        recurringLineItems: [] as Array<string>
    } as PurchaseHistory;
    try {
        const contactRes = await getContactById({ 
            contactId: contactId, 
            associations: [CrmAssociationObjectEnum.DEALS] 
        } as GetContactByIdParams) as SimplePublicObjectWithAssociations;
        if (!contactRes || !contactRes.properties 
            || !contactRes.associations || !contactRes.associations.deals
        ) {
            mlog.error(`contactResponse for ${contactId} is invalid, null, or undefined`);
            return purchaseHistory;
        }
        purchaseHistory.contactName 
            = `${contactRes.properties.firstname} ${contactRes.properties.lastname}`;
        let associatedDealIds = contactRes.associations.deals.results
            .map(deal => deal.id);
        let chronologicalDealIds = associatedDealIds.length > 0 
            ? await sortDealsChronologically(associatedDealIds)
            : [];
        for (let dealId of chronologicalDealIds) {
            const dealRes = await getDealById(dealId) as SimplePublicObjectWithAssociations;
            // mlog.debug(`dealRes for ${dealId}:`, indentedStringify(dealRes));
            if (!(await dealResponseIsValid(dealId, dealRes))) {
                // mlog.warn(`dealResponse for ${dealId} is invalid`);
                continue;
            }   
            let dealResponseLineItemAssociation = (dealRes.associations 
                ? dealRes.associations['line items'] 
                : { results: [] });     
            let associatedLineItems = dealResponseLineItemAssociation.results
                .map(associatedLineItem => associatedLineItem.id);
            for (let lineItemId of associatedLineItems) {
                const lineItemRes = 
                    await getLineItemById(lineItemId) as SimplePublicObjectWithAssociations;
                if (!lineItemRes || !lineItemRes.properties) {
                    mlog.error(`lineItemResponse or its properties for lineItem '${lineItemId}' of deal '${dealId}' is null or undefined`);
                    continue;
                } 
                purchaseHistory = processLineItem(
                    lineItemRes, dealRes, purchaseHistory
                );
            }
        }        
    } catch (e) {
        mlog.error('Error in identifyNetNewLineItemsOfContact():', e);
    }
    return purchaseHistory;
}



/**
 * @param lineItem {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @param history `PurchaseHistory` {@link PurchaseHistory}
 * @returns **`history`** — {@link PurchaseHistory}
 */
function processLineItem(
    lineItem: SimplePublicObjectWithAssociations, 
    deal: SimplePublicObjectWithAssociations, 
    history: PurchaseHistory
): PurchaseHistory {
    let sku = getSkuFromLineItem(lineItem);
    if (!sku) {
        mlog.warn(`Line item '${lineItem.properties.hs_object_id}' of deal '${deal.properties.dealname}' has invalid SKU`);
        return history;
    }
    const lineItemProps = lineItem.properties;
    const dealProps = deal.properties;
    let lineItemId = lineItemProps.hs_object_id as string;
    let price = Number(lineItemProps.price) || 0;
    if (isValidLineItem(sku, price, dealProps.dealstage as string)) {
        history.skuHistory = updateSkuHistory(history.skuHistory, sku, lineItemProps, dealProps);
        let dealId = dealProps.hs_object_id as string;
        let catInfo = categorizeDeal(sku, history.categoriesBought, dealId);
        if (catInfo.isFirstDealWithCategory) {
            history.netNewLineItems.push(lineItemId);
            history.categoriesBought[catInfo.category as ProductCategoryEnum] = dealId;
            log.info(`Net New in Deal ${dealProps.dealname} - ${toPacificTime(dealProps.closedate as string)}`,
                TAB + `{ sku: ${sku}, price: $${price}, quantity: ${lineItemProps.quantity}, dealstage: ${dealProps.dealstage} }`,
            );
        } else if (catInfo.isStillFirstDealWithNewCategory) {
            history.netNewLineItems.push(lineItemId);
            log.info(`Net New in Deal ${dealProps.dealname} - ${toPacificTime(dealProps.closedate as string)}`,
                TAB + `{ sku: ${sku}, price: $${price}, quantity: ${lineItemProps.quantity}, dealstage: ${dealProps.dealstage} }`,
            );
        } else if (catInfo.isRecurringDeal) {
            history.recurringLineItems.push(lineItemId);
        } else {
            log.warn(`Deal ${dealProps.dealname} has SKU '${sku}' not found in any category from ${Object.keys(CATEGORY_TO_SKU_DICT)}`);
        }
    } else {
        log.warn(`Line item '${lineItemId}' of deal '${dealProps.dealname}' is not valid`);
    }
    return history;
}

/**
 * For each contact, 
 * - identify the net new line items and recurring line items of their associated deals
 * - Then call the HubSpot API to batch update the `'is_net_new'` property of the line items
 * @param contactIds `Array<string>`
 * @param enableConsoleLog `boolean`
 * @returns {Promise<void>} 
 */
export async function updateContactLineItems(
    contactIds: Array<string>
): Promise<void> {
    let contactBatches = partitionArrayBySize(contactIds, 50) as string[][];
    for (let [batchIndex, contactIdBatch] of contactBatches.entries()) {
        mlog.info(`Processing batch (${batchIndex+1}/${contactBatches.length})...`);
        const batchNetNewLineItems: string[] = [];
        const batchRecurringLineItems: string[] = [];
        for (let [subsetIndex, contactId] of contactIdBatch.entries()) {
            let history =  await identifyNetNewLineItemsOfContact(contactId) as PurchaseHistory;
            log.info(`${batchIndex+1}-${subsetIndex+1}) Contact: ${contactId} - ${history.contactName}`,
                TAB + `Net New Line Item Count: ${history.netNewLineItems.length}`,
                TAB + `      Categories Bought: ${JSON.stringify(Object.keys(history.categoriesBought))}`,
                TAB + `            SKUs Bought: ${JSON.stringify(Object.keys(history.skuHistory))}`,
            );
            batchNetNewLineItems.push(...history.netNewLineItems);
            batchRecurringLineItems.push(...history.recurringLineItems);
        }
        const updateRes = await updateLineItems(
            {
                [NetNewValueEnum.TRUE]: batchNetNewLineItems,
                [NetNewValueEnum.FALSE]: batchRecurringLineItems,
            } as Record<NetNewValueEnum, Array<string>>
        );
        await DELAY(1000, `updateContactLineItems() Batch (${batchIndex+1}/${contactBatches.length}) finished call to api.`,
            TAB + `  Net New Line Items: ${batchNetNewLineItems.length}`,
            TAB + `Recurring Line Items: ${batchRecurringLineItems.length}`,
            TAB + `    updateRes.length: ${updateRes.length}`,
            TAB + ` -> pausing for 1 second...`
        );
    }
}

/**
 * calls the HubSpot API via {@link batchUpdatePropertyByObjectId} to update the 'is_net_new' property of line items
 * @param lineItemDict `Record<`{@link NetNewValueEnum}, `Array<string>>`
 * @returns **`responses`** — `Array<SimplePublicObject>`
 */
async function updateLineItems(
    lineItemDict: Record<NetNewValueEnum, Array<string>>, 
): Promise<SimplePublicObject[]>{
    if (!lineItemDict || Object.keys(lineItemDict).length === 0) {
        mlog.error('Error in setNetNewPropertyOfLineItemIds(): lineItemDict is undefined or empty');
        return [];
    }
    const responses = [];
    for (let [enumValKey, lineItemIds] of Object.entries(lineItemDict)) {
        if (!lineItemIds || lineItemIds.length === 0) {
            mlog.debug(`No line items to update for netNewValue: ${enumValKey}`);
            continue;
        }
        responses.push(... await batchUpdatePropertyByObjectId(
            CrmObjectEnum.LINE_ITEMS,
            lineItemIds,
            { [NET_NEW_PROP]: enumValKey }
        ));
        await DELAY(1000);
    }
    return responses;
}



/**
 * @param sku `string`
 * @param categoriesBought `Record<string, string>`;
 * @param dealId `string` 
 * @returns **`categoryInfo`** — {@link DealCategorization} 
 */
function categorizeDeal(
    sku: string, 
    categoriesBought: Record<string, string>, 
    dealId: string
): DealCategorization {
    let category = Object.keys(CATEGORY_TO_SKU_DICT)
        .find(key => CATEGORY_TO_SKU_DICT[key].has(sku));
    if (!category) {
        mlog.error(`Error in extractCategoryInfo(): SKU "${sku}" not found in any category from ${JSON.stringify(Object.keys(CATEGORY_TO_SKU_DICT))}`);
        return { 
            category: '', 
            isFirstDealWithCategory: false, 
            isStillFirstDealWithNewCategory: false, 
            isRecurringDeal: false 
        };
    }
    const isFirstDealWithCategory = Boolean(category 
        && !categoriesBought.hasOwnProperty(category)
    );
    const isStillFirstDealWithNewCategory = Boolean(category 
        && categoriesBought.hasOwnProperty(category) 
        && dealId === categoriesBought[category]
    );
    const isRecurringDeal = Boolean(category 
        && categoriesBought.hasOwnProperty(category) 
        && dealId !== categoriesBought[category]
    );
    let categoryInfo: DealCategorization = { 
        category, isFirstDealWithCategory, isStillFirstDealWithNewCategory, isRecurringDeal 
    };
    return categoryInfo;
}


async function dealResponseIsValid(
    dealId: string,
    deal: SimplePublicObjectWithAssociations
): Promise<boolean> {
    if (!deal || !deal.properties || !deal.associations) {
        log.warn(`the response from getDealById('${dealId}') is invalid`,
            TAB + `Object.keys(deal):`, indentedStringify(Object.keys(deal)),
            TAB + 'Object.keys(deal.properties).length:', Object.keys(deal.properties).length,
            TAB + ' > deal.properties.dealstage:', deal.properties.dealstage,
            TAB + `deal.associations:`, deal.associations
        );
        // STOP_RUNNING(1);
        return false;
    }
    const debugLogs: any[] = [];
    let isMissingLineItems = (deal 
        && deal.associations 
        && (!Object.keys(deal.associations).includes('line items') 
            || !deal.associations['line items'])
    );
    let isValidDealStage = (deal.properties.dealstage 
        && (VALID_DEAL_STAGES.includes(deal.properties.dealstage) 
            || !INVALID_DEAL_STAGES.includes(deal.properties.dealstage))
    );
    debugLogs.push(`dealResponseIsValid() dealId: ${dealId}`,
        TAB + `deal.properties.dealname: ${deal.properties.dealname}`,
        TAB + `deal.properties.dealstage: ${deal.properties.dealstage}`,
        TAB + `isMissingLineItems: ${isMissingLineItems}`,
        TAB + `isValidDealStage: ${isValidDealStage}`,
    );
    if (isMissingLineItems) {
        mlog.error(`Deal '${deal.properties.dealname}' has no line items`, 
            TAB + 'dealRes.associations:', deal.associations
        );
        return false;
    }
    if (!isValidDealStage) {
        return false;;
    } 
    return true;
}

/**
 * @param arr `Array<any>`
 * @param batchSize `number`
 * @returns **`batches`** — `Array<Array<any>>`
 */
function partitionArrayBySize(arr: Array<any>, batchSize: number): Array<Array<any>> {
    let batches: Array<Array<any>> = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}
