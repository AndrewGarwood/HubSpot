/**
 * @file src/NetNewProcessor.ts
 */
import path from "node:path";
import { DATA_DIR, DELAY, OUTPUT_DIR, STOP_RUNNING } from "./config/env";
import { CATEGORY_TO_SKU_DICT } from "./config/loadData";
import { 
    mainLogger as mlog, 
    apiLogger as log, 
    INDENT_LOG_LINE as TAB, 
    NEW_LINE as NL, 
    indentedStringify, DEBUG_LOGS as DEBUG, INFO_LOGS as INFO, 
    MAIN_LOG_FILEPATH, API_LOG_FILEPATH, clearFile, trimFile, SUPPRESSED_LOGS as SUP } from "./config/setupLog";
import { 
    getDealById, CrmObjectEnum, CrmAssociationObjectEnum, getContactById, 
    getLineItemById, getSkuFromLineItem, isValidLineItem, 
    DealCategorization, PurchaseHistory, NetNewValueEnum,
    SkuData, sortDealsChronologically, updateSkuHistory, batchUpdatePropertyByObjectId,
    ProductCategoryEnum, SimplePublicObject,
    GetContactByIdParams,
    SimplePublicObjectWithAssociations,
    VALID_DEAL_STAGES,
    INVALID_DEAL_STAGES
} from "./crm";
import { 
    readJsonFileAsObject as read,
    writeObjectToJson as write, 
    getCurrentPacificTime, toPacificTime,
} from "./utils/io";
import { getColumnValues, validatePath, isValidCsv } from "./utils/io/reading";
/**@TODO maybe refactor and write function called updatePurchaseHistory(deal) */
/**  */
const NET_NEW_PROP = 'is_net_new';
let NUMBER_OF_DEALS_PROCESSED = 0;
let NUMBER_OF_LINE_ITEMS_PROCESSED = 0;
const MISSING_SKUS: string[] = [];

main().catch((error) => {
    mlog.error('Error in NetNewProcessor.ts when executing main():', error);
});
/** 
 * main`()` -> {@link updateContactLineItems}`(contactIds)` ->
 * - {@link processContact}`(contactId)` 
 * - - {@link processLineItem}`(for all lineItems associated with contact)`
 * - {@link updateLineItems}`(Record<`{@link NetNewValueEnum}, `Array<string>>)`
 * - - {@link batchUpdatePropertyByObjectId}`(...)`
 * */
async function main() {
    clearFile(MAIN_LOG_FILEPATH, API_LOG_FILEPATH);
    const startTime = new Date();

    const useSubset: boolean = false; // set to true to use a subset of contacts for testing
    const filePath = `${DATA_DIR}/Contacts With June 2025 Deals.csv`;
    const EXPORT_CSV_CONTACT_ID_COLUMN = 'Contact ID';
    validatePath(filePath)
    if (!isValidCsv(filePath, [EXPORT_CSV_CONTACT_ID_COLUMN])) {
        mlog.error(`Error in main(): Invalid CSV file at '${filePath}'`);
        STOP_RUNNING(1);
    }
    const ALL_CONTACTS = await getColumnValues(filePath, EXPORT_CSV_CONTACT_ID_COLUMN);
    const contactIds = useSubset ? ALL_CONTACTS.slice(3, 5) : ALL_CONTACTS;
    mlog.info(`[START NetNewProcessor.main()]`,
        TAB + `   filePath: '${filePath}'`,
        TAB + `  useSubset:  ${useSubset}`,
        TAB + `numContacts:  ${contactIds.length}`,
        NL  + `calling await updateContactLineItems()`
    );
    await updateContactLineItems(contactIds);
    const endTime = new Date();
    mlog.info(`[END NetNewProcessor.main()]`,
        TAB + `Elapsed Time: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`,
        TAB + `     Number of Deals Processed: ${NUMBER_OF_DEALS_PROCESSED}`,
        TAB + `Number of Line Items Processed: ${NUMBER_OF_LINE_ITEMS_PROCESSED}`,
    );
    write({missingSkus: MISSING_SKUS}, path.join(OUTPUT_DIR, 'missingSkus.json'));
    MISSING_SKUS.length = 0;
    trimFile(undefined, MAIN_LOG_FILEPATH);
    STOP_RUNNING(0);
}

/**
 * For each contact, 
 * - identify the net new line items and recurring line items of their associated deals
 * - Then call the HubSpot API to batch update the `'is_net_new'` property of the line items
 * @param contactIds `Array<string>`
 * @returns {Promise<void>} 
 */
export async function updateContactLineItems(
    contactIds: Array<string>
): Promise<void> {
    // mlog.info(`Start of updateContactLineItems()`);
    let contactBatches = partitionArrayBySize(contactIds, 50) as string[][];
    for (let [batchIndex, contactIdBatch] of contactBatches.entries()) {
        const batchStartTime = new Date();
        INFO.push((INFO.length > 1 ? NL : '') + 
        `[updateContactLineItems()] Starting batch ${batchIndex+1} of ${contactBatches.length}`,
            TAB + `Batch Start Time: ${batchStartTime.toLocaleString()}`,
            TAB + `      Batch Size: ${contactIdBatch.length}`,
        );
        const batchNetNewLineItems: string[] = [];
        const batchRecurringLineItems: string[] = [];
        for (let [subsetIndex, contactId] of contactIdBatch.entries()) {
            let history =  await processContact(contactId) as PurchaseHistory;
            INFO.push(
                NL  + `Contact ${subsetIndex+1} of Batch ${batchIndex+1} finished processContact(id: '${contactId}', name: '${history.contactName}')`,
                TAB + `   netNewLineItems.length: ${history.netNewLineItems.length}`,
                TAB + `recurringLineItems.length: ${history.recurringLineItems.length}`,
                TAB + `        Categories Bought: ${JSON.stringify(Object.keys(history.categoriesBought))}`,
                // TAB + `            SKUs Bought: ${JSON.stringify(Object.keys(history.skuHistory))}`,
            );
            batchNetNewLineItems.push(...history.netNewLineItems);
            batchRecurringLineItems.push(...history.recurringLineItems);
        }
        INFO.push(NL + `Batch ${batchIndex+1} of ${contactBatches.length} data processed.`,
            TAB + `Time Elapsed: ${(new Date().getTime() - batchStartTime.getTime()) / 1000} seconds`
        );
        const updateBatchStartTime = new Date();
        INFO.push(`calling updateLineItems() for Batch ${batchIndex+1} of ${contactBatches.length} with`,
            TAB + `  batchNetNewLineItems.length: ${batchNetNewLineItems.length}`,
            TAB + `batchRecurringLineItems.length: ${batchRecurringLineItems.length}`,
        );
        const updateRes: SimplePublicObject[] = await updateLineItems({
            [NetNewValueEnum.TRUE]: batchNetNewLineItems,
            [NetNewValueEnum.FALSE]: batchRecurringLineItems,
        } as Record<NetNewValueEnum, Array<string>>);
        const batchEndTime = new Date();
        INFO.push(NL + `[updateContactLineItems()] Batch (${batchIndex+1}/${contactBatches.length}) finished at ${batchEndTime.toLocaleString()}`,
            TAB + ` Update Time Elapsed: ${(batchEndTime.getTime() - updateBatchStartTime.getTime()) / 1000} seconds`,
            TAB + `  Total Time Elapsed: ${(batchEndTime.getTime() - batchStartTime.getTime()) / 1000} seconds`,
            TAB + `  Net New Line Items: ${batchNetNewLineItems.length}`,
            TAB + `Recurring Line Items: ${batchRecurringLineItems.length}`,
            TAB + `    updateRes.length: ${updateRes.length}`,
            NL  + `Pausing for 1 second.`
        );
        mlog.info(...INFO);
        INFO.length = 0;
        await DELAY(1000, null);
    }
}

/**
 * @param contactId `string` 
 * @returns **`purchaseHistory`** — {@link PurchaseHistory}
 */
async function processContact(
    contactId: string
): Promise<PurchaseHistory> {
    if (!contactId) {
        mlog.error(`Error in processContact({contactId}): contactId is undefined`);
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
    SUP.push(`[START processContact('${contactId}')]`);
    try {
        const contact = await getContactById({ 
            contactId: contactId, 
            associations: [CrmAssociationObjectEnum.DEALS] 
        } as GetContactByIdParams) as SimplePublicObjectWithAssociations;
        if (!contact || !contact.properties 
            || !contact.associations || !contact.associations.deals
        ) {
            mlog.error(`contactResponse for ${contactId} is invalid, null, or undefined`);
            return purchaseHistory;
        }
        purchaseHistory.contactName 
            = `${contact.properties.firstname} ${contact.properties.lastname}`;
        let associatedDealIds = contact.associations.deals.results
            .map(deal => deal.id);
        let chronologicalDealIds = associatedDealIds.length > 0 
            ? await sortDealsChronologically(associatedDealIds)
            : [];
        NUMBER_OF_DEALS_PROCESSED += chronologicalDealIds.length;
        for (let dealId of chronologicalDealIds) {
            const deal = await getDealById(dealId) as SimplePublicObjectWithAssociations;
            if (!(await isValidDeal(dealId, deal))) {
                continue;
            }   
            let lineItemAssociation = (deal.associations 
                ? deal.associations['line items'] 
                : { results: [] }
            );     
            let lineItemIds = lineItemAssociation.results
                .map(associatedLineItem => associatedLineItem.id);
            NUMBER_OF_LINE_ITEMS_PROCESSED += lineItemIds.length;
            for (let lineItemId of lineItemIds) {
                const lineItem = await getLineItemById(
                    lineItemId
                ) as SimplePublicObjectWithAssociations;
                if (!lineItem || !lineItem.properties) {
                    mlog.error(`lineItemResponse or its properties for lineItem '${lineItemId}' of deal '${dealId}' is null or undefined`);
                    continue;
                }
                const catsBefore = Object.keys(purchaseHistory.categoriesBought);
                purchaseHistory = processLineItem(
                    lineItem, deal, purchaseHistory
                );
                const catsAfter = Object.keys(purchaseHistory.categoriesBought);
                if (catsAfter.length > catsBefore.length) {
                    SUP.push(NL + `New category added for contact '${purchaseHistory.contactName}'`,
                        TAB + ` From: '${lineItem.properties.hs_sku}' in deal '${deal.properties.dealname}' on ${toPacificTime(deal.properties.closedate as string)}`,
                        TAB + `Added: '${catsAfter.filter(cat => !catsBefore.includes(cat)).join(', ')}'`,
                    );
                }
            }
        }        
    } catch (e) {
        mlog.error('Error in processContact():', e);
    }
    if (DEBUG.length > 0) mlog.debug(...DEBUG);
    DEBUG.length = 0; // clear the infoLogs array
    return purchaseHistory;
}

/**
 * @param lineItem {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @param history {@link PurchaseHistory}
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
    if (!isValidLineItem(sku, price, dealProps.dealstage as string)) {
        return history;
    }
    history.skuHistory = updateSkuHistory(
        history.skuHistory, lineItem, deal
    );
    let dealId = dealProps.hs_object_id as string;
    const {
        category, 
        isFirstDealWithCategory, 
        isStillFirstDealWithNewCategory,
        isRecurringDeal
    } = categorizeDeal(sku, history.categoriesBought, dealId);
    if (isFirstDealWithCategory) {
        history.netNewLineItems.push(lineItemId);
        history.categoriesBought[category as ProductCategoryEnum] = dealId;
    } else if (isStillFirstDealWithNewCategory) {
        history.netNewLineItems.push(lineItemId);
    } else if (isRecurringDeal) {
        history.recurringLineItems.push(lineItemId);
    } else {
        log.warn(`Deal ${dealProps.dealname} has SKU '${sku}' not found in any category from ${Object.keys(CATEGORY_TO_SKU_DICT)}`);
        MISSING_SKUS.push(sku);
    }
    
    return history;
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
    let keyIndex = 0;
    for (let [enumValKey, lineItemIds] of Object.entries(lineItemDict)) {
        if (!lineItemIds || lineItemIds.length === 0) {
            mlog.warn(`No line items to update for netNewValue: ${enumValKey}`);
            continue;
        }
        responses.push(...await batchUpdatePropertyByObjectId(
            CrmObjectEnum.LINE_ITEMS,
            lineItemIds,
            { [NET_NEW_PROP]: enumValKey }
        ));
        await DELAY(1000, 
            NL + `(${new Date().toLocaleString()}) updateLineItems() finished lineItemDict key ${keyIndex+1}/${Object.keys(lineItemDict).length}`,
            TAB + `Updated ${lineItemIds.length} lineItems with netNewValue: '${enumValKey}'`,
            NL + `Pausing for 1 second after updating `
        );
        keyIndex++;
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
        mlog.error(`Error in categorizeDeal(): SKU "${sku}" not found in any category from ${JSON.stringify(Object.keys(CATEGORY_TO_SKU_DICT))}`);
        return { 
            category: '', 
            isFirstDealWithCategory: false, 
            isStillFirstDealWithNewCategory: false, 
            isRecurringDeal: false 
        };
    }

    const isFirstDealWithCategory = Boolean(category 
        && !categoriesBought[category]
    );
    const isStillFirstDealWithNewCategory = Boolean(category 
        && categoriesBought[category]
        && dealId === categoriesBought[category]
    );
    const isRecurringDeal = Boolean(category 
        && categoriesBought[category]
        && dealId !== categoriesBought[category]
    );
    let categoryInfo: DealCategorization = { 
        category, isFirstDealWithCategory, isStillFirstDealWithNewCategory, isRecurringDeal 
    };
    const categorizeDealLogs = [
        NL + `categorizeDeal() called`,
        TAB + `             sku: "${sku}"`,
        TAB + `        category: "${category}", dealId: "${dealId}"`,
        TAB + `categoriesBought:`, JSON.stringify(categoriesBought),
        NL  + `return categoryInfo:`, indentedStringify(categoryInfo)
    ]
    // DEBUG_LOGS.push(...categorizeDealLogs);
    return categoryInfo;
}

/**
 * @param dealId `string`
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @returns **`Promise<boolean>`** — `true` if the deal response is valid, `false` otherwise.
 */
async function isValidDeal(
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
    let isMissingLineItems = Boolean(
        deal 
        && deal.associations 
        && (!Object.keys(deal.associations).includes('line items') 
            || !deal.associations['line items'])
    );
    let isValidDealStage = Boolean(
        deal.properties.dealstage 
        && (VALID_DEAL_STAGES.includes(deal.properties.dealstage) 
            || !INVALID_DEAL_STAGES.includes(deal.properties.dealstage))
    );
    // DEBUG_LOGS.push(NL + `dealResponseIsValid() dealId: ${dealId}`,
    //     TAB + ` deal.properties.dealname: ${deal.properties.dealname}`,
    //     TAB + `deal.properties.dealstage: ${deal.properties.dealstage}`,
    //     TAB + `       isMissingLineItems: ${isMissingLineItems}`,
    //     TAB + `         isValidDealStage: ${isValidDealStage}`,
    // );
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
