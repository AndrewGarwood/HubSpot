/**
 * @file ListBranch.d.ts
 * @module ListBranch
 */

import { FilterBranch } from './FilterBranch';
import { Connection } from './Automation';

/**
 * @typedefn ListBranch
 * @property {FilterBranch} filterBranch
 * @property {string} branchName
 * @property {Connection} [connection]
 */
export type ListBranch = {
    filterBranch: FilterBranch;
    branchName: string;
    connection?: Connection;
};
