/**
 * @file src/utils/crm/objects/lineItems.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_LINE_ITEM_PROPERTIES, VALID_DEAL_STAGES, INVALID_DEAL_STAGES } from "../constants";
import { CATEGORY_TO_SKU_DICT } from "../../../config/loadData";

/**
 * @property {string} lineItemId `string` = `hs_object_id`
 * @property {string[]} properties `string[]` defaults to {@link DEFAULT_LINE_ITEM_PROPERTIES}.
 * @property {string[]} propertiesWithHistory `string[]`
 * @property {Array<Associations.DEALS | Associations.PRODUCTS>} associations `Array<`{@link Associations.DEALS} | {@link Associations.PRODUCTS}`>`defaults to [{@link Associations.DEALS}]
 * @property {boolean} archived `boolean` defaults to `false`.
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
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
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
    lineItemIdOrParams: string | number | GetLineItemByIdParams,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.PRODUCTS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into a single object
    const params = typeof lineItemIdOrParams === 'object' && 'lineItemId' in lineItemIdOrParams
        ? lineItemIdOrParams
        : {
            lineItemId: lineItemIdOrParams,
            properties,
            propertiesWithHistory,
            associations,
            archived
        };

    // Apply defaults and destructure
    const {
        lineItemId,
        properties: props = DEFAULT_LINE_ITEM_PROPERTIES,
        propertiesWithHistory: historyProps,
        associations: assoc = [Associations.DEALS],
        archived: arch = false
    } = params;

    try {
        const response = await getObjectById(
            BasicCrmObjects.LINE_ITEMS,
            lineItemId,
            props,
            historyProps,
            assoc,
            arch
        );
        return response;
    } catch (e) {
        console.error(`\t getLineItemById() Error retrieving line item with ID: ${lineItemId}`);
        return undefined;
    }
}

/**
 * 
 * @param lineItem {@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations}
 * @returns `sku` = `string` | `undefined` - The SKU of the lineItem, or undefined if not found.
 */
export function getSkuFromLineItem(lineItem: SimplePublicObject | SimplePublicObjectWithAssociations): string | undefined {
    if (!lineItem || !lineItem.properties) {
        console.error(`getSkuFromLineItem() Invalid lineItem provided. Expected a SimplePublicObject or SimplePublicObjectWithAssociations.`);
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
        console.error(`getSkuFromLineItem() Error extracting SKU from lineItem:`, e);
        return undefined;
    }
}
/**
 * 
 * @param {string} sku `string`
 * @param {number} price `number`
 * @param {string} dealstage `string` 
 * 
 * @returns {boolean} `isValid` — `boolean`
 */
export function isValidLineItem(sku: string, price: number, dealstage: string): boolean {
    let isValid: boolean = sku !== null
        && sku !== undefined
        && sku !== '' 
        && price > 0 
        && !CATEGORY_TO_SKU_DICT.Marketing.has(sku) 
        && !sku.startsWith('MM-') 
        && (VALID_DEAL_STAGES.includes(dealstage) || !INVALID_DEAL_STAGES.includes(dealstage))
    return isValid;
}