/**
 * @file src/utils/crm/types/Crm.ts
 */
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";

// @reference \node_modules\@hubspot\api-client\lib\codegen\crm\objects\models\Filter.d.ts
/**
 * @interface Filter
 * @property {string} propertyName - `string` - The name of the property to filter by.
 * @property {FilterOperatorEnum} operator - see {@link FilterOperatorEnum}
 * @property {string} [value] - `string`
 * @property {string} [highValue] - `string`
 * @property {Array<string>} [values] - `Array<string>`
 */
export declare interface Filter {
    propertyName: string;
    operator: FilterOperatorEnum;
    value?: string;
    highValue?: string;
    values?: Array<string>;
}

/**
 * @interface FilterGroup
 * @property {Array<Filter>} filters `Array<`{@link Filter}`>`
 */
export declare interface FilterGroup {
    filters: Array<Filter>;
}


/**
 * @interface PublicObjectSearchRequest
 * @property {string} [query] `string`
 * @property {number} [limit] `number`
 * @property {string | number} [after] `string | number`
 * @property {Array<string>} [sorts] `Array<string>`
 * @property {Array<string>} [properties] `Array<string>`
 * @property {Array<FilterGroup>} [filterGroups] `Array<`{@link FilterGroup}`>` = `Array<Array<`{@link Filter}`>>`    
 */
export declare interface PublicObjectSearchRequest {
    query?: string;
    limit?: number;
    after?: string | number;
    sorts?: Array<string>;
    properties?: Array<string>;
    filterGroups?: Array<FilterGroup>;
}
/**
 * To include multiple filter criteria, you can group filters within filterGroups:
 * To apply AND logic, include a comma-separated list of conditions within one set of filters.
 * To apply OR logic, include multiple filters within a filterGroup.
 * You can include a maximum of five filterGroups with up to 6 filters in each group, 
 * with a maximum of 18 filters in total. If you've included too many groups 
 * or filters, you'll receive a VALIDATION_ERROR error response.
 * */
/**
 * @typedefn `{Object}` `PublicObjectSearchResponse`
 */
export type PublicObjectSearchResponse = {
    objectIds: Array<string>;
    objects: Array<SimplePublicObject>;
    after: string | number;
    total: number;
}

/**
 * strings used as dictionary keys to access different parts of the CRM API with `hubspotClient`.
 * @example 
 * hubspotClient.crm[CrmObjectWithBasicApiEndpointEnum.CONTACTS].basicApi 
 * // is equivalent to 
 * hubspotClient.crm.contacts.basicApi
 * @enum {string} `CrmObjectWithBasicApiEndpointEnum`
 * @readonly
 * @property {string} CONTACTS
 * @property {string} DEALS
 * @property {string} COMPANIES
 * @property {string} PRODUCTS
 * @property {string} LINE_ITEMS - `lineItems`
 * @property {string} TICKETS
 */
export enum CrmObjectWithBasicApiEndpointEnum {
    CONTACTS = 'contacts',
    DEALS = 'deals',
    COMPANIES = 'companies',
    PRODUCTS = 'products',
    LINE_ITEMS = 'lineItems',
    TICKETS = 'tickets'
}

/**
 * @enum {string} `CrmAssociationObjectEnum`
 * @readonly
 * @property {string} CONTACTS
 * @property {string} DEALS
 * @property {string} COMPANIES
 * @property {string} PRODUCTS
 * @property {string} LINE_ITEMS - `line_items`
 * @property {string} TICKETS
 */
export enum CrmAssociationObjectEnum {
    CONTACTS = 'contacts',
    DEALS = 'deals',
    COMPANIES = 'companies',
    PRODUCTS = 'products',
    LINE_ITEMS = 'line_items',
    TICKETS = 'tickets'
}

/**
 * @enum {string} `FilterOperatorEnum`
 * @readonly
 * @property {string} LESS_THAN - Less than the specified value.
 * @property {string} LESS_THAN_OR_EQUAL_TO - Less than or equal to the specified value.
 * @property {string} GREATER_THAN - Greater than the specified value.
 * @property {string} GREATER_THAN_OR_EQUAL_TO - Greater than or equal to the specified value.
 * @property {string} EQUAL_TO - Equal to the specified value.
 * @property {string} NOT_EQUAL_TO - Not equal to the specified value.
 * @property {string} BETWEEN - Within the specified range. In your request, use key-value pairs to set highValue and value. Refer to the example below the table.
 * @property {string} IN - Included within the specified list. Searches by exact match. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase. Refer to the example below the table.
 * @property {string} NOT_IN - Not included within the specified list. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase.
 *--  IN / NOT_IN for enumeration properties only?
 * @property {string} HAS_PROPERTY - Has a value for the specified property.
 * @property {string} NOT_HAS_PROPERTY - Doesn't have a value for the specified property.
 * @property {string} CONTAINS_TOKEN - Contains a token. In your request, you can use wildcards (*) to complete a partial search. For example, use the value *@hubspot.com to retrieve contacts with a HubSpot email address.
 * @property {string} NOT_CONTAINS_TOKEN - Doesn't contain a token.
 */
export enum FilterOperatorEnum {
    LESS_THAN = 'LT',
    LESS_THAN_OR_EQUAL_TO = 'LTE',
    GREATER_THAN = 'GT',
    GREATER_THAN_OR_EQUAL_TO = 'GTE',
    EQUAL_TO = 'EQ',
    NOT_EQUAL_TO = 'NEQ',
    BETWEEN = 'BETWEEN',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    HAS_PROPERTY = 'HAS_PROPERTY',
    NOT_HAS_PROPERTY = 'NOT_HAS_PROPERTY',
    CONTAINS_TOKEN = 'CONTAINS_TOKEN',
    NOT_CONTAINS_TOKEN = 'NOT_CONTAINS_TOKEN'
}
