/**
 * @file src/crm/objects/lineItems.ts
 */
import { 
    CrmObjectEnum, 
    CrmAssociationObjectEnum as Associations, 
    SimplePublicObject, 
    SimplePublicObjectWithAssociations 
} from "../types/Crm";
import { getObjectById } from "./objects";
import { DEFAULT_LINE_ITEM_PROPERTIES, VALID_DEAL_STAGES, INVALID_DEAL_STAGES } from "../constants";
import { CATEGORY_TO_SKU_DICT } from "../../config/loadData";
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL, indentedStringify } from "../../config/setupLog";
import { STOP_RUNNING } from "../../config/env";
import { isNullLike } from "../../utils/typeValidation";
/**
 * @property {string} lineItemId `string` = `hs_object_id`
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
    properties: string[] = DEFAULT_LINE_ITEM_PROPERTIES,
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.PRODUCTS>,
    archived: boolean=false
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into GetLineItemByIdParams
    const params = typeof arg1 === 'object' && 'lineItemId' in arg1
        ? arg1 as GetLineItemByIdParams
        : {
            lineItemId: arg1 as string,
            properties: properties || DEFAULT_LINE_ITEM_PROPERTIES,
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
    let props = lineItem.properties;
    try {
        sku = String(props.hs_sku);
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
 * @param sku `string`
 * @param price `number`
 * @param dealstage `string`
 * @returns **`isValid`** — `boolean`
 */
export function isValidLineItem(sku: string, price: number, dealstage: string): boolean {
    let isValid: boolean = Boolean(!isNullLike(sku) 
        && price > 0 
        && !CATEGORY_TO_SKU_DICT.Marketing.has(sku) 
        && !sku.startsWith('MM-') 
        && (VALID_DEAL_STAGES.includes(dealstage) || !INVALID_DEAL_STAGES.includes(dealstage))
    );
    return isValid;
}