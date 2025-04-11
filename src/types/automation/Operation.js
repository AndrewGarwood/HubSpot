/**
 * @file Operation.js
 * @module Operation
 * @export { Operation }
 */

/**
 * @typedef {Object} Operation
 * 
 * @property {OperatorEnum} operator
 * @property {boolean} [includeObjectsWithNoValueSet]
 * @property {Array<string>} [values]
 * @property {number} [value]
 * @property {OperationTypeEnum} operationType
 */

/**
 * @param {OperatorEnum} operator - {@link OperatorEnum}
 * @param {boolean} [includeObjectsWithNoValueSet] - boolean
 * @param {Array<string> | number} [values] - Array\<string> (for string operations) | number (for number operations)
 * @param {OperationTypeEnum} operationType - {@link OperationTypeEnum}
 * 
 * @returns {Operation} .{@link Operation}
 */
export function Operation(
    operator,
    includeObjectsWithNoValueSet=false,
    values,
    operationType,
) {
    let operation = {
        operator: operator,
        includeObjectsWithNoValueSet: includeObjectsWithNoValueSet
    };
    if (values && (Array.isArray(values) || values instanceof Object)) {
        operation.values = values;
    } else if (values && typeof values === 'number') {
        operation.value = values;
    }
    if (operationType) {
        operation.operationType = operationType;
    }
    return operation;
}

/**
 * @enum {string} NumericOperatorEnum
 * @readonly
 * @description NumericOperatorEnum - Enum for numeric operations; subset of OperatorEnum.
 * @property {string} IS_EQUAL_TO - (NUMBER) "is equal to any of"
 * @property {string} IS_NOT_EQUAL_TO - (NUMBER) "is not equal to any of"
 * @property {string} IS_GREATER_THAN_OR_EQUAL_TO - (NUMBER) "is greater than or equal to"
 * @property {string} IS_GREATER_THAN - (NUMBER) "is greater than"
 * @property {string} IS_LESS_THAN_OR_EQUAL_TO - (NUMBER) "is less than or equal to"
 * @property {string} IS_LESS_THAN - (NUMBER) "is less than"
 */
export const NumericOperatorEnum = {
    IS_EQUAL_TO: 'IS_EQUAL_TO',
    IS_NOT_EQUAL_TO: 'IS_NOT_EQUAL_TO',
    IS_GREATER_THAN_OR_EQUAL_TO: 'IS_GREATER_THAN_OR_EQUAL_TO',
    IS_GREATER_THAN: 'IS_GREATER_THAN',
    IS_LESS_THAN_OR_EQUAL_TO: 'IS_LESS_THAN_OR_EQUAL_TO',
    IS_LESS_THAN: 'IS_LESS_THAN',
};


/**
 * @enum {string} OperatorEnum
 * @readonly
 * @property {string} IS_EQUAL_TO - (STRING, NUMBER) "is equal to any of"
 * @property {string} IS_NOT_EQUAL_TO - (STRING, NUMBER) "is not equal to any of"
 * @property {string} CONTAINS - (STRING) "contains any of"
 * @property {string} DOES_NOT_CONTAIN - (STRING) "doesn't contain any of"
 * @property {string} STARTS_WITH - (STRING) "starts with any of"
 * @property {string} ENDS_WITH - (STRING) "ends with any of"
 * @property {string} IS_KNOWN - (ANY) "is known"
 * @property {string} IS_UNKNOWN - (ANY) "is unknown"
 * @property {string} HAS_EVER_BEEN_EQUAL_TO - (STRING,) "has ever been equal to any of"
 * @property {string} HAS_NEVER_BEEN_EQUAL_TO - (STRING,) "has never been equal to any of"
 * @property {string} HAS_EVER_CONTAINED - (STRING) "has ever contained any of"
 * @property {string} HAS_NEVER_CONTAINED - (STRING) "has never contained any of"
 * @property {string} IS_BETWEEN - (DATE) "is between (dates)"
 * @property {string} IS_GREATER_THAN_OR_EQUAL_TO - (NUMBER) "is greater than or equal to"
 * @property {string} IS_GREATER_THAN - (NUMBER) "is greater than"
 * @property {string} IS_LESS_THAN_OR_EQUAL_TO - (NUMBER) "is less than or equal to"
 * @property {string} IS_LESS_THAN - (NUMBER) "is less than"
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
    IS_GREATER_THAN_OR_EQUAL_TO: 'IS_GREATER_THAN_OR_EQUAL_TO',
    IS_GREATER_THAN: 'IS_GREATER_THAN',
    IS_LESS_THAN_OR_EQUAL_TO: 'IS_LESS_THAN_OR_EQUAL_TO',
    IS_LESS_THAN: 'IS_LESS_THAN',
};


//known operator type ids = [ALL_PROPERTY, BOOL, CALENDAR_DATE, COMPARATIVE_DATE, COMPARATIVE_PROPERTY_UPDATED, DATE, DATETIME, ENUMERATION, MULTISTRING, NUMBER, NUMBER_RANGED, RANGED_DATE, ROLLING_DATE_RANGE, ROLLING_PROPERTY_UPDATED, STRING, TIME_POINT, TIME_RANGED] 

/**
 * @enum {string} OperationTypeEnum
 * @readonly
 * @property {string} ALL_PROPERTY
 * @property {string} STRING
 * @property {string} MULTISTRING
 * @property {string} NUMBER
 * @property {string} TIME_RANGED
 * @property {string} TIME_POINT
 */
export const OperationTypeEnum = {
    PROPERTY: 'PROPERTY',
    STRING: 'STRING',
    MULTISTRING: 'MULTISTRING',
    NUMBER: 'NUMBER',
    TIME_RANGED: 'TIME_RANGED',
    TIME_POINT: 'TIME_POINT',
};