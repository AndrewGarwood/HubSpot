/**
 * @file src/api/crm/objects/lineItems.ts
 */
import { 
    ApiObjectEnum as CrmObjectEnum, 
    CrmAssociationObjectEnum as Associations, 
    SimplePublicObject, 
    SimplePublicObjectWithAssociations 
} from "../types";
import { getObjectById } from "./objects";
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from "../../../config/setupLog";
import { STOP_RUNNING } from "../../../config/env";
import { isNullLike } from "typeshi:utils/typeValidation";
import { getCategoryToSkuDict, getObjectPropertyDictionary } from "../../../config";
/**
 * @property {string} lineItemId `string` = `lineItem.hs_object_id`
 * @property {string[]} properties `string[]` defaults to {@link DEFAULT_LINE_ITEM_PROPERTIES}.
 * @property {string[]} propertiesWithHistory `string[]`
 * @property {Array<Associations.DEALS | Associations.PRODUCTS>} associations `Array<`{@link Associations.DEALS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.DEALS}]
 * @property **`archived`** `boolean` defaults to `false`.
 */
export type GetLineItemByIdParams = {
    lineItemId: string | number;
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: Array<Associations.DEALS | Associations.PRODUCTS>;
    archived?: boolean;
};

/**
 * @param lineItemId `string` = `hs_object_id`
 * @param properties `string[]` defaults to {@link DEFAULT_LINE_ITEM_PROPERTIES}.
 * @param propertiesWithHistory `string[]`
 * @param associations `Array<`{@link Associations.DEALS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.DEALS}]
 * @param archived `boolean` defaults to `false`.
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The line item with the specified ID, or undefined if not found.
 */
export async function getLineItemById(
    lineItemId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

/**
 * @see {@link GetLineItemByIdParams}
 * @param params.lineItemId `string` = `hs_object_id`
 * @param params.properties `string[]` defaults to {@link DEFAULT_LINE_ITEM_PROPERTIES}.
 * @param params.propertiesWithHistory `string[]`
 * @param params.associations `Array<`{@link Associations.DEALS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.DEALS}]
 * @param params.archived `boolean` defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The line item with the specified ID, or undefined if not found.
 */
export async function getLineItemById(
    params: GetLineItemByIdParams
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

export async function getLineItemById(
    /**lineItemIdOrParams: string | number | GetLineItemByIdParams */
    arg1: string | number | GetLineItemByIdParams,
    properties: string[] = getObjectPropertyDictionary().DEFAULT_LINE_ITEM_PROPERTIES ?? [],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.PRODUCTS>,
    archived: boolean=false
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into GetLineItemByIdParams
    const params = typeof arg1 === 'object' && 'lineItemId' in arg1
        ? arg1 as GetLineItemByIdParams
        : {
            lineItemId: arg1 as string,
            properties: properties || (getObjectPropertyDictionary().DEFAULT_LINE_ITEM_PROPERTIES ?? []),
            propertiesWithHistory: propertiesWithHistory || undefined,
            associations: associations || undefined,
            archived: archived || false
        } as GetLineItemByIdParams;
    try {
        const response = await getObjectById(
            CrmObjectEnum.LINE_ITEMS,
            params.lineItemId,
            params.properties,
            params.propertiesWithHistory,
            params.associations,
            params.archived,
        ) as SimplePublicObject | SimplePublicObjectWithAssociations;
        return response;
    } catch (e) {
        mlog.error(TAB + `getLineItemById() Error retrieving line item: '${params.lineItemId}'`);
        return undefined;
    }
}

/**
 * gets a cleaned-up `lineItem.properties.hs_sku` value
 * @param lineItem {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @returns **`sku`** = `string` | `undefined` - The SKU of the lineItem, or undefined if not found.
 */
export function getSkuFromLineItem(
    lineItem: SimplePublicObject | SimplePublicObjectWithAssociations
): string | undefined {
    if (!lineItem || !lineItem.properties) {
        mlog.error(`getSkuFromLineItem() Invalid lineItem provided.`,
            TAB+`Expected a SimplePublicObject or SimplePublicObjectWithAssociations.`
        );
        return;
    }
    let sku: string;
    try {
        sku = String(lineItem.properties.hs_sku);
        if (sku && sku.includes(' - ')) {
            sku = sku.split(' - ')[1] 
        } else if (sku && sku.includes('-Lot')) {
            sku = sku.split('-Lot')[0]
        } else if (sku && sku.includes(' ')) { 
            sku.split(' ')[0];
        }
        return sku;
    } catch (e) {
        mlog.error(`getSkuFromLineItem() Error extracting SKU from lineItem:`, e);
        return;
    }
}

/**
 * `Overload 1`: arg1 is object and arg2 is object
 * @param lineItem {@link SimplePublicObjectWithAssociations}
 * @param deal {@link SimplePublicObjectWithAssociations}
 * @returns **`isValid`** — `boolean`
 */
export function isValidLineItem(
    lineItem: SimplePublicObjectWithAssociations,
    deal: SimplePublicObjectWithAssociations
): boolean

/**
 * `Overload 2`: arg1 is string and arg2 is number and arg3 is string
 * @param sku `string`
 * @param price `number`
 * @param dealStage `string`
 * @returns **`isValid`** — `boolean`
 */
export function isValidLineItem(
    sku: string, 
    price: number, 
    dealStage: string
): boolean 

/**
 * @param arg1 {@link SimplePublicObjectWithAssociations} | `string`
 * @param arg2 {@link SimplePublicObjectWithAssociations} | `number`
 * @param arg3 `string`
 * @returns **`isValid`** — `boolean`
 */
export function isValidLineItem(
    /**lineItem object or sku string*/    
    arg1: SimplePublicObjectWithAssociations | string,
    /**deal object or price number*/ 
    arg2?: SimplePublicObjectWithAssociations | number, 
    arg3?: any
): boolean {
    let sku: string | undefined;
    let price: number = 0;
    let dealStage: string = '';
    const paramsAreObjects = Boolean(
        typeof arg1 === 'object' && 'properties' in arg1
        && arg2 && typeof arg2 === 'object' && 'properties' in arg2
    );
    const paramsAreValidPrimitives = Boolean(
        typeof arg1 === 'string'
        && typeof arg2 === 'number'
        && typeof arg3 === 'string'
    );
    if (paramsAreObjects) {
        const lineItem = arg1 as SimplePublicObjectWithAssociations;
        const deal = arg2 as SimplePublicObjectWithAssociations;
        sku = getSkuFromLineItem(lineItem);
        price = Number(lineItem.properties.price || 0);
        dealStage = String(deal.properties.dealstage || '');
    } else if (paramsAreValidPrimitives) {
        sku = arg1 as string;
        price = arg2 as number;
        dealStage = arg3 as string;
    } else {
        mlog.error(`isValidLineItem() Invalid arguments provided. Expected either of these signatures:`,
            TAB + `1. isValidLineItem(lineItem: SimplePublicObjectWithAssociations, deal: SimplePublicObjectWithAssociations)`,
            TAB + `2. isValidLineItem(sku: string, price: number, dealStage: string)`,
            ` -> returning false`
        );
        return false; 
    }
    let isValid: boolean = Boolean(!isNullLike(sku) 
        && price > 0 
        && !getCategoryToSkuDict().Marketing.has(sku as string) 
        && !(sku as string).startsWith('MM-') 
        && (getObjectPropertyDictionary().VALID_DEAL_STAGES.includes(dealStage) 
        || !getObjectPropertyDictionary().INVALID_DEAL_STAGES.includes(dealStage))
    );
    return isValid;
}