/**
 * @file src/api/crm/types/Crm.ts
 */
import { FilterOperatorEnum } from "./Enums";

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
 * @property **`limit`** `number` `optional`
 * @property **`after`** `string | number` `optional`
 * @property **`sorts`** `Array<string>` `optional`
 * @property **`properties`** `Array<string>` `optional`
 * - `for` each `result` in `SearchResponse.results` 
 * `result.properties.keys()` === `SearchRequest.properties` 
 * @property **`filterGroups`** `Array<`{@link FilterGroup}`>` - `maximum` allowed length = `5`
 * - `maximum` number of filters = `18` -> `sum(filterGroups.map(fg => fg.filters.length))` must be `<= 18`
 */
export interface PublicObjectSearchRequest {
    query?: string;
    limit?: number;
    after?: string | number;
    sorts?: Array<string>;
    properties?: Array<string>;
    /** 
     * `Array<`{@link FilterGroup}`>` 
     * - `maximum` allowed length = `5`
     * - `maximum` number of `filters` = `18` 
     * -> `sum(filterGroups.map(fg => fg.filters.length))` must be `<= 18` 
     * */
    filterGroups?: Array<FilterGroup>;
}
/**
 * - To include multiple filter criteria, you can group `filters` within `filterGroups`:
 * - To apply `AND` logic, include a comma-separated list of conditions within `one` set of filters.
 * - To apply `OR` logic, include multiple filters within a `filterGroup`.
 * - You can include a maximum of `five` `filterGroups` with up to `6` filters in each group, 
 * with a `maximum of 18 filters` in total. If you've included too many groups 
 * or filters, you'll receive a `VALIDATION_ERROR` error response.
 * */
/*
 * @example filterGroups: Array<FilterGroup>
For example, the request below searches for contacts with  
    (first name Alice `AND` a last name other than Smith), 
    `OR` 
    (contacts that don't have a value for the property email)
"filterGroups": [
    {
        "filters": [
            {
                "propertyName": "firstname",
                "operator": "EQ",
                "value": "Alice"
            },
            {
                "propertyName": "lastname",
                "operator": "NEQ",
                "value": "Smith"
            }
        ]
    },
    {
        "filters": [{
            "propertyName": "email",
            "operator": "NOT_HAS_PROPERTY"
        }]
    }
]
*/


/**
 * @typedefn **`PublicObjectSearchResponseSummary`**
 * @property **`objectIds`** `Array<string>`
 * @property **`objects`** `Array<`{@link SimplePublicObject}`>`
 * @property **`after`** `string | number`
 * @property **`total`** `number`
 */
export type PublicObjectSearchResponseSummary = {
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
 * @property **`next`** {@link NextPage}
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