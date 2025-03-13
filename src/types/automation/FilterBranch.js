/**
 * @file FilterBranch.js
 * @import { FilterBranchTypeEnum, FilterBranchOperatorEnum } from './FilterBranchEnums.js';
 */


// FilterBranch --------------------------------
// I don't like the fact that a property of FilterBranch is an array of itself called 'filterBranches',
// but that's how HubSpot's API is structured.
/**
 *- filters: Array<{@link FlowFilter}>
 *- filterBranchType: {@link FilterBranchTypeEnum}
 *- filterBranchOperator: {@link FilterBranchOperatorEnum}
 * @typedef {Object} FilterBranch
 * @property {Array<FilterBranch>} filterBranches
 * @property {Array<FlowFilter>} filters
 * @property {FilterBranchTypeEnum} filterBranchType
 * @property {FilterBranchOperatorEnum} filterBranchOperator
 * @export
 */

