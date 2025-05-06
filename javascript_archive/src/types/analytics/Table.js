/**
 * @file Table.js
 * @import { ObjectTypeIdEnum } from '../HubSpot.js';
 */

// Table ----------------
/**
 * @typedef {Object} Table
 * @property {TablePrimaryObjectNameEnum} name {@link TablePrimaryObjectNameEnum}
 * @property {TablePrimaryObjectTypeEnum} type {@link TablePrimaryObjectTypeEnum}
 * @property {number} [datasetId]
 * @property {ObjectTypeIdEnum} [objectTypeId] {@link ObjectTypeIdEnum}
 * @property {Array<TableJoin>} [join] {@link TableJoin}
 * @export
 */

// TableJoin ----------------
/**
 * @typedef {Object} TableJoin
 * @property {Table} target
 * @property {TableJoinTypeEnum} [joinType] {@link TableJoinTypeEnum}
 * @export
 */

/**
 * @enum {string} TablePrimaryObjectNameEnum
 * @readonly
 * @export
 * @property {string} DATASET
 * @property {string} CONTACT
 * @property {string} COMPANY
 * @property {string} DEAL
 * @property {string} LINE_ITEM
 * @property {string} TICKET
 * @property {string} LEAD
 * @property {string} PRODUCT
 */
export const TablePrimaryObjectNameEnum = {
    DATASET: '__DATASET__',
    CONTACT: 'CONTACT',
    COMPANY: 'COMPANY',
    DEAL: 'DEAL',
    LINE_ITEM: 'LINE_ITEM',
    TICKET: 'TICKET',
    LEAD: 'LEAD',
    PRODUCT: 'PRODUCT',
};

/**
 * @enum {string} TablePrimaryObjectTypeEnum
 * @readonly
 * @export
 * @property {string} HUBSPOT_OBJECT
 * @property {string} HUBSPOT_DATASET
 */
export const TablePrimaryObjectTypeEnum = {
    HUBSPOT_OBJECT: 'HUBSPOT_OBJECT',
    HUBSPOT_DATASET: 'HUBSPOT_DATASET',
};

// TableJoinTypeEnum ----------------
// Not sure if this parameter actually exists in their codebase
/**
 * @enum {string} TableJoinTypeEnum
 * @readonly
 * @export
 * @property {string} INNER
 * @property {string} LEFT
 * @property {string} RIGHT
 * @property {string} FULL
 * @property {string} CROSS
 * @property {string} SELF
 * @property {string} UNION
*/
export const TableJoinTypeEnum = {
    INNER: 'INNER',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    FULL: 'FULL',
    CROSS: 'CROSS',
    SELF: 'SELF',
    UNION: 'UNION',
};