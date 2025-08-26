/**
 * @file src/NetNewProcessor.ts
 */
import path from "node:path";
import { DELAY, STOP_RUNNING, getResourceFolderConfiguration, isEnvironmentInitialized, } from "../config/env";
import { getCategoryToSkuDict, getObjectPropertyDictionary, 
    isDataInitialized, promptForFileSelection
} from "../config/dataLoader";
import { 
    mainLogger as mlog, simpleLogger as slog,
    apiLogger as alog, 
    INDENT_LOG_LINE as TAB, 
    NEW_LINE as NL,
} from "../config/setupLog";
import { 
    getDealById, ApiObjectEnum, CrmAssociationObjectEnum, getContactById, 
    getLineItemById, getSkuFromLineItem, isValidLineItem, 
    DealCategorization, PurchaseHistory, NetNewValueEnum,
    SkuData, sortDealsChronologically, updateSkuHistory, batchUpdatePropertyByObjectId,
    SimplePublicObject,
    GetContactByIdParams,
    SimplePublicObjectWithAssociations, isSimplePublicObject, isSimplePublicObjectWithAssociations
} from "../api/crm";
import { 
    readJsonFileAsObject as read,
    writeObjectToJsonSync as write, 
    getCurrentPacificTime, toPacificTime,
    indentedStringify, getFileNameTimestamp, getSourceString,
    isDirectory,
    getDirectoryFiles,
    isFile,
    getColumnValues
} from "typeshi:utils/io";
import { extractFileName } from "@typeshi/regex";
import { isNonEmptyArray, isNonEmptyString, isStringArray } from "typeshi:utils/typeValidation";
import * as validate from "typeshi:utils/argumentValidation";

const F = extractFileName(__filename);

/**  */
let NUMBER_OF_DEALS_PROCESSED = 0;
let NUMBER_OF_LINE_ITEMS_PROCESSED = 0;
const MISSING_SKUS: string[] = [];
export function getMissingSkus(): string[] {
    return MISSING_SKUS;
}

/**
 * @TODO allow first arg to be absolute filepath
 * @param dataDir `string`
 * @param contactIdColumn `string`
 * @returns **`Promise<void>`**
 */
export async function runProcessor(
    dataDir?: string,
    contactIdColumn: string = 'Contact ID'
): Promise<void> {
    const source = getSourceString(F, runProcessor);
    if (!isEnvironmentInitialized()) {
        throw new Error(`${source} Application Environment is not initialized, call initializeEnvironment() first`)
    }
    if (!isDataInitialized()) {
        throw new Error(`${source} Application Data is not initialized, call initializeData() first`)
    }
    if (!dataDir) dataDir = (await getResourceFolderConfiguration()).dataDir;
    let dirFiles = getDirectoryFiles(dataDir, ...['.tsv', '.csv', '.xlsx']);
    let selectedFilePath = await promptForFileSelection(dirFiles, dataDir);
    if (!isFile(selectedFilePath)) {
        mlog.error(`${source} No valid file selected, exiting...`);
        return;
    }
    const contactIds = await getColumnValues(selectedFilePath, contactIdColumn);
    await updateContactLineItems(contactIds);
}


/** 
 * main.ts -> {@link updateContactLineItems}`(contactIds)` ->
 * - {@link processContact}`(contactId)` 
 * - - {@link processLineItem}`(for all lineItems associated with contact)`
 * - {@link updateLineItems}`(Record<`{@link NetNewValueEnum}, `Array<string>>)`
 * - - {@link batchUpdatePropertyByObjectId}`(...)`
 * */

/**
 * For each contact, 
 * - identify the net new line items and recurring line items of their associated deals
 * - Then call the HubSpot API to batch update the `'is_net_new'` property of the line items
 * @param contactIds `Array<string>`
 * @returns **`Promise<void>`** 
 * @consideration define a ContactBatch class 
 * */
async function updateContactLineItems(
    contactIds: Array<string>,
    batchSize: number = 50
): Promise<void> {
    const source = getSourceString(F, updateContactLineItems);
    try {
        validate.arrayArgument(source, {contactIds, isStringArray});
        validate.numberArgument(source, {batchSize});
    } catch (error: any) {
        mlog.error(`${source} Invalid parameter(s)`, 
            error, NL+`exiting function...`
        );
        return;
    }
    contactIds = Array.from(new Set(contactIds)).filter(c=>isNonEmptyString(c));
    let contactBatches = partitionArrayBySize(contactIds, batchSize) as string[][];
    mlog.info([`${source} (START)`,
        `contactIds.length: ${contactIds.length}`,
        `batch size: ${batchSize} -> num batches: ${contactBatches.length}`
    ].join(TAB));
    for (let [batchIndex, contactIdBatch] of contactBatches.entries()) {
        const batchStartTime = new Date();
        slog.info([
        `${source} Starting batch ${batchIndex+1} of ${contactBatches.length}`,
            `Batch Start Time: ${batchStartTime.toLocaleString()}`,
        ].join(TAB));
        const batchNetNewLineItems: string[] = [];
        const batchRecurringLineItems: string[] = [];
        for (let [subsetIndex, contactId] of contactIdBatch.entries()) {
            let history = await processContact(contactId) as PurchaseHistory;
            slog.info([`Contact ${subsetIndex+1}/${contactIdBatch.length} of Batch ${batchIndex+1}/${contactBatches.length} finished processContact(id: '${contactId}', name: '${history.contactName}')`,
                `   netNewLineItems.length: ${history.netNewLineItems.length}`,
                `recurringLineItems.length: ${history.recurringLineItems.length}`,
                `        Categories Bought: ${JSON.stringify(Object.keys(history.categoriesBought))}`,
            ].join(TAB));
            batchNetNewLineItems.push(...history.netNewLineItems);
            batchRecurringLineItems.push(...history.recurringLineItems);
        }
        slog.info([`Batch ${batchIndex+1} of ${contactBatches.length} data processed.`,
            `Time Elapsed: ${(new Date().getTime() - batchStartTime.getTime()) / 1000} seconds`
        ].join(TAB));
        const updateBatchStartTime = new Date();
        slog.info([`calling updateLineItems() for Batch ${batchIndex+1} of ${contactBatches.length} with`,
            `   batchNetNewLineItems.length: ${batchNetNewLineItems.length}`,
            `batchRecurringLineItems.length: ${batchRecurringLineItems.length}`,
        ].join(TAB));
        const updates: SimplePublicObject[] = await updateLineItems({
            [NetNewValueEnum.TRUE]: batchNetNewLineItems,
            [NetNewValueEnum.FALSE]: batchRecurringLineItems,
        } as Record<NetNewValueEnum, Array<string>>);
        const batchEndTime = new Date();
        slog.info([`${source} Batch (${batchIndex+1}/${contactBatches.length}) finished at ${batchEndTime.toLocaleString()}`,
            ` Update Time Elapsed: ${(batchEndTime.getTime() - updateBatchStartTime.getTime()) / 1000} seconds`,
            `  Total Time Elapsed: ${(batchEndTime.getTime() - batchStartTime.getTime()) / 1000} seconds`,
            `  Net New Line Items: ${batchNetNewLineItems.length}`,
            `Recurring Line Items: ${batchRecurringLineItems.length}`,
            `      updates.length: ${updates.length}`,
        ].join(TAB),
            NL  + `Pausing for 1 second.`
        );
        await DELAY(1000, null);
    }
}

/**
 * @param contactId `string` 
 * @returns **`purchaseHistory`** {@link PurchaseHistory}
 */
async function processContact(
    contactId: string
): Promise<PurchaseHistory> {
    const source = getSourceString(F, processContact);
    if (!isNonEmptyString(contactId)) {
        mlog.error(`${source} contactId is not a valid string`);
        return {} as PurchaseHistory;
    }
    let purchaseHistory = {
        contactId: contactId,
        contactName: '',
        categoriesBought: {},
        skuHistory: {} as Record<string, SkuData>,
        netNewLineItems: [],
        recurringLineItems: []
    } as PurchaseHistory;
    alog.debug(`${source} START for contactId '${contactId}'`);
    try {
        const contact = await getContactById({ 
            contactId: contactId, 
            associations: [CrmAssociationObjectEnum.DEALS] 
        } as GetContactByIdParams) as SimplePublicObjectWithAssociations;
        if (!isSimplePublicObjectWithAssociations(contact) || !contact.associations.deals) {
            mlog.error(`contactResponse for '${contactId}' is invalid`);
            return purchaseHistory;
        }
        purchaseHistory.contactName 
            = `${contact.properties.firstname} ${contact.properties.lastname}`;
        let associatedDealIds = contact.associations.deals.results
            .map(deal => deal.id);
        let chronologicalDealIds = associatedDealIds.length > 0 
            ? await sortDealsChronologically(associatedDealIds)
            : [];
        for (let dealId of chronologicalDealIds) {
            const deal = await getDealById(dealId) as SimplePublicObjectWithAssociations;
            if (!(await isValidDeal(dealId, deal))) {
                continue;
            }   
            let lineItemAssociation = (deal.associations 
                ? deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_REQUEST] ?? deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_RESPONSE]
                : undefined
            );     
            let lineItemIds = (lineItemAssociation ?? { results: [] }).results
                .map(associatedLineItem => associatedLineItem.id);
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
                    alog.debug([`New category added for contact '${purchaseHistory.contactName}'`,
                        ` From: '${lineItem.properties.hs_sku}' in deal '${deal.properties.dealname}' on ${toPacificTime(deal.properties.closedate as string)}`,
                        `Added: '${catsAfter.filter(cat => !catsBefore.includes(cat)).join(', ')}'`,
                    ].join(TAB));
                }
            }
            NUMBER_OF_LINE_ITEMS_PROCESSED += lineItemIds.length;
        }
        NUMBER_OF_DEALS_PROCESSED += chronologicalDealIds.length;        
    } catch (e: any) {
        mlog.error('Error in processContact():', indentedStringify(e as any));
    }
    return purchaseHistory;
}

/**
 * @param lineItem {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @param history {@link PurchaseHistory}
 * @returns **`history`** {@link PurchaseHistory}
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
        history.categoriesBought[category] = dealId;
    } else if (isStillFirstDealWithNewCategory) {
        history.netNewLineItems.push(lineItemId);
    } else if (isRecurringDeal) {
        history.recurringLineItems.push(lineItemId);
    } else {
        alog.warn(`Deal ${dealProps.dealname} has SKU '${sku}' not found in any category from ${
            Object.keys(getCategoryToSkuDict()).join(', ')
        }`);
        if (!MISSING_SKUS.includes(sku)){ MISSING_SKUS.push(sku); }
    }
    
    return history;
}

/**
 * calls the HubSpot API via {@link batchUpdatePropertyByObjectId} to update the 'is_net_new' property of line items
 * @param lineItemDict `Record<`{@link NetNewValueEnum}, `Array<string>>`
 * @returns **`responses`** `Array<SimplePublicObject>`
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
    for (let [enumVal, lineItemIds] of Object.entries(lineItemDict)) {
        if (!lineItemIds || lineItemIds.length === 0) {
            mlog.warn(`No line items to update for netNewValue: ${enumVal}`);
            continue;
        }
        responses.push(...await batchUpdatePropertyByObjectId(
            ApiObjectEnum.LINE_ITEMS,
            lineItemIds,
            { is_net_new: enumVal }
        ));
        mlog.info([`updateLineItems() finished lineItemDict key ${keyIndex+1}/${Object.keys(lineItemDict).length}`,
            `Updated ${lineItemIds.length} lineItems with netNewValue: '${enumVal}'`,
        ].join(TAB))
        await DELAY(1000);
        keyIndex++;
    }
    return responses;
}


/**
 * @param sku `string`
 * @param categoriesBought `Record<string, string>`;
 * @param dealId `string` 
 * @returns **`categoryInfo`** {@link DealCategorization} 
 */
function categorizeDeal(
    sku: string, 
    categoriesBought: Record<string, string>, 
    dealId: string
): DealCategorization {
    let category = Object.keys(getCategoryToSkuDict())
        .find(key => getCategoryToSkuDict()[key].has(sku));
    if (!category) {
        mlog.error(`Error in categorizeDeal(): SKU "${sku}" not found in any category from ${JSON.stringify(Object.keys(getCategoryToSkuDict()))}`);
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
    alog.debug([`categorizeDeal() called`,
        `sku: '${sku}', category: '${category}', dealId: '${dealId}'`,
        `categoriesBought: ${JSON.stringify(categoriesBought)}`,
    ].join(TAB),
        NL  + `return categoryInfo:`, indentedStringify(categoryInfo)
    )
    // DEBUG_LOGS.push(...categorizeDealLogs);
    return categoryInfo;
}

/**
 * @param dealId `string`
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @returns **`Promise<boolean>`** `true` if the deal response is valid, `false` otherwise.
 */
async function isValidDeal(
    dealId: string,
    deal: SimplePublicObjectWithAssociations
): Promise<boolean> {
    if (!deal || !deal.properties || !deal.associations) {
        alog.warn([`isValidDeal() the response from getDealById('${dealId}') is invalid`,
            `Object.keys(deal):`, indentedStringify(Object.keys(deal)),
            'Object.keys(deal.properties).length:', Object.keys(deal.properties).length,
            ' > deal.properties.dealstage:', deal.properties.dealstage,
            `deal.associations:`, deal.associations
        ].join(TAB));
        // STOP_RUNNING(1);
        return false;
    }
    let isMissingLineItems = (
        !deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_RESPONSE]
        && !deal.associations[CrmAssociationObjectEnum.LINE_ITEMS_REQUEST]
    );
    let isValidDealStage = Boolean(
        deal.properties.dealstage 
        && (getObjectPropertyDictionary().VALID_DEAL_STAGES.includes(deal.properties.dealstage) 
            || !getObjectPropertyDictionary().INVALID_DEAL_STAGES.includes(deal.properties.dealstage))
    );
    alog.info([`isValidDeal() dealId: ${dealId}`,
        ` deal.properties.dealname: ${deal.properties.dealname}`,
        `deal.properties.dealstage: ${deal.properties.dealstage}`,
        `       isMissingLineItems: ${isMissingLineItems}`,
        `         isValidDealStage: ${isValidDealStage}`,
    ].join(TAB));
    if (isMissingLineItems) {
        mlog.error([`isValidDeal() Deal '${deal.properties.dealname}' has no line items`, 
            'dealRes.associations:', deal.associations
        ].join(TAB));
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
 * @returns **`batches`** `Array<Array<any>>`
 */
function partitionArrayBySize(arr: Array<any>, batchSize: number): Array<Array<any>> {
    let batches: Array<Array<any>> = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}
