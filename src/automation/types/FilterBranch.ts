/**
 * @file src/utils/automation/types/FilterBranch.ts
 */

import { FlowFilter } from './FlowFilter';


/**
 * @interface FilterBranch
 * @property {Array<FilterBranch>} filterBranches - `Array<`{@link FilterBranch}`>`
 * @property {Array<FlowFilter>} filters - `Array<`{@link FlowFilter}`>`
 * @property {FilterBranchTypeEnum} filterBranchType see {@link FilterBranchTypeEnum}
 * @property {FilterBranchOperatorEnum} filterBranchOperator see {@link FilterBranchOperatorEnum}
 */
export interface FilterBranch {
    filterBranches: Array<FilterBranch>;
    filters: Array<FlowFilter>;
    filterBranchType: FilterBranchTypeEnum;
    filterBranchOperator: FilterBranchOperatorEnum;
}

/**
 * @enum {string} FilterBranchTypeEnum
 * @readonly
 * @property {string} AND
 * @property {string} OR
 *
 */
export enum FilterBranchTypeEnum {
    AND = 'AND',
    OR = 'OR',
}

/**
 * @enum {string} FilterBranchOperatorEnum
 * @readonly
 * @property {string} AND
 * @property {string} OR
 */
export enum FilterBranchOperatorEnum {
    AND = 'AND',
    OR = 'OR',
}