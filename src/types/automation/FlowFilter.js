/**
 * @file FlowFilter.js
 * @module FlowFilter
 * @typedef {import('./Operation.js').Operation} Operation
 * @export { FlowFilter }
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
 * @typedef {Object} FlowFilter
 * 
 * @property {string} property
 * @property {Operation} operation
 * @property {FlowFilterTypeEnum} filterType
 */

/**
 * @enum {string} FlowFilterTypeEnum
 * @readonly
 *- PROPERTY
 *
 */
export const FlowFilterTypeEnum = {
    PROPERTY: 'PROPERTY',
};


