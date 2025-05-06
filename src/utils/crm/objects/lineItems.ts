/**
 * @file src/utils/crm/objects/lineItems.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_LINE_ITEM_PROPERTIES, VALID_DEAL_STAGES, INVALID_DEAL_STAGES } from "../constants";
import { CATEGORY_TO_SKU_DICT } from "../../../config/loadData";

/**
 * @param lineItemId `hs_object_id`
 * @param properties defaults to {@link DEFAULT_LINE_ITEM_PROPERTIES}.
 * @param propertiesWithHistory 
 * @param associations defaults to [{@link Associations.DEALS}].
 * @param archived defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The lineItem with the specified ID, or undefined if not found.
 */
export async function getLineItemById(
    lineItemId: string | number,
    properties: string[] = DEFAULT_LINE_ITEM_PROPERTIES,
    propertiesWithHistory?: string[],
    associations: Array<Associations.DEALS | Associations.PRODUCTS> = [Associations.DEALS],
    archived: boolean = false,
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    try {
        let response = await getObjectById(
            BasicCrmObjects.LINE_ITEMS,
            lineItemId,
            properties,
            propertiesWithHistory,
            associations,
            archived,
        );
        return response;
    } catch (e) {
        console.error(`\t getLineItemById() Error retrieving lineItem with ID: ${lineItemId}`);
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