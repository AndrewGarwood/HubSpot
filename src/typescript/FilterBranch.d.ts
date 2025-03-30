/**
 * @file FilterBranch.d.ts
 * @module FilterBranch
 */

// Testing type hint tooltip when use an interface in a .d.ts file


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
 * @interface FilterBranch
 * @description This interface represents a filter branch that can contain other filter branches and filters.
 * @property {Array\<FilterBranch>} filterBranches - (see {@link FilterBranch})
 * @property {Array\<FlowFilter>} filters - (see {@link FlowFilter})
 * @property {FilterBranchTypeEnum} filterBranchType - The type of filter branch (AND/OR)
 * @property {FilterBranchOperatorEnum} filterBranchOperator - The operator for the filter branch (AND/OR)
 */
export interface FilterBranch {
    filterBranches: Array<FilterBranch>;
    filters: Array<FlowFilter>;
    filterBranchType: FilterBranchTypeEnum;
    filterBranchOperator: FilterBranchOperatorEnum;
}
