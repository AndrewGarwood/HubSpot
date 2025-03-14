/**
 * @file Operation.js
 * @module Operation
 * @import { OperatorEnum, OperationTypeEnum } from './OperationEnums.js'
 * @export { Operation }
 */


// Operation --------------------------------
/**
 *- operationType: {@link OperationTypeEnum}
 * 
 * @typedef {Object} Operation
 * 
 * @property {OperatorEnum} operator
 * @property {boolean} includeObjectsWithNoValueSet
 * @property {Array<string>} [values]
 * @property {OperationTypeEnum} operationType
 */