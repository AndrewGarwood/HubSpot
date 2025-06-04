/**
 * @file src/crm/types/NetNew.ts
 */

// SkuData ----------------
/**
 * @typedefn **`SkuData`**
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

// PurchaseHistory ----------------
/**
 * @typedefn **`PurchaseHistory`**
 * @property {string} [contactId] `string` = `hs_object_id`
 * @property {string} [contactName] `string`
 * @property {Partial<Record<ProductCategoryEnum, string>>} categoriesBought `Partial<Record<`{@link ProductCategoryEnum}, `string>>` dict mapping category to dealId in which category was first bought
 * @property {Record<string, SkuData>} skuHistory `Record<string, `{@link SkuData}`>`
 */
export type PurchaseHistory = {
    contactId?: string;
    contactName?: string;
    /** dict mapping {@link ProductCategoryEnum} to dealId in which category was first bought */
    categoriesBought: Partial<Record<ProductCategoryEnum, string>>;
    skuHistory: Record<string, SkuData>;
    netNewLineItems: Array<string>;
    recurringLineItems: Array<string>;  
}
/**
 * @enum {string} **`NetNewValueEnum`**
 * @property {string} TRUE `'True'`
 * @property {string} FALSE `'False'`
 * @property {string} NOT_APPLICABLE `'Not Applicable'`
 */
export enum NetNewValueEnum {
    TRUE = 'True',
    FALSE = 'False',
    NOT_APPLICABLE = 'Not Applicable',
}

// CategoryHistory ----------------
/**
 * @typedefn **`CategoryHistory`**
 * @property {string} contactId `string` = `hs_object_id`
 * @property {string} contactName `string`
 * @property {Record<string, string>} categoriesBought `Record<`{@link ProductCategoryEnum}, `string>` dict mapping category to dealId in which category was first bought
 * @property {Record<string, SkuData>} skuHistory `Record<string, {@link SkuData}>`
 */
export type CategoryHistory = {
    contactId: string;
    contactName: string;
    /**dict mapping category to dealId in which category was first bought */
    categoriesBought: Record<ProductCategoryEnum, string>;
    skuHistory: Record<string, SkuData>;
};



// DealCategorization ----------------
// used in extractCategoryInfo()
/**
 * @typedefn **`DealCategorization`**
 * @property {string} category `string`
 * @property {boolean} isFirstDealWithCategory `boolean`
 * @property {boolean} isStillFirstDealWithNewCategory `boolean`
 * @property {boolean} isRecurringDeal `boolean`
 * */
export type DealCategorization = {
    category: string;
    isFirstDealWithCategory: boolean;
    isStillFirstDealWithNewCategory: boolean;
    isRecurringDeal: boolean;
};

/**
 * @enum {string} **`ProductCategoryEnum`**
 */
export enum ProductCategoryEnum {
    CATEGORY_A = 'CATEGORY_A',
}