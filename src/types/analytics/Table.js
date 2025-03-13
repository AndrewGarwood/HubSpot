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