/**
 * @file FilterBranch.js
 * @module FilterBranch
 * @export { FilterBranch }
 */


// Referenced Type Imports:
/**
 * @typedef {import('./FlowFilter.js').FlowFilter} FlowFilter
 */

// FilterBranch --------------------------------
// I don't like the fact that a property of FilterBranch is an array of itself called 'filterBranches',
// but that's how HubSpot's API is structured.

/**
 * @typedef {Object} FilterBranch
 * @property {Array<FilterBranch>} filterBranches
 * @property {Array<FlowFilter>} filters
 * @property {FilterBranchTypeEnum} filterBranchType
 * @property {FilterBranchOperatorEnum} filterBranchOperator
 */

/**
 * @param {Array<FilterBranch>} filterBranches - Array\<{@link FilterBranch}>
 * @param {Array<FlowFilter>} filters - Array\<{@link FlowFilter}>
 * @param {FilterBranchTypeEnum} filterBranchType - {@link FilterBranchTypeEnum}
 * @param {FilterBranchOperatorEnum} filterBranchOperator - {@link FilterBranchOperatorEnum}
 * @returns {FilterBranch} - .{@link FilterBranch}
 */
export function FilterBranch(
    filterBranches=[], 
    filters=[], 
    filterBranchType=FilterBranchTypeEnum.AND, 
    filterBranchOperator=FilterBranchOperatorEnum.AND
) {
    return {
        filterBranches: filterBranches,
        filters: filters,
        filterBranchType: filterBranchType,
        filterBranchOperator: filterBranchOperator,
    };
}


/**
 * @enum {string} FilterBranchTypeEnum
 * @readonly
 *- AND
 *- OR
 *
 */
export const FilterBranchTypeEnum = {
    AND: 'AND',
    OR: 'OR',
};

/**
 * @enum {string} FilterBranchOperatorEnum
 * @readonly
 *- AND
 *- OR
 *
 */
export const FilterBranchOperatorEnum = {
    AND: 'AND',
    OR: 'OR',
};
