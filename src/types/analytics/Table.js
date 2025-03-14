/**
 * @file Table.js
 * @import { TablePrimaryObjectNameEnum, TablePrimaryObjectTypeEnum, TableJoinTypeEnum 
 * } from './TableEnums.js';
 * @import { ObjectTypeIdEnum } from '../hs_enums.js';
 */

// Table ----------------
/**
 * @typedef {Object} Table
 * @property {TablePrimaryObjectNameEnum} name
 * @property {TablePrimaryObjectTypeEnum} type
 * @property {number} [datasetId]
 * @property {ObjectTypeIdEnum} [objectTypeId]
 * @property {Array<TableJoin>} [join]
 * @export
 */

// TableJoin ----------------
/**
 * @typedef {Object} TableJoin
 * @property {Table} target
 * @property {TableJoinTypeEnum} [joinType]
 * @export
 */

/**
 * @enum {string} TablePrimaryObjectNameEnum
 * @readonly
 * @export
 *- DATASET
 *- CONTACT
 *- COMPANY
 *- DEAL
 *- LINE_ITEM
 *- TICKET
 *- LEAD
 *- PRODUCT
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
 *- HUBSPOT_OBJECT
 *- HUBSPOT_DATASET
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
 *- INNER
 *- LEFT
 *- RIGHT
 *- FULL
 *- CROSS
 *- SELF
 *- UNION
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