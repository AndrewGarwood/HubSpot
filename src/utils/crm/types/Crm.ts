/**
 * @file src/utils/crm/types/Crm.ts
 */

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
 * @interface Filter
 * @property {string} propertyName
 * @property {FilterOperatorEnum} operator - see {@link FilterOperatorEnum}
 * @property {string} [value]
 * @property {string} [highValue]
 * @property {Array<string>} [values]
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
 * @property {string} [query]
 * @property {number} [limit]
 * @property {string} [after]
 * @property {Array<string>} [sorts]
 * @property {Array<string>} [properties]
 * @property {Array<FilterGroup>} [filterGroups] `Array<`{@link FilterGroup}`>`
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
export declare enum FilterOperatorEnum {
    LESS_THAN = 'LESS_THAN',
    LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO',
    GREATER_THAN = 'GREATER_THAN',
    GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO',
    EQUAL_TO = 'EQUAL_TO',
    NOT_EQUAL_TO = 'NOT_EQUAL_TO',
    BETWEEN = 'BETWEEN',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    HAS_PROPERTY = 'HAS_PROPERTY',
    NOT_HAS_PROPERTY = 'NOT_HAS_PROPERTY',
    CONTAINS_TOKEN = 'CONTAINS_TOKEN',
    NOT_CONTAINS_TOKEN = 'NOT_CONTAINS_TOKEN'
}
