/**
 * @file src/utils/automation/types/ListBranch.ts
 */

import { FilterBranch } from './FilterBranch';
import { Connection } from './Automation';

/**
 * @interface ListBranch
 * 
 * @property {FilterBranch} filterBranch - {@link FilterBranch}
 * @property {string} branchName - `string`
 * @property {Connection} [connection] - {@link Connection}
 */
export interface ListBranch {
    filterBranch: FilterBranch;
    branchName: string;
    connection?: Connection;
}