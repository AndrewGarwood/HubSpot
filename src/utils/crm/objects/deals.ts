/**
 * @file src/utils/crm/objects/deals.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_DEAL_PROPERTIES } from "../constants";

/**
 * @param dealId `hs_object_id`
 * @param properties defaults to {@link DEFAULT_DEAL_PROPERTIES}.
 * @param propertiesWithHistory 
 * @param associations defaults to [{@link Associations.LINE_ITEMS}].
 * @param archived defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The deal with the specified ID, or undefined if not found.
 */
export async function getDealById(
    dealId: string | number,
    properties: string[] = DEFAULT_DEAL_PROPERTIES,
    propertiesWithHistory?: string[],
    associations: Array<Associations.LINE_ITEMS | Associations.CONTACTS | Associations.PRODUCTS> = [Associations.LINE_ITEMS],
    archived: boolean = false,
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    try {
        let response = await getObjectById(
            BasicCrmObjects.DEALS,
            dealId,
            properties,
            propertiesWithHistory,
            associations,
            archived,
        );
        return response;
    } catch (e) {
        console.error(`\t getDealById() Error retrieving deal with ID: ${dealId}`);
        return undefined;
    }
}