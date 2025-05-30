/**
 * @file src/utils/crm/types/NetNew.ts
 */

// SkuData ----------------
/**
 * @typedefn SkuData
 * @property {string} sku `string` `hs_sku` of the product
 * @property {string} [name] `string` name of the product, optional
 * @property {number} dealCount `number` unique dealId count == associatedDeals.size 
 * @property {number} quantity `number` total product quantity purchased
 * @property {number} amount `number` total dollar amount for sku
 * @property {Array<string>} associatedDeals `Array<string>` `hs_object_id` of all deals w/ sku
 * @property {Array<string>} associatedLineItems `Array<string>` `hs_object_id` of all line items w/ sku
 * @property {Date | string} firstPurchaseDate `lineItemData.createdate`, date of first deal containing sku, assume updateSkuHistory called chronologically
 */
export type SkuData = {
    sku: string;
    name?: string;
    dealCount: number;
    quantity: number;
    amount: number;
    associatedDeals: Array<string>;
    associatedLineItems: Array<string>;
    firstPurchaseDate: Date | string;
}

// NetNewDataConfig ----------------

/**
 * @typedefn `{Object}` `NetNewDataConfig`
 * @property {string} [contactId] `string` = `hs_object_id`
 * @property {string} [contactName] `string`
 * @property {Record<string, string>} categoriesBought
 * @property {Record<string, SkuData>} skuHistory `Record<string, `{@link SkuData}`>`
 * @property {Array<string>} netNewLineItems `Array<string>`
 * @property {Array<string>} recurringLineItems `Array<string>`
 */
export type NetNewDataConfig = {
    contactId?: string;
    contactName?: string;
    categoriesBought: Record<string, string>;
    skuHistory: Record<string, SkuData>;
    netNewLineItems: Array<string>;
    recurringLineItems: Array<string>;
}


/**
 * @typedefn `{Object}` `NetNewDataOutput`
 * @property {Array<string>} netNewLineItems `Array<string>`
 * @property {Array<string>} recurringLineItems `Array<string>`
 * @property {Array<string>} unassociatedLineItems `Array<string>`
 * @property {Record<string, ContactCategoryData>} processedContacts `Record<string, `{@link ContactCategoryData}`>`
 */

export type NetNewDataOutput = {
    netNewLineItems: Array<string>;
    recurringLineItems: Array<string>;
    unassociatedLineItems: Array<string>;
    processedContacts: Record<string, ContactCategoryData>;
}

// ContactCategoryData ----------------
/**
 * @typedefn `{Object} ContactCategoryData`
 * @property {string} contactId `string` = `hs_object_id`
 * @property {string} contactName `string`
 * @property {Record<string, string>} categoriesBought `Record<string, string>`
 * @property {Record<string, SkuData>} skuHistory `Record<string, {@link SkuData}>`
 */
export type ContactCategoryData = {
    contactId: string;
    contactName: string;
    categoriesBought: Record<string, string>;
    skuHistory: Record<string, SkuData>;
};



// CategoryExtractInfo ----------------
// used in extractCategoryInfo()
/**
 * @typedefn `{Object} CategoryExtractInfo`
 * @property {string} category `string`
 * @property {boolean} isFirstDealWithCategory `boolean`
 * @property {boolean} isStillFirstDealWithNewCategory `boolean`
 * @property {boolean} isRecurringDeal `boolean`
 * */
export type CategoryExtractInfo = {
    category: string;
    isFirstDealWithCategory: boolean;
    isStillFirstDealWithNewCategory: boolean;
    isRecurringDeal: boolean;
};