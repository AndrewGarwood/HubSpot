/**
 * @file Operation.js
 * @module Operation
 * @export { Operation }
 */


/**
 * @param {OperatorEnum} operator - {@link OperatorEnum}
 * @param {boolean} [includeObjectsWithNoValueSet] - boolean
 * @param {Array<string>} [values] - Array\<string>
 * @param {OperationTypeEnum} operationType - {@link OperationTypeEnum}
 * @returns {Operation} .{@link Operation}
 */
export function Operation(operator, includeObjectsWithNoValueSet=false, values=[], operationType) {
    return {
        operator: operator,
        includeObjectsWithNoValueSet: includeObjectsWithNoValueSet,
        values: values,
        operationType: operationType
    };
}


/**
 * @typedef {Object} Operation
 * 
 * @property {OperatorEnum} operator
 * @property {boolean} [includeObjectsWithNoValueSet]
 * @property {Array<string>} [values]
 * @property {OperationTypeEnum} operationType
 */



/**
 * @enum {string} OperatorEnum
 * @readonly
 *- IS_EQUAL_TO - "is equal to any of"
 *- IS_NOT_EQUAL_TO - "is not equal to any of"
 *- CONTAINS - "contains any of"
 *- DOES_NOT_CONTAIN - "doesn't contain any of"
 *- STARTS_WITH - "starts with any of"
 *- ENDS_WITH - "ends with any of"
 *- IS_KNOWN - "is known"
 *- IS_UNKNOWN - "is unknown"
 *- HAS_EVER_BEEN_EQUAL_TO - "has ever been equal to any of"
 *- HAS_NEVER_BEEN_EQUAL_TO - "has never been equal to any of"
 *- HAS_EVER_CONTAINED - "has ever contained any of"
 *- HAS_NEVER_CONTAINED - "has never contained any of"
 *- IS_BETWEEN - "is between (dates)"
 */
export const OperatorEnum = {
    IS_EQUAL_TO: 'IS_EQUAL_TO',
    IS_NOT_EQUAL_TO: 'IS_NOT_EQUAL_TO',
    CONTAINS: 'CONTAINS',
    DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN',
    STARTS_WITH: 'STARTS_WITH',
    ENDS_WITH: 'ENDS_WITH',
    IS_KNOWN: 'IS_KNOWN',
    IS_UNKNOWN: 'IS_UNKNOWN',
    HAS_EVER_BEEN_EQUAL_TO: 'HAS_EVER_BEEN_EQUAL_TO',
    HAS_NEVER_BEEN_EQUAL_TO: 'HAS_NEVER_BEEN_EQUAL_TO',
    HAS_EVER_CONTAINED: 'HAS_EVER_CONTAINED',
    HAS_NEVER_CONTAINED: 'HAS_NEVER_CONTAINED',
    IS_BETWEEN: 'IS_BETWEEN',
};


/**
 * @enum {string} OperationTypeEnum
 * @readonly
 *- ALL_PROPERTY
 *- STRING
 *- MULTISTRING
 *- TIME_RANGED
 *- TIME_POINT
 */
export const OperationTypeEnum = {
    PROPERTY: 'PROPERTY',
};