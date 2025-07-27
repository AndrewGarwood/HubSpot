/**
 * @file src/crm/types/Crm.ts
 */
import { 
    SimplePublicObject as HS_SimplePublicObject, 
    SimplePublicObjectWithAssociations as HS_SimplePublicObjectWithAssociations 
} from "@hubspot/api-client/lib/codegen/crm/objects";

/**
 * @interface **`Filter`**
 * @property **`propertyName`** `string`
 * @property **`operator`** {@link FilterOperatorEnum}
 * @property **`value`** `string` `optional`
 * @property **`highValue`** `string` `optional`
 * @property **`values`** `Array<string>` `optional`
 */
export interface Filter {
    propertyName: string;
    operator: FilterOperatorEnum;
    value?: string;
    highValue?: string;
    values?: Array<string>;
}

/**
 * @interface **`FilterGroup`**
 * @property **`filters`** `Array<`{@link Filter}`>`
 */
export interface FilterGroup {
    filters: Array<Filter>;
}


/**
 * @interface **`PublicObjectSearchRequest`**
 * @property **`query`** `string`
 * @property **`limit`** `number`
 * @property **`after`** `string | number`
 * @property **`sorts`** `Array<string>`
 * @property **`properties`** `Array<string>`
 * @property **`filterGroups`** `Array<`{@link FilterGroup}`>`
 */
export interface PublicObjectSearchRequest {
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
 * @typedefn **`PublicObjectSearchResponse`**
 * @property **`objectIds`** `Array<string>`
 * @property **`objects`** `Array<`{@link SimplePublicObject}`>`
 * @property **`after`** `string | number`
 * @property **`total`** `number`
 */
export type PublicObjectSearchResponse = {
    objectIds: Array<string>;
    objects: Array<SimplePublicObject>;
    after: string | number;
    total: number;
}

/**
 * @interface **`SimplePublicObject`**
 * @property **`createdAt`** `Date`
 * @property **`archived`** `boolean`
 * @property **`archivedAt`** `Date`
 * @property **`propertiesWithHistory`** `Record<string`, `Array<`{@link ValueWithTimestamp}`>>`
 * @property **`id`** `string`
 * @property **`properties`** `Record<string, string | null>`
 * @property **`updatedAt`** `Date`
 */
export interface SimplePublicObject {
    createdAt: Date;
    archived?: boolean;
    archivedAt?: Date;
    propertiesWithHistory?: Record<string, Array<ValueWithTimestamp>>;
    id: string;
    properties: Record<string, string | null>;
    updatedAt: Date;
}


/**
 * @interface **`CollectionResponseWithTotalSimplePublicObjectForwardPaging`**
 * @property **`total`** `number`
 * @property **`paging`** {@link ForwardPaging}
 * @property **`results`** `Array<`{@link SimplePublicObject}`>`
 */
export interface CollectionResponseWithTotalSimplePublicObjectForwardPaging {
    total: number;
    paging?: ForwardPaging;
    results: Array<SimplePublicObject>;
}

/**
 * @interface **`SimplePublicObjectWithAssociations`** `extends` {@link SimplePublicObject}
 * @property **`associations`** {@link CollectionResponseAssociatedId}
 * @property **`createdAt`** `Date`
 * @property **`archived`** `boolean`
 * @property **`archivedAt`** `Date`
 * @property **`propertiesWithHistory`** `Record<string`, `Array<`{@link ValueWithTimestamp}`>>`
 * @property **`id`** `string`
 * @property **`properties`** `Record<string, string | null>`
 * @property **`updatedAt`** `Date`
 */
export interface SimplePublicObjectWithAssociations extends SimplePublicObject {
    associations?: Record<string, CollectionResponseAssociatedId>;
    createdAt: Date;
    archived?: boolean;
    archivedAt?: Date;
    propertiesWithHistory?: Record<string, Array<ValueWithTimestamp>>;
    id: string;
    properties: Record<string, string | null>;
    updatedAt: Date;
}

/**
 * @interface **`CollectionResponseAssociatedId`**
 * @property **`paging`** {@link Paging} `optional`
 * @property **`results`** `Array<`{@link AssociatedId}`>`
 */
export interface CollectionResponseAssociatedId {
    paging?: Paging;
    results: Array<AssociatedId>;
}

/**
 * @interface **`ValueWithTimestamp`**
 * @property **`sourceId`** `string`
 * @property **`sourceType`** `string`
 * @property **`sourceLabel`** `string`
 * @property **`updatedByUserId`** `number`
 * @property **`value`** `string`
 * @property **`timestamp`** `Date`
 */
export interface ValueWithTimestamp {
    sourceId: string;
    sourceType: string;
    sourceLabel: string;
    updatedByUserId: number;
    value: string;
    timestamp: Date;
}

/**
 * @interface **`AssociatedId`**
 * @property **`id`** `string`
 * @property **`type`** `string`
 */
export interface AssociatedId {
    id: string;
    type: string;
}

/**
 * @interface **`Paging`**
 * @property **`next`** {@link NextPage}
 * @property **`prev`** {@link PreviousPage}
 */
export interface Paging {
    next: NextPage;
    prev: PreviousPage;
}


/**
 * @interface **`ForwardPaging`**
 * @property {NextPage} next {@link NextPage}
 */
export interface ForwardPaging {
    next: NextPage;
}

/**
 * @interface **`NextPage`**
 * @property **`link`** `string` `optional`
 * @property **`after`** `string`
 */
export interface NextPage {
    link?: string;
    after: string;
}

/**
 * @interface **`PreviousPage`**
 * @property **`link`** `string` `optional`
 * @property **`before`** `string`
 */
export interface PreviousPage {
    link?: string;
    before: string;
}
/**
 * strings used as dictionary keys to access different parts of the CRM API with `hubspotClient`.
 * @example 
 * hubspotClient.crm[CrmObjectEnum.CONTACTS].basicApi 
 * // is equivalent to 
 * hubspotClient.crm.contacts.basicApi
 * @enum {string} **`CrmObjectEnum`**
 * @readonly
 * @property **`CONTACTS`** - `'contacts'`
 * @property **`DEALS`** - `'deals'`
 * @property **`COMPANIES`** - `'companies'`
 * @property **`PRODUCTS`** - `'products'`
 * @property **`LINE_ITEMS`** - `'lineItems'`
 * @property **`TICKETS`** - `'tickets'`
 */
export enum CrmObjectEnum {
    CONTACTS = 'contacts',
    DEALS = 'deals',
    COMPANIES = 'companies',
    PRODUCTS = 'products',
    LINE_ITEMS = 'lineItems',
    TICKETS = 'tickets'
}

/**
 * @note redundant... except for LINE_ITEMS
 * @enum {string} **`CrmAssociationObjectEnum`**
 * @readonly
 * @property **`CONTACTS`** - `'contacts'`
 * @property **`DEALS`** - `'deals'`
 * @property **`COMPANIES`** - `'companies'`
 * @property **`PRODUCTS`** - `'products'`
 * @property **`LINE_ITEMS`** - `line_items`
 * @property **`TICKETS`** - `'tickets'`
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
 * @enum {string} **`FilterOperatorEnum`**
 * @readonly
 * @property **`LESS_THAN`** - Less than the specified value.
 * @property **`LESS_THAN_OR_EQUAL_TO`** - Less than or equal to the specified value.
 * @property **`GREATER_THAN`** - Greater than the specified value.
 * @property **`GREATER_THAN_OR_EQUAL_TO`** - Greater than or equal to the specified value.
 * @property **`EQUAL_TO`** - Equal to the specified value.
 * @property **`NOT_EQUAL_TO`** - Not equal to the specified value.
 * @property **`BETWEEN`** - Within the specified range. In your request, use key-value pairs to set highValue and value. Refer to the example below the table.
 * @property **`IN`** - Included within the specified list. Searches by exact match. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase. Refer to the example below the table.
 * @property **`NOT_IN`** - Not included within the specified list. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase.
 * > `IN / NOT_IN` for enumeration properties only?
 * @property **`HAS_PROPERTY`** - Has a value for the specified property.
 * @property **`NOT_HAS_PROPERTY`** - Doesn't have a value for the specified property.
 * @property **`CONTAINS_TOKEN`** - Contains a token. In your request, you can use wildcards (*) to complete a partial search. For example, use the value *@hubspot.com to retrieve contacts with a HubSpot email address.
 * @property **`NOT_CONTAINS_TOKEN`** - Doesn't contain a token.
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