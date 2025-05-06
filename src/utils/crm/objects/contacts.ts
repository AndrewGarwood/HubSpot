/**
 * @file src/utils/crm/objects/contacts.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_CONTACT_PROPERTIES } from "../constants";

/**
 * 
 * @param contactId `hs_object_id`
 * @param properties defaults to {@link DEFAULT_CONTACT_PROPERTIES}.
 * @param propertiesWithHistory 
 * @param associations defaults to [{@link Associations.DEALS}].
 * @param archived defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The contact with the specified ID, or undefined if not found.
 */
export async function getContactById(
    contactId: string | number,
    properties: string[] = DEFAULT_CONTACT_PROPERTIES,
    propertiesWithHistory?: string[],
    associations: Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS> = [Associations.DEALS],
    archived: boolean = false,
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    try {
        let response = await getObjectById(
            BasicCrmObjects.CONTACTS,
            contactId,
            properties,
            propertiesWithHistory,
            associations,
            archived,
        );
        return response;
    } catch (e) {
        console.error(`\t getContactById() Error retrieving contact with ID: ${contactId}`);
        return undefined;
    }
}