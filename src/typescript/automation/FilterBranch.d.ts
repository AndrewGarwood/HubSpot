/**
 * @file FilterBranch.d.ts
 * @module FilterBranch
 */

// Testing type hint tooltip when use 'export type ObjectName = {}' in a .d.ts file


import { FlowFilter } from './FlowFilter';

/**
 * @enum {string} FilterBranchTypeEnum
 * @description Enum for FilterBranchType values
 * @property {string} AND - Represents an AND filter branch type
 * @property {string} OR - Represents an OR filter branch type
 */
export declare enum FilterBranchTypeEnum {
    AND = 'AND',
    OR = 'OR'
}

/**
 * @enum {string} FilterBranchOperatorEnum
 * @description Enum for FilterBranchOperator values
 * @property {string} AND - Represents an AND filter branch operator
 * @property {string} OR - Represents an OR filter branch operator
 */
export declare enum FilterBranchOperatorEnum {
    AND = 'AND',
    OR = 'OR'
}

/**
 * @typedefn FilterBranch
 * @property {Array\<FilterBranch>} filterBranches - {@link FilterBranch}
 * @property {Array\<FlowFilter>} filters - {@link FlowFilter}
 * @property {FilterBranchTypeEnum} filterBranchType - The type of filter branch, {@link FilterBranchTypeEnum}
 * @property {FilterBranchOperatorEnum} filterBranchOperator - The operator for the filter branch, {@link FilterBranchOperatorEnum}
 */
export type FilterBranch = {
    filterBranches: Array<FilterBranch>;
    filters: Array<FlowFilter>;
    filterBranchType: FilterBranchTypeEnum;
    filterBranchOperator: FilterBranchOperatorEnum;
}
