/**
 * @file src/api/crm/types/NetNew.ts
 */

// SkuData ----------------
/**
 * @typedefn **`SkuData`**
 * @property {string} sku `string` `hs_sku` of the product
 * @property {string} name `string` name of the product, optional
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
export type PurchaseHistory = {
    contactId?: string;
    contactName?: string;
    /** dict mapping `productCategory: string` to `dealId: string` in which category was first bought */
    categoriesBought: { [category: string]: string };
    skuHistory: Record<string, SkuData>;
    netNewLineItems: Array<string>;
    recurringLineItems: Array<string>;  
}
/**
 * @enum {string} **`NetNewValueEnum`**
 */
export enum NetNewValueEnum {
    TRUE = 'True',
    FALSE = 'False',
    NOT_APPLICABLE = 'Not Applicable',
}

// DealCategorization ----------------
/**
 * @typedefn **`DealCategorization`**
 * */
export type DealCategorization = {
    category: string;
    isFirstDealWithCategory: boolean;
    isStillFirstDealWithNewCategory: boolean;
    isRecurringDeal: boolean;
};