/** 
 * @file types.js
 */

// SkuData ----------------
/**
 *- sku: hs_sku
 *- dealCount: unique dealId count == associatedDeals.size 
 *- quantity: total product quantity
 *- amount: total dollar amount for sku
 *- associatedDeals: hs_object_id of all deals w/ sku
 *- associatedLineItems: hs_object_id of all line items w/ sku
 *- firstPurchaseDate: lineItemData.createdate, date of first deal containing sku, assume updateSkuHistory called chronologically
 * @typedef {Object} SkuData
 * @property {string} sku
 * @property {number} dealCount
 * @property {number} quantity
 * @property {number} amount
 * @property {Array<string>} associatedDeals
 * @property {Array<string>} associatedLineItems
 * @property {Date | string} firstPurchaseDate 
 */

// NetNewDataConfig ----------------
/**
 * skuHistory: Object<string, {@link SkuData}>
 * @typedef {Object} NetNewDataConfig
 * @property {string} contactId
 * @property {string} contactName
 * @property {Object.<string, string>} categoriesBought
 * @property {Object.<string, SkuData>} skuHistory
 * @property {Array<string>} netNewLineItems
 * @property {Array<string>} recurringLineItems
 */

// NetNewDataConfigSubset ----------------
/**
 * @TODO make this a parent class and have NetNewDataConfig extend it
 * @typedef {Object} NetNewDataConfigSubset
 * @property {Object.<string, string>} categoriesBought
 * @property {Object.<string, SkuData>} skuHistory
 * @property {Array<string>} netNewLineItems
 * @property {Array<string>} recurringLineItems
 */

/**
 * @typedef {Object} NetNewDataOutput
 * @property {Array<string>} netNewLineItems
 * @property {Array<string>} recurringLineItems
 * @property {Array<string>} unassociatedLineItems
 * @property {Object.<string, ContactCategoryData>} processedContacts
 */

// ContactCategoryData ----------------
/**
 * skuHistory: Object<string, {@link SkuData}>
 * @typedef {Object} ContactCategoryData
 * @property {string} contactId
 * @property {string} contactName
 * @property {Object.<string, string>} categoriesBought
 * @property {Object.<string, SkuData>} skuHistory
 */


// CategoryExtractInfo ----------------
// used in extractCategoryInfo()
/**
 * @typedef {Object} CategoryExtractInfo
 * @property {string} category
 * @property {boolean} isFirstDealWithCategory
 * @property {boolean} isStillFirstDealWithNewCategory
 * @property {boolean} isRecurringDeal
 */

// SearchResult ----------------
/**
* @typedef {Object} SearchResult
* @property {Array<string>} objectIds
* @property {Array<Object>} objects
* @property {Number} after
* @property {Number} total
*/