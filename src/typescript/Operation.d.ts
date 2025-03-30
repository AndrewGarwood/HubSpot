/**
 * @file Operation.d.ts
 * @module Operation
 */

// Testing type hint tooltip when use a class in a .d.ts file


/**
 * @enum {string} OperatorEnum
 */
export declare enum OperatorEnum {
    /** "is equal to any of" */
    IS_EQUAL_TO = 'IS_EQUAL_TO',
    /** "is not equal to any of" */
    IS_NOT_EQUAL_TO = 'IS_NOT_EQUAL_TO',
    /** "contains any of" */
    CONTAINS = 'CONTAINS',
    /** "doesn't contain any of" */
    DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
    /** "starts with any of" */
    STARTS_WITH = 'STARTS_WITH',
    /** "ends with any of" */
    ENDS_WITH = 'ENDS_WITH',
    /** "is known" */
    IS_KNOWN = 'IS_KNOWN',
    /** "is unknown" */
    IS_UNKNOWN = 'IS_UNKNOWN',
    /** "has ever been equal to any of" */
    HAS_EVER_BEEN_EQUAL_TO = 'HAS_EVER_BEEN_EQUAL_TO',
    /** "has never been equal to any of" */
    HAS_NEVER_BEEN_EQUAL_TO = 'HAS_NEVER_BEEN_EQUAL_TO',
    /** "has ever contained any of" */
    HAS_EVER_CONTAINED = 'HAS_EVER_CONTAINED',
    /** "has never contained any of" */
    HAS_NEVER_CONTAINED = 'HAS_NEVER_CONTAINED',
    /** "is between (dates)" */
    IS_BETWEEN = 'IS_BETWEEN'
}

/**
 * @enum {string} OperationTypeEnum
 */
export declare enum OperationTypeEnum {
    /** Property operation type */
    PROPERTY = 'PROPERTY'
}


/**
 * @class Operation
 * @description This class represents an operation that can be performed on a property in a HubSpot workflow filter.
 * @property {OperatorEnum} operator - The operator to apply
 * @property {boolean} includeObjectsWithNoValueSet - Whether to include objects with no value set
 * @property {Array\<string>} values - Values to use in the operation
 * @property {OperationTypeEnum} operationType - The type of operation
 */
export class Operation {
    /**
     * The operator to apply
     * @type {OperatorEnum}
     */
    operator: OperatorEnum;
    
    /**
     * Whether to include objects with no value set
     * @type {boolean}
     */
    includeObjectsWithNoValueSet: boolean;
    
    /**
     * Values to use in the operation
     * @type {Array<string>}
     */
    values: Array<string>;
    
    /**
     * The type of operation
     * @type {OperationTypeEnum}
     */
    operationType: OperationTypeEnum;

    /**
     * @constructor
     * @param {OperatorEnum} operator - The operator to apply
     * @param {boolean} [includeObjectsWithNoValueSet=false] - Whether to include objects with no value set
     * @param {Array<string>} [values=[]] - Values to use in the operation
     * @param {OperationTypeEnum} operationType - The type of operation
     */
    constructor(
        operator: OperatorEnum, 
        includeObjectsWithNoValueSet?: boolean,
        values?: Array<string>,
        operationType: OperationTypeEnum
    );
}