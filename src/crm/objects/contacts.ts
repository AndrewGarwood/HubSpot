/**
 * @file src/crm/objects/contacts.ts
 */
import { CrmObjectEnum as BasicCrmObjects, CrmAssociationObjectEnum as Associations, SimplePublicObject, SimplePublicObjectWithAssociations } from "../types/Crm";
import { getObjectById } from "./objects";
import { DEFAULT_CONTACT_PROPERTIES } from "../constants";
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL, indentedStringify } from "../../config/setupLog";

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
    /**string | number | GetContactByIdParams */
    arg1: string | number | GetContactByIdParams,
    properties: string[] = DEFAULT_CONTACT_PROPERTIES,
    propertiesWithHistory?: string[],
    associations: Array<Associations.DEALS | Associations.COMPANIES | Associations.TICKETS>=[Associations.DEALS],
    archived: boolean = false
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    // Normalize parameters into a single object
    const params = typeof arg1 === 'object' && 'contactId' in arg1
        ? arg1 as GetContactByIdParams // if params passed as an object, assume it's GetContactByIdParams use it directly
        : { // if params passed indivudually, assign them to params and handle defaults
            contactId: arg1,
            properties: properties || DEFAULT_CONTACT_PROPERTIES,
            propertiesWithHistory: propertiesWithHistory || undefined,
            associations: associations || [Associations.DEALS],
            archived: archived || false
        } as GetContactByIdParams;
    try {
        const response = await getObjectById(
            BasicCrmObjects.CONTACTS,
            params.contactId,
            params.properties,
            params.propertiesWithHistory,
            params.associations,
            params.archived
        ) as SimplePublicObject | SimplePublicObjectWithAssociations;
        return response;
    } catch (e) {
        mlog.error(`getContactById() Error retrieving contact with ID: ${params.contactId}`);
        return undefined;
    }
}