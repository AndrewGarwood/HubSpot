/**
 * @file FlowFilter.js
 * @module FlowFilter
 * @typedef {import('./Operation.js').Operation} Operation
 * @export { FlowFilter }
 */

export const MAX_VALUES_PER_FILTER = 5000;

/**
 * @typedef {Object} FlowFilter
 * 
 * @property {string} property
 * @property {Operation} operation
 * @property {FlowFilterTypeEnum} filterType
 */

/**
 * @param {string} property - string
 * @param {Operation} operation - {@link Operation}
 * @param {FlowFilterTypeEnum} filterType - {@link FlowFilterTypeEnum}
 * @returns {FlowFilter} - .{@link FlowFilter}
 */
export function FlowFilter(property, operation, filterType) {
    return {
        property: property,
        operation: operation,
        filterType: filterType || FlowFilterTypeEnum.PROPERTY,
    };
}


/**
 * @enum {string} FlowFilterTypeEnum
 * @readonly
 * @property {string} PROPERTY
 *
 */
export const FlowFilterTypeEnum = {
    PROPERTY: 'PROPERTY',
};


