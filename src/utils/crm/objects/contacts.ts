/**
 * @file src/utils/crm/objects/contacts.ts
 */
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { getObjectById } from "./objects";
import { DEFAULT_CONTACT_PROPERTIES } from "../constants";

/**
 * @property {string} contactId `string` = `hs_object_id`
 * @property {string[]} properties `string[]` defaults to {@link DEFAULT_CONTACT_PROPERTIES}.
 * @property {string[]} propertiesWithHistory `string[]`
 * @property {Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS>} associations `Array<`{@link Associations.DEALS} | {@link Associations.COMPANIES} | {@link Associations.TICKETS}`>`defaults to [{@link Associations.DEALS}]
 * @property {boolean} archived `boolean` defaults to `false`.
 */
export type GetContactByIdParams = {
    contactId: string | number;
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS>;
    archived?: boolean;
};

/**
 * @param contactId `string` = `hs_object_id`
 * @param properties `string[]` defaults to {@link DEFAULT_CONTACT_PROPERTIES}.
 * @param propertiesWithHistory `string[]`
 * @param associations `Array<`{@link Associations.DEALS} | {@link Associations.COMPANIES} | {@link Associations.TICKETS}`>`defaults to [{@link Associations.DEALS}]
 * @param archived `boolean` defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The contact with the specified ID, or undefined if not found.
 */
export async function getContactById(
    contactId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

/**
 * @see {@link GetContactByIdParams}
 * @param params.contactId `string` = `hs_object_id`
 * @param params.properties `string[]` defaults to {@link DEFAULT_CONTACT_PROPERTIES}.
 * @param params.propertiesWithHistory `string[]`
 * @param params.associations `Array<`{@link Associations.DEALS} | {@link Associations.COMPANIES} | {@link Associations.TICKETS}`>`defaults to [{@link Associations.DEALS}]
 * @param params.archived `boolean` defaults to `false`.
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` 
 * - The contact with the specified ID, or undefined if not found.
 */
export async function getContactById(
    params: GetContactByIdParams
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined>;

export async function getContactById(
    contactIdOrParams: string | number | GetContactByIdParams,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS>,
    archived?: boolean
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into a single object
    const params = typeof contactIdOrParams === 'object' && 'contactId' in contactIdOrParams
        ? contactIdOrParams
        : {
            contactId: contactIdOrParams,
            properties,
            propertiesWithHistory,
            associations,
            archived
        };

    // Apply defaults and destructure
    const {
        contactId,
        properties: props = DEFAULT_CONTACT_PROPERTIES,
        propertiesWithHistory: historyProps,
        associations: assoc = [Associations.DEALS],
        archived: arch = false
    } = params;

    try {
        const response = await getObjectById(
            BasicCrmObjects.CONTACTS,
            contactId,
            props,
            historyProps,
            assoc,
            arch
        );
        return response;
    } catch (e) {
        console.error(`\t getContactById() Error retrieving contact with ID: ${contactId}`);
        return undefined;
    }
}