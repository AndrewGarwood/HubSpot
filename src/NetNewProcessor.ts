/**
 * @file src/NetNewProcessor.ts
 * @TODO rewrite this file with better practices
 */
import { SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { DATA_DIR, DELAY, STOP_RUNNING } from "./config/env";
import { CATEGORY_TO_SKU_DICT } from "./config/loadData";
import { getDealById, CrmObjectEnum, CrmAssociationObjectEnum, getContactById, VALID_DEAL_STAGES, INVALID_DEAL_STAGES, getLineItemById, setPropertyByObjectId, getSkuFromLineItem, isValidLineItem, batchSetPropertyByObjectId } from "./utils/crm";
import { CategoryExtractInfo, ContactCategoryData, NetNewDataConfig, NetNewDataOutput, SkuData } from "./utils/crm/types/NetNew";
import { readJsonFileAsObject, printConsoleGroup as print, toPacificTime, writeObjectToJson } from "./utils/io";
import { sortDealsChronologically, updateSkuHistory } from "./utils/crm/readDealsOfContact";



let filePath = `${DATA_DIR}/net_new/line_item_data.json`;
// console.log(`DATA_DIR: ${DATA_DIR}`);
const processedData = readJsonFileAsObject(filePath);
if (!processedData) {
    STOP_RUNNING();
}

let processedNetNewLineItems: Array<string> = processedData?.netNewLineItems;

let processedRecurringLineItems: Array<string> = processedData?.recurringLineItems;

let processedUnassociatedLineItems: Array<string> = processedData?.unassociatedLineItems;
let allProcessedLineItems = [...processedNetNewLineItems, ...processedRecurringLineItems, ...processedUnassociatedLineItems];

let processedContactData: Record<string, ContactCategoryData> = processedData?.processedContacts || {};


main().catch((error) => {
    console.error('Error in NetNewProcessor.js when executing main():', error);
});
async function main() {
    let filePath = `${DATA_DIR}/contacts_with_april2025_deals.json`;
    let contactIds = readJsonFileAsObject(filePath)?.contactIds || [];
    console.log(`contactIds.length: ${contactIds.length}`);
    let contactIdSubset = contactIds.slice(1, 3);
    await updateContactLineItems(contactIds, true);
}

/**
 * Fetches associated contact of deal.
 * if contactId exists in local data, process line item and update local data
 * else, identify net new line items of contact and add to local data
 * @param {string} dealId `string`
 * 
 * @returns {NetNewDataConfig} `netNewData` — {@link NetNewDataConfig}
 */
export async function identifyNetNewLineItemsOfDeal(dealId: string): Promise<NetNewDataConfig> {
    let netNewData: NetNewDataConfig = {// NetNewDataConfig
        contactId: undefined,
        contactName: undefined,
        categoriesBought: {},
        skuHistory: {},
        netNewLineItems: [],
        recurringLineItems: []
    };
    try {
        const dealResponse: SimplePublicObjectWithAssociations | undefined= await getDealById(dealId, undefined, undefined, [CrmAssociationObjectEnum.CONTACTS]);
        if (!dealResponse) {
            console.error(`<< dealResponse for ${dealId} is null or undefined`);
            return netNewData;
        } else if (!dealResponse.associations || !dealResponse.associations.contacts || !dealResponse.associations.contacts.results) {
            console.error(`<< dealResponse for ${dealId} has no associated contacts`);
            return netNewData;
        } else if (dealResponse.associations.contacts.results.length > 1) {
            console.log(`<< Deal ${dealResponse.properties.dealname} has more than one contact`);
        }
        let contactId = dealResponse.associations.contacts.results[0].id;
        netNewData = await identifyNetNewLineItemsOfContact(contactId) as NetNewDataConfig;
        updateLocalNetNewDataOfContact(netNewData);
    } catch (e) {
        console.error('<< Error in defineNetNewPropertyOfLineItem():', e);
    }
    return netNewData;
}

/**
 * Fetches associated deal of line item, then fetches associated contact of deal.
 * if `contactId` exists in local data, process line item and update local data
 * else, identify net new line items of contact and add to local data
 * @param {string} lineItemId `string`
 * 
 * @returns {NetNewDataConfig} `netNewData` — {@link NetNewDataConfig}
 */
export async function identifyNetNewPropertyOfLineItem(lineItemId: string): Promise<NetNewDataConfig> {
    let netNewData: NetNewDataConfig = {// NetNewDataConfig
        contactId: undefined,
        contactName: undefined,
        categoriesBought: {} as Record<string, string>,
        skuHistory: {} as Record<string, SkuData>,
        netNewLineItems: [] as Array<string>,
        recurringLineItems: [] as Array<string>
    }; 
    try {
        const lineItemResponse = await getLineItemById({ 
            lineItemId: lineItemId, 
            associations: [CrmAssociationObjectEnum.DEALS] 
        }) as SimplePublicObjectWithAssociations;
        if (!lineItemResponse) {
            console.error(`<< lineItemResponse for ${lineItemId} is null or undefined`);
        } else if (!lineItemResponse.associations || !lineItemResponse.associations.deals || !lineItemResponse.associations.deals.results) {
            console.log(`<< lineItemResponse for ${lineItemId} has no associated deals`);
            processedUnassociatedLineItems.push(lineItemId);
            await setPropertyByObjectId(
                CrmObjectEnum.LINE_ITEMS,
                lineItemId,
                {'is_net_new': 'Not Applicable'}
            );
        } else {
            let dealId = lineItemResponse.associations.deals.results[0].id;
            netNewData = await identifyNetNewLineItemsOfDeal(dealId);
        }
    } catch (e) {
        console.error('<< Error in defineNetNewPropertyOfLineItem():', e);
    }
    return netNewData;
}

/**
 * 
 * @param {string} contactId `string` 
 * 
 * @returns {NetNewDataConfig} `netNewData` — {@link NetNewDataConfig}
 */
async function identifyNetNewLineItemsOfContact(contactId: string): Promise<NetNewDataConfig | undefined> {
    if (!contactId) {
        console.error(`<< Error in identifyNetNewLineItemsOfContact({contactId}): contactId is undefined`);
        return;
    }
    let contactName = '';
    /** Map category to dealId in which category was first bought */
    let categoriesBought = {} as Record<string, string>;
    let skuHistory = {} as Record<string, SkuData>;
    let netNewLineItems: string[] = [];
    let recurringLineItems: string[] = [];
    try {
        const contactResponse = await getContactById({ 
            contactId: contactId, 
            associations: [CrmAssociationObjectEnum.DEALS] 
        }) as SimplePublicObjectWithAssociations;
        if (!contactResponse || !contactResponse.properties || !contactResponse.associations || !contactResponse.associations.deals) {
            console.error(`<< contactResponse for ${contactId} is null or undefined`);
            return;
        }
        const contactData = contactResponse.properties;
        contactName = `${contactData.firstname} ${contactData.lastname}`;
        let associatedDealsOfContact = contactResponse.associations.deals.results;
        let associatedDealIds = associatedDealsOfContact.map(deal => deal.id);

        let chronologicalDealIds = associatedDealIds.length > 0 
            ? await sortDealsChronologically(associatedDealIds)
            : [];
        for (let [index, dealId] of chronologicalDealIds.entries()) {
            const dealResponse = await getDealById({ 
                dealId: dealId, 
                associations: [CrmAssociationObjectEnum.LINE_ITEMS] 
            }) as SimplePublicObjectWithAssociations;
            let dealData = dealResponse.properties; 
            
            let isMissingLineItems = dealResponse && dealResponse.associations && (!Object.keys(dealResponse.associations).includes('line items') || !dealResponse.associations['line items']);
            let isValidDealStage = dealData.dealstage && (VALID_DEAL_STAGES.includes(dealData.dealstage)  || !INVALID_DEAL_STAGES.includes(dealData.dealstage));
            if (isMissingLineItems) {
                console.error(`<< Deal ${dealData.dealname} has no line items`);
                console.log('dealResponse.associations:', dealResponse.associations);
                continue;
            } else if (!isValidDealStage) {
                continue;
            }    
            let lineItemAssociations  = dealResponse.associations 
                ? dealResponse.associations['line items'] || dealResponse.associations[CrmAssociationObjectEnum.LINE_ITEMS] 
                : { results: [] };     
            let lineItemIds = lineItemAssociations.results.map(associatedLineItem => associatedLineItem.id);
            // lineItemIds = lineItemIds.filter(lineItemId => !allProcessedLineItems.includes(lineItemId));  
            for (let lineItemId of lineItemIds) {
                let lineItemResponse = await getLineItemById({ lineItemId: lineItemId });
                if (!lineItemResponse || !lineItemResponse.properties) {
                    console.error(`<< lineItemResponse for ${lineItemId} is null or undefined`);
                    continue;
                } 
                // else if (allProcessedLineItems.includes(lineItemId)) {
                //     console.log(`<< lineItemId ${lineItemId} has already been processed`);
                //     continue;
                // }
                let lineItemData = lineItemResponse.properties;
                let updatedLocalData = processLineItem(
                    lineItemData, dealData, categoriesBought, skuHistory
                );
                categoriesBought = updatedLocalData.categoriesBought as Record<string, string>;
                skuHistory = updatedLocalData.skuHistory as Record<string, SkuData>;
                netNewLineItems.push(...updatedLocalData.netNewLineItems);
                recurringLineItems.push(...updatedLocalData.recurringLineItems);
            }
        }        
    } catch (e) {
        console.error('<< Error in identifyNetNewLineItemsOfContact():', e);
    }
    
    let netNewData: NetNewDataConfig = { // NetNewDataConfig
        contactId: contactId,
        contactName: contactName,
        categoriesBought: categoriesBought,
        skuHistory: skuHistory, 
        netNewLineItems: Array.from(new Set(netNewLineItems)), 
        recurringLineItems: Array.from(new Set(recurringLineItems))
    };
    return netNewData;
}

/**
 * @param {NetNewDataConfig} data 
 * @returns {void} 
 */
function updateLocalNetNewDataOfContact(data: NetNewDataConfig): void {
    let contactId = data && data.contactId ? data.contactId : undefined;
    try {
        if (!contactId) {
            console.error(`<< Error in updateLocalNetNewDataOfContact(data={contactId=${contactId}, contactName:${data.contactName}, ...}): contactId is undefined`);
            return;
        }
        processedContactData[contactId] = {
            contactId: contactId,
            contactName: data.contactName || '',
            categoriesBought: data.categoriesBought, 
            skuHistory: data.skuHistory
        } as ContactCategoryData;
        processedNetNewLineItems.push(...data.netNewLineItems);
        processedRecurringLineItems.push(...data.recurringLineItems);
    } catch (e) {
        console.error(`<< Error in updateLocalNetNewDataOfContact(data={contactId: ${contactId}, contactName: ${data.contactName}, ...}):`, e);
    }
}



/**
 * 
 * @param {Record<string, any>} lineItemData `Record<string, any>`
 * @param {Record<string, any>} dealData `Record<string, any>`
 * @param {Record<string, string>} categoriesBought `Record<string, string>`; 
 * @param {Record<string, SkuData>} skuHistory `{[k: string]: `{@link SkuData}`}`
 * 
 * @returns {NetNewDataConfigSubset} updatedLocalContactData — {@link NetNewDataConfigSubset}
*/
function processLineItem(
    lineItemData: Record<string, any>, 
    dealData: Record<string, any>, 
    categoriesBought: Record<string, string>, 
    skuHistory: Record<string, SkuData>
): NetNewDataConfig {
    let netNewLineItems: string[] = [];
    let recurringLineItems: string[] = [];
    let lineItemId = lineItemData.hs_object_id;
    let sku = getSkuFromLineItem(lineItemData as SimplePublicObjectWithAssociations) || lineItemData.hs_sku;
    let price = Number(lineItemData.price) || 0;
    if (isValidLineItem(sku, price, dealData.dealstage)) {
        skuHistory = updateSkuHistory(skuHistory, sku, lineItemData, dealData);
        let dealId = dealData.hs_object_id;
        let info = extractCategoryInfo(sku, categoriesBought, dealId);
        if (info.isFirstDealWithCategory) {
            netNewLineItems.push(lineItemId);
            categoriesBought[info.category] = dealId;
            print({
                label: `Net New in Deal ${dealData.dealname} - ${toPacificTime(dealData.closedate)}`,
                details: [`{ sku: ${sku}, price: $${price}, quantity: ${lineItemData.quantity}, dealstage: ${dealData.dealstage} }`],
                printToConsole: false,
                numTabs: 1
            });
        } else if (info.isStillFirstDealWithNewCategory) {
            netNewLineItems.push(lineItemId);
            print({
                label: `Net New in Deal ${dealData.dealname} - ${toPacificTime(dealData.closedate)}`,
                details: [`{ sku: ${sku}, price: $${price}, quantity: ${lineItemData.quantity}, dealstage: ${dealData.dealstage} }`],
                printToConsole: false,
                numTabs: 1
            });
        } else if (info.isRecurringDeal) {
            recurringLineItems.push(lineItemId);
        } else {
            console.log(`<< Deal ${dealData.dealname} has SKU ${sku} not found in any category from ${Object.keys(CATEGORY_TO_SKU_DICT)}`);
        }
    } else {
        print({
            label: `Skipped Invalid Line Item in Deal ${dealData.dealname}:`, 
            details:[`{sku: (\"${lineItemData.hs_sku}\") => \"${sku}\", price: $${price}, dealstage: ${dealData.dealstage}, lineItemId: ${lineItemData.hs_object_id}}`], 
            printToConsole: false,
            numTabs: 1
        });
        processedUnassociatedLineItems.push(lineItemId);
    }
    /** @type {NetNewDataConfigSubset} .{@link NetNewDataConfigSubset} */
    let updatedLocalContactData = {
        categoriesBought, skuHistory, netNewLineItems, recurringLineItems
    };
    return updatedLocalContactData
}

/**
 * For each contact, identify the net new line items and recurring line items of their associated deals
 * Then call the HubSpot API to batch update the 'is_net_new' property of the line items
 * @param {Array<string>} contactIds `Array<string>`
 * @param {boolean} enableConsoleLog `boolean`
 * @returns {Promise<void>} 
 */
export async function updateContactLineItems(contactIds: Array<string>, enableConsoleLog: boolean): Promise<void> {
    let offset = 0;
    let contactBatches = partitionArrayBySize(contactIds, 50);

    for (let [batchIndex, contactIdSubset] of contactBatches.entries()) {
        console.log(`Processing batch ${batchIndex+1+offset} of ${contactBatches.length+offset}...`);
        let batchNetNewLineItems: string[] = [];
        let batchRecurringLineItems: string[] = [];
        for (let [subsetIndex, contactId] of contactIdSubset.entries()) {
            let data =  await identifyNetNewLineItemsOfContact(contactId) as NetNewDataConfig;
            print({
                label: `(${batchIndex+1+offset}-${subsetIndex+1}) Contact: ${contactId} - ${data.contactName}`, 
                details: [
                    `Net New Line Item Count: ${data.netNewLineItems.length}`,
                    `Categories Bought:       [${Object.keys(data.categoriesBought).join(', ')}]`,
                    `SKUs Bought:             [${Object.keys(data.skuHistory).join(', ')}]\n`,
                ], 
                printToConsole: enableConsoleLog
            });
            updateLocalNetNewDataOfContact(data);
            batchNetNewLineItems.push(...data.netNewLineItems);
            batchRecurringLineItems.push(...data.recurringLineItems);
            await DELAY(1000);
        }
        setNetNewPropertyOfLineItemIds(
            batchNetNewLineItems, 
            batchRecurringLineItems
        );
        saveNetNewDataToLocalFile(
            {
                netNewLineItems: processedNetNewLineItems,
                recurringLineItems: processedRecurringLineItems,
                unassociatedLineItems: processedUnassociatedLineItems,
                processedContacts: processedContactData
            }, 
            undefined, 
            undefined
        );
    }
}

/**
 * 
 * @param {NetNewDataOutput} compositeData {@link NetNewDataOutput}
 * @param {string} contactDataFilePath `string` - default: `${process.env.DATA_DIR}/net_new/contact_data.json`
 * @param {string} lineItemFilePath `string` - default: `${process.env.DATA_DIR}/net_new/line_item_data.json`
 * @returns {void}
 */
function saveNetNewDataToLocalFile(
    compositeData: NetNewDataOutput, 
    contactDataFilePath: string =`${DATA_DIR}/net_new/contact_data.json`, 
    lineItemFilePath: string =`${DATA_DIR}/net_new/line_item_data.json`
): void {
    const requiredProperties = ['netNewLineItems', 'recurringLineItems', 'unassociatedLineItems', 'processedContacts'];
    for (const prop of requiredProperties) {
        if (!compositeData.hasOwnProperty(prop)) {
            console.error(`<< Error in saveNetNewDataToLocalFile(): compositeData missing required property: ${prop}`);
            return;
        }
    }
    let lineItemOutputData = { 
        netNewLineItems: Array.from(new Set(compositeData.netNewLineItems)), 
        recurringLineItems: Array.from(new Set(compositeData.recurringLineItems)), 
        unassociatedLineItems: Array.from(new Set(compositeData.unassociatedLineItems)) 
    };
    writeObjectToJson(compositeData.processedContacts, undefined, contactDataFilePath, undefined, true);
    writeObjectToJson(lineItemOutputData, undefined, lineItemFilePath, undefined, true);
}

/**
 * 
 * @param {Array<string>} netNewLineItems `Array<string>`
 * @param {Array<string>} recurringLineItems `Array<string>`
 * @returns {Promise<void>} 
 */
async function setNetNewPropertyOfLineItemIds(netNewLineItems: Array<string>, recurringLineItems: Array<string>): Promise<void> {
    // netNewLineItems = netNewLineItems.filter(lineItemId => !processedNetNewLineItems.includes(lineItemId));
    // recurringLineItems = recurringLineItems.filter(lineItemId => !processedRecurringLineItems.includes(lineItemId));
    await batchSetPropertyByObjectId(
        CrmObjectEnum.LINE_ITEMS,
        netNewLineItems,
        { 'is_net_new': 'True' }
    );
    await batchSetPropertyByObjectId(
        CrmObjectEnum.LINE_ITEMS,
        recurringLineItems,
        { 'is_net_new': 'False' }
    );
}



/**
 * @param {string} sku `string`
 * @param {Record<string, string>} categoriesBought `Record<string, string>`;
 * @param {string} dealId `string` 
 * @returns {CategoryExtractInfo} `categoryInfo` — {@link CategoryExtractInfo} 
*/
function extractCategoryInfo(sku: string, categoriesBought: Record<string, string>, dealId: string): CategoryExtractInfo {
    let category = Object.keys(CATEGORY_TO_SKU_DICT).find(key => CATEGORY_TO_SKU_DICT[key].has(sku));
    if (!category) {
        console.error(`<< Error in extractCategoryInfo(): SKU ${sku} not found in any category from ${Object.keys(CATEGORY_TO_SKU_DICT)}`);
        return { category: '', isFirstDealWithCategory: false, isStillFirstDealWithNewCategory: false, isRecurringDeal: false };
    }
    const isFirstDealWithCategory = Boolean(category && !categoriesBought.hasOwnProperty(category));
    const isStillFirstDealWithNewCategory = Boolean(category && categoriesBought.hasOwnProperty(category) && dealId === categoriesBought[category]);
    const isRecurringDeal = Boolean(category && categoriesBought.hasOwnProperty(category) && dealId !== categoriesBought[category]);
    let categoryInfo: CategoryExtractInfo = { category, isFirstDealWithCategory, isStillFirstDealWithNewCategory, isRecurringDeal };
    return categoryInfo;
}



/**
 * 
 * @param {Array<any>} arr `Array<any>`
 * @param {number} batchSize `number`
 * @returns {Array<Array<any>>} `batches` — `Array<Array<any>>`
 */
function partitionArrayBySize(arr: Array<any>, batchSize: number): Array<Array<any>> {
    let batches: Array<Array<any>> = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}
