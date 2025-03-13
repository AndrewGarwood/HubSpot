/** 
 * @file hubspot_types.js
 * @import { FilterOperatorEnum, PropertyCreateTypeEnum, PropertyCreateFieldTypeEnum } from './crm_enums.js';
 */

/**
 * 
 * operator: {@link FilterOperatorEnum}
 * 
 * @typedef {Object} Filter
 * @property {string} propertyName
 * @property {FilterOperatorEnum} operator
 * @property {string} [value]
 * @property {string} [highValue]
 * @property {Array<string>} [values]
 * 
 */

/**
 * Filter: {@link Filter}
 * @typedef {Object} FilterGroup
 * @property {Array<Filter>} filters
 */

/**
 * filterGroups: Array<{@link FilterGroup}>
 * @typedef {Object} PublicObjectSearchRequest
 * @property {string} [query]
 * @property {number} [limit]
 * @property {string} [after]
 * @property {Array<string>} [sorts]
 * @property {Array<string>} [properties]
 * @property {Array<FilterGroup>} [filterGroups]
 */

/**
 * propertiesWithHistory: Object.<string, {@link ValueWithTimestamp}>
 * @typedef {Object} SimplePublicObject
 * @property {Date} createdAt
 * @property {boolean} [archived]
 * @property {Date} [archivedAt]
 * @property {Object.<string, Array<ValueWithTimestamp>>} [propertiesWithHistory]
 * @property {string} id
 * @property {Object.<string, string | null>} properties
 * @property {Date} updatedAt
 * 
 */

/**
 *- paging: {@link ForwardPaging}
 *- results: Array<{@link SimplePublicObject}>
 * @typedef {Object} CollectionResponseWithTotalSimplePublicObjectForwardPaging
 * @property {number} total
 * @property {ForwardPaging} [paging]
 * @property {Array<SimplePublicObject>} results
 */

/**
 *- associations: {@link CollectionResponseAssociatedId}
 *- propertiesWithHistory: Object.<string, {@link ValueWithTimestamp}>
 * @typedef {Object} SimplePublicObjectWithAssociations
 * @property {Object.<string, CollectionResponseAssociatedId>} [associations]
 * @property {Date} createdAt
 * @property {boolean} [archived]
 * @property {Date} [archivedAt]
 * @property {Object.<string, Array<ValueWithTimestamp>>} [propertiesWithHistory]
 * @property {string} id
 * @property {Object.<string, string | null>} properties
 * @property {Date} updatedAt
 */

/**
 *- results: Array<{@link AssociatedId}>
 *- paging: {@link Paging} 
 * @typedef {Object} CollectionResponseAssociatedId
 * @property {Paging} [paging]
 * @property {Array<AssociatedId>} results
 */

/**
 * @typedef {Object} ValueWithTimestamp
 * @property {string} sourceId
 * @property {string} sourceType
 * @property {string} sourceLabel
 * @property {number} updatedByUserId
 * @property {string} value
 * @property {Date} timestamp 
 */


/**
 * @typedef {Object} AssociatedId
 * @property {string} id
 * @property {string} type
 */

/**
 *- next: {@link NextPage}
 *- prev: {@link PreviousPage} 
 * @typedef {Object} Paging
 * @property {NextPage} next
 * @property {PreviousPage} prev
 */

/**
 *- next: {@link NextPage}
 * @typedef {Object} ForwardPaging
 * @property {NextPage} next
 */

/**
 * @typedef {Object} NextPage
 * @property {string} [link]
 * @property {string} after
 */

/**
 * @typedef {Object} PreviousPage
 * @property {string} [link]
 * @property {string} before
 */


/**
 *- type: {@link PropertyCreateTypeEnum}
 *- fieldType: {@link PropertyCreateFieldTypeEnum}
 *- options: Array<{@link OptionInput}> 
 * 
 * @typedef {Object} PropertyCreate
 * @property {boolean} [hidden]
 * @property {number} [displayOrder]
 * @property {string} [description]
 * @property {string} label
 * @property {PropertyCreateTypeEnum} type
 * @property {boolean} [formField]
 * @property {string} groupName
 * @property {string} [referencedObjectType]
 * @property {string} name
 * @property {Array<OptionInput>} [options]
 * @property {string} [calculationFormula]
 * @property {boolean} [hasUniqueValue]
 * @property {PropertyCreateFieldTypeEnum} fieldType
 * @property {boolean} [externalOptions]
 */

/**
 * @typedef {Object} OptionInput
 * @property {boolean} hidden
 * @property {number} [displayOrder]
 * @property {string} [description]
 * @property {string} label
 * @property {string} value
 */


/**
 * @typedef {Object} IConfiguration
 * @property {string} [apiKey]
 * @property {string} [accessToken]
 * @property {string} [developerApiKey]
 * @property {string} [basePath]
 * @property {Object.<string, string>} [defaultHeaders]
 * @property {number} [numberOfApiCallRetries]
 * @property {Bottleneck.ConstructorOptions} [limiterOptions]
 * @property {Bottleneck.JobOptions} [limiterJobOptions]
 * @property {http.Agent | https.Agent} [httpAgent]
 */