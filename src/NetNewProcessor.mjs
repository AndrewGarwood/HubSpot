import { printConsoleGroup, writeToJSONFile, getJsonFromFile, toPacificTime } from './utils/io/io_utils.mjs';
import { setPropertyByObjectId, batchSetPropertyByObjectId, searchObjectByProperty } from "./utils/crm_utils/properties.mjs";
import { getContactById, getDealById, getLineItemById } from './utils/crm_utils/crm_object_utils.mjs';
import { extractSkuFromLineItem, isValidLineItem } from "./utils/crm_utils/crm_objects/line_items.mjs";
import { CATEGORY_TO_SKU_DICT } from './data/item_lists.mjs';
import { VALID_DEAL_STAGES, INVALID_DEAL_STAGES } from "./utils/crm_utils/property_constants.mjs";
import { sortDealsChronologically, updateSkuHistory } from './read_deals_of_contact.mjs';
import dotenv from 'dotenv';
dotenv.config();
import './types/types.js';

import { hubspotClient, SEARCH_LIMIT, delay, DATA_DIR } from './config/env.mjs';
const MAX_NUM_SEARCHES = 1;

// if have existing data stored locally
const processedData = getJsonFromFile(DATA_DIR + '/net_new_line_items.json');

/**@type {Array<string>}*/
let processedNetNewLineItems = processedData.netNewLineItems;
/**@type {Array<string>}*/
let processedRecurringLineItems = processedData.recurringLineItems;
/**@type {Array<string>}*/
let processedUnassociatedLineItems = processedData.unassociatedLineItems;
let allProcessedLineItems = [...processedNetNewLineItems, ...processedRecurringLineItems, ...processedUnassociatedLineItems];


/**@type {Object.<string, ContactCategoryData>}*/
let processedContactData = processedData.processedContacts || {};




// TODO: rename and refactor
async function defineNetNewBySearch() {
    let netNewItemLineItemIds = [];
    let recurringLineItemIds = [];
    let missingPropertySearchConfig = {
        objectType: 'lineItems',
        propertyFilters: {
            'is_net_new': ['NOT_HAS_PROPERTY']
        },
        responseProperties: ['hs_object_id', 'is_net_new', 'hs_sku', 'name'],
        searchLimit: SEARCH_LIMIT,
        after: 0
    }
    let searchResults = await searchObjectByProperty(missingPropertySearchConfig);
    console.log(`searchResults.total: ${searchResults.total}`);
    let searchIndex = 0;
    while (searchResults && searchResults.after && searchIndex < MAX_NUM_SEARCHES) {
        console.log(`Search ${searchIndex+1} of ${MAX_NUM_SEARCHES}\nAfter: ${searchResults.after}`);
        searchIndex++;
        let unprocessedLineItemIds = searchResults.objectIds;
        for (let lineItemId of unprocessedLineItemIds) {
            let netNewData = await identifyNetNewPropertyOfLineItem({lineItemId});
            if (!netNewData) {
                console.log(`<< Error in main(): Unable to identify Net New Property Of Searched Line Item: ${lineItemId}`);
                continue;
            }
            netNewItemLineItemIds.push(...netNewData.netNewLineItems);
            recurringLineItemIds.push(...netNewData.recurringLineItems);
        }
        await delay(1000);
        missingPropertySearchConfig.after = searchResults.after;
        searchResults = await searchObjectByProperty(missingPropertySearchConfig);
    }
    if (netNewItemLineItemIds.length === 0 && recurringLineItemIds.length === 0) {
        console.log('<< No line items processed');
        return;
    }
    setNetNewPropertyOfLineItemIds({netNewLineItems: netNewItemLineItemIds, recurringLineItems: recurringLineItemIds});
    processedNetNewLineItems.push(...netNewItemLineItemIds);
    processedRecurringLineItems.push(...recurringLineItemIds);
    saveNetNewDataToLocalFile({
        compositeData: {
            netNewLineItems: processedNetNewLineItems,
            recurringLineItems: processedRecurringLineItems,
            unassociatedLineItems: processedUnassociatedLineItems,
            processedContacts: processedContactData
        }
    });

}

/**
 * Fetches associated contact of deal.
 * if contactId exists in local data, process line item and update local data
 * else, identify net new line items of contact and add to local data
 * @param {DealIdConfig} ParamObject DealIdConfig = { lineItemId }
 * @param {string} dealId string
 * 
 * @returns {NetNewDataConfig} netNewData — NetNewDataConfig
 */
export async function identifyNetNewLineItemsOfDeal({dealId}) {
    /** @type {NetNewDataConfig} @see NetNewDataConfig */
    let netNewData = {// NetNewDataConfig
        contactId: undefined,
        contactName: undefined,
        categoriesBought: {},
        skuHistory: {},
        netNewLineItems: [],
        recurringLineItems: []
    };
    try {
        const dealResponse = await getDealById({ dealId: dealId, associations: ['contacts'] });
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
        let lineItemData = lineItemResponse.properties;
        let dealData = dealResponse.properties;
        if (Array.from(Object.keys(processedContactData)).includes(contactId)){
            let localContactData = processedContactData[contactId];
            let skuHistory = localContactData.skuHistory;
            let categoriesBought = localContactData.categoriesBought;
            let updatedLocalContactData = processLineItem({
                lineItemData, dealData, categoriesBought, skuHistory
            });
            netNewData = {
                contactId: contactId,
                contactName: localContactData.contactName,
                categoriesBought: updatedLocalContactData.categoriesBought,
                skuHistory: updatedLocalContactData.skuHistory,
                netNewLineItems: updatedLocalContactData.netNewLineItems,
                recurringLineItems: updatedLocalContactData.recurringLineItems,
            };

        } else {
            netNewData = await identifyNetNewLineItemsOfContact({contactId: contactId});
        }
        updateLocalNetNewDataOfContact(netNewData);
    } catch (e) {
        console.error('<< Error in defineNetNewPropertyOfLineItem():', e);
    }
    return netNewData;
}

/**
 * Fetches associated deal of line item, then fetches associated contact of deal.
 * if contactId exists in local data, process line item and update local data
 * else, identify net new line items of contact and add to local data
 * @param {LineItemIdConfig} ParamObject LineItemIdConfig = { lineItemId }
 * @param {string} lineItemId string
 * 
 * @returns {NetNewDataConfig} netNewData — NetNewDataConfig
 */
export async function identifyNetNewPropertyOfLineItem({lineItemId}) {
    let netNewData = {// NetNewDataConfig
        contactId: undefined,
        contactName: undefined,
        categoriesBought: {},
        skuHistory: {},
        netNewLineItems: [],
        recurringLineItems: []
    }; 
    try {
        const lineItemResponse = await getLineItemById({ lineItemId: lineItemId, associations: ['deals'] });
        if (!lineItemResponse) {
            console.error(`<< lineItemResponse for ${lineItemId} is null or undefined`);
        } else if (!lineItemResponse.associations || !lineItemResponse.associations.deals || !lineItemResponse.associations.deals.results) {
            console.log(`<< lineItemResponse for ${lineItemId} has no associated deals`);
            processedUnassociatedLineItems.push(lineItemId);
            await setPropertyByObjectId({
                objectType: 'lineItems',
                objectId: lineItemId,
                properties: {
                    'is_net_new': 'Not Applicable'
                }
            });
        } else {
            let dealId = lineItemResponse.associations.deals.results[0].id;
            netNewData = await identifyNetNewLineItemsOfDeal({dealId: dealId});
        }
    } catch (e) {
        console.error('<< Error in defineNetNewPropertyOfLineItem():', e);
    }
    return netNewData;
}

/**
 * 
 * @param {ContactIdConfig} ParamObject ContactIdConfig = { contactId }
 * @param {string} contactId string 
 * 
 * @returns {NetNewDataConfig} netNewData — NetNewDataConfig
 */
async function identifyNetNewLineItemsOfContact({contactId}) {
    if (!contactId) {
        console.error(`<< Error in identifyNetNewLineItemsOfContact({contactId}): contactId is undefined`);
        return;
    }
    let contactName = '';
    let categoriesBought = {}; // map category to dealId in which category was first bought
    let skuHistory = {};
    let netNewLineItems = [];
    let recurringLineItems = [];
    try {
        const contactResponse = await getContactById({ contactId: contactId, associations: ['deals'] });
        const contactData = contactResponse.properties;
        contactName = `${contactData.firstname} ${contactData.lastname}`;
        let associatedDealsOfContact = contactResponse.associations.deals.results;
        let associatedDealIds = associatedDealsOfContact.map(deal => deal.id);
        
        // TODO: add logic to handle processedData

        let chronologicalDealIds = associatedDealIds.length > 0 
            ? await sortDealsChronologically(associatedDealIds)
            : [];
        for (let [index, dealId] of chronologicalDealIds.entries()) {
            const dealResponse = await getDealById({ dealId: dealId, associations: ['line_items'] });
            let dealData = dealResponse.properties; 
            
            let isMissingLineItems = dealResponse && dealResponse.associations && (dealResponse.associations.length === 0 || !Object.keys(dealResponse.associations).includes('line items') || !dealResponse.associations['line items']);
            let isClosedDeal = dealData.dealstage === VALID_DEAL_STAGES.includes(dealData.dealstage)  || !INVALID_DEAL_STAGES.includes(dealData.dealstage);
            if (isMissingLineItems) {
                console.error(`<< Deal ${dealData.dealname} has no line items`);
                console.log('dealResponse.associations:', dealResponse.associations);
                continue;
            } else if (!isClosedDeal) {
                continue;
            }    
            let lineItemIds = dealResponse.associations 
                ? dealResponse.associations['line items'] || dealResponse.associations['line_items'] 
                : { results: [] };     
            lineItemIds = lineItemIds.results.map(associatedLineItem => associatedLineItem.id);
            for (let lineItemId of lineItemIds) {
                let lineItemResponse = await getLineItemById({ lineItemId: lineItemId });
                let lineItemData = lineItemResponse.properties;
                let updatedLocalData = processLineItem({
                    lineItemData, dealData, categoriesBought, skuHistory
                });
                categoriesBought = updatedLocalData.categoriesBought;
                skuHistory = updatedLocalData.skuHistory;
                netNewLineItems.push(...updatedLocalData.netNewLineItems);
                recurringLineItems.push(...updatedLocalData.recurringLineItems);
            }
        }        
    } catch (e) {
        console.error('<< Error in identifyNetNewLineItemsOfContact():', e);
    }

    /**@type {NetNewDataConfig} */
    let netNewData = {
        contactId: contactId,
        contactName: contactName,
        categoriesBought: categoriesBought,
        skuHistory: skuHistory, 
        netNewLineItems: Array.from(new Set(netNewLineItems)), // remove duplicates
        recurringLineItems: Array.from(new Set(recurringLineItems))
    };
    return netNewData;
}

/**
 * @param {NetNewDataConfig} data 
 * @returns {void} 
 */
function updateLocalNetNewDataOfContact(data) {
    try {
        let contactId = data && data.contactId ? data.contactId : undefined;
        if (!contactId) {
            console.error(`<< Error in updateLocalNetNewDataOfContact(data={contactId=${contactId}, contactName:${data.contactName}, ...}): contactId is undefined`);
            return;
        }
        processedContactData[contactId] = {
            contactId: contactId,
            contactName: data.contactName,
            categoriesBought: data.categoriesBought, 
            skuHistory: data.skuHistory
        };
        processedNetNewLineItems.push(...data.netNewLineItems);
        processedRecurringLineItems.push(...data.recurringLineItems);
    } catch (e) {
        console.error(`<< Error in updateLocalNetNewDataOfContact(data={contactId: ${contactId}, contactName: ${data.contactName}, ...}):`, e);
    }
}



/**
 * 
 * @param {LineItemProcessConfig} ParamObject LineItemProcessConfig = { lineItemData, dealData, skuHistory, categoriesBought }
 * @param {Object.<string, any>} lineItemData Object.<string, any>
 * @param {Object.<string, any>} dealData Object.<string, any>
 * @param {Object.<string, string>} categoriesBought Object.<string, string>; 
 * @param {Object.<string, SkuData>} skuHistory {[k: string]: {@link SkuData}}
 * 
 * @returns {NetNewDataConfigSubset} updatedLocalContactData — {@link NetNewDataConfigSubset}
*/
function processLineItem({lineItemData, dealData, categoriesBought, skuHistory}) {
    let netNewLineItems = [];
    let recurringLineItems = [];
    let lineItemId = lineItemData.hs_object_id;
    let sku = extractSkuFromLineItem({lineItemData});
    let price = Number(lineItemData.price) || 0;
    if (isValidLineItem({sku, price, dealstage: dealData.dealstage})) {
        skuHistory = updateSkuHistory({skuHistory, sku, lineItemData, dealData});
        let dealId = dealData.hs_object_id;
        let info = extractCategoryInfo({sku, categoriesBought, dealId});
        if (info.isFirstDealWithCategory) {
            netNewLineItems.push(lineItemId);
            categoriesBought[info.category] = dealId;
            printConsoleGroup({
                label: `Net New in Deal ${dealData.dealname} - ${toPacificTime(dealData.closedate)}`,
                logStatements: [`{ sku: ${sku}, price: $${price}, quantity: ${lineItemData.quantity}, dealstage: ${dealData.dealstage} }`],
                printToConsole: false,
                numTabs: 1
            });
        } else if (info.isStillFirstDealWithNewCategory) {
            netNewLineItems.push(lineItemId);
            printConsoleGroup({
                label: `Net New in Deal ${dealData.dealname} - ${toPacificTime(dealData.closedate)}`,
                logStatements: [`{ sku: ${sku}, price: $${price}, quantity: ${lineItemData.quantity}, dealstage: ${dealData.dealstage} }`],
                printToConsole: false,
                numTabs: 1
            });
        } else if (info.isRecurringDeal) {
            recurringLineItems.push(lineItemId);
        } else {
            console.log(`<< Deal ${dealData.dealname} has SKU ${sku} not found in any category from ${Object.keys(CATEGORY_TO_SKU_DICT)}`);
        }
    } else {
        printConsoleGroup({
            label: `Skipped Invalid Line Item in Deal ${dealData.dealname}:`, 
            logStatements:[`{sku: (\"${lineItemData.hs_sku}\") => \"${sku}\", price: $${price}, dealstage: ${dealData.dealstage}, lineItemId: ${lineItemData.hs_object_id}}`], 
            printToConsole: false,
            numTabs: 1
        });
        processedUnassociatedLineItems.push(lineItemId);
    }

    /**@type {NetNewDataConfigSubset} */
    let updatedLocalContactData = {
        categoriesBought, skuHistory, netNewLineItems, recurringLineItems
    };
    return updatedLocalContactData
}

async function main() {
    let filePath = `Path to json file`;

    /**@type {Array<string>} */
    let contactIds = getJsonFromFile(filePath).contactIds;
    console.log(`contactIds.length: ${contactIds.length}`);
    let contactIdSubset = contactIds.slice(1, 3);
    await updateContactLineItems(contactIdSubset, true);
}

/**
 * For each contact, identify the net new line items and recurring line items of their associated deals
 * Then call the HubSpot API to batch update the 'is_net_new' property of the line items
 * @param {Array<string>} contactIds Array\<string>
 * @param {boolean} enableConsoleLog boolean
 * @returns {void} 
 */
export async function updateContactLineItems(contactIds, enableConsoleLog) {
    let offset = 0;
    let contactBatches = partitionArrayBySize(contactIds, 50);

    for (let [batchIndex, contactIdSubset] of contactBatches.entries()) {
        console.log(`Processing batch ${batchIndex+1+offset} of ${contactBatches.length+offset}...`);
        let batchNetNewLineItems = [];
        let batchRecurringLineItems = [];
        for (let [subsetIndex, contactId] of contactIdSubset.entries()) {
            let data =  await identifyNetNewLineItemsOfContact({contactId: contactId});
            printConsoleGroup({
                label: `(${batchIndex+1+offset}-${subsetIndex+1}) Contact: ${contactId} - ${data.contactName}`, 
                logStatements: [
                    `Net New Line Item Count: ${data.netNewLineItems.length}`,
                    `Categories Bought:       [${Object.keys(data.categoriesBought).join(', ')}]`,
                    `SKUs Bought:             [${Object.keys(data.skuHistory).join(', ')}]\n`,
                ], 
                printToConsole: enableConsoleLog
            });
            updateLocalNetNewDataOfContact(data);
            batchNetNewLineItems.push(...data.netNewLineItems);
            batchRecurringLineItems.push(...data.recurringLineItems);
            await delay(1000);
        }
        setNetNewPropertyOfLineItemIds({
            netNewLineItems: batchNetNewLineItems, 
            recurringLineItems: batchRecurringLineItems
        });
        saveNetNewDataToLocalFile({
            compositeData: {
                netNewLineItems: processedNetNewLineItems,
                recurringLineItems: processedRecurringLineItems,
                unassociatedLineItems: processedUnassociatedLineItems,
                processedContacts: processedContactData
            }
        });
    }
}

/**
 * 
 * @param {NetNewDataOutputConfig} ParamObject NetNewDataOutputConfig = { compositeData, filePath }
 * @param {NetNewDataOutput} compositeData {@link NetNewDataOutput}
 * @param {string} filePath string - default: `DEFAULT_OUTPUT_FILE_PATH`
 * @returns {void}
 */
function saveNetNewDataToLocalFile({
    compositeData, 
    contactDataFilePath =`Path to contact data json file`, 
    lineItemFilePath =`Path to line item data json file`
}={}) {
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
    writeToJSONFile({data: compositeData.processedContacts, filePath: contactDataFilePath, enableOverwrite: true});
    writeToJSONFile({data: lineItemOutputData, filePath: lineItemFilePath, enableOverwrite: true});
}

/**
 * 
 * @param {SetNetNewConfig} ParamObject SetNetNewConfig = { netNewLineItems, recurringLineItems }
 * @param {Array<string>} netNewLineItems Array\<string>
 * @param {Array<string>} recurringLineItems Array\<string>
 * @returns {void} 
 */
async function setNetNewPropertyOfLineItemIds({netNewLineItems, recurringLineItems}) {
    // netNewLineItems = netNewLineItems.filter(lineItemId => !processedNetNewLineItems.includes(lineItemId));
    // recurringLineItems = recurringLineItems.filter(lineItemId => !processedRecurringLineItems.includes(lineItemId));
    await batchSetPropertyByObjectId({
        objectType: 'lineItems',
        objectIds: netNewLineItems,
        properties: {
            'is_net_new': 'True'
        }
    });
    await batchSetPropertyByObjectId({
        objectType: 'lineItems',
        objectIds: recurringLineItems,
        properties: {
            'is_net_new': 'False'
        }
    });
}



/**
 * 
 * @param {CategoryExtractConfig} ParamObject CategoryExtractConfig = { sku, categoriesBought, dealId }
 * @param {string} sku string
 * @param {Object.<string, string>} categoriesBought Object.<string, string>;
 * @param {string} dealId string 
 * @returns {CategoryExtractInfo} categoryInfo — {@link CategoryExtractInfo} 
*/
function extractCategoryInfo({sku, categoriesBought, dealId}) {
    let category = Object.keys(CATEGORY_TO_SKU_DICT).find(key => CATEGORY_TO_SKU_DICT[key].has(sku));
    let isFirstDealWithCategory = category && !categoriesBought.hasOwnProperty(category);
    let isStillFirstDealWithNewCategory = category && categoriesBought.hasOwnProperty(category) && dealId === categoriesBought[category];
    let isRecurringDeal = category && categoriesBought.hasOwnProperty(category) && dealId !== categoriesBought[category];
    let categoryInfo = { category, isFirstDealWithCategory, isStillFirstDealWithNewCategory, isRecurringDeal };
    return categoryInfo;
}



/**
 * 
 * @param {Array<any>} arr Array<any>
 * @param {Number} batchSize Number
 * @returns {Array<Array<any>>} batches — Array<Array\<any>>
 */
function partitionArrayBySize(arr, batchSize) {
    let batches = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}
