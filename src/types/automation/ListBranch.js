/**
 * @file ListBranch.js
 * @module ListBranch
 * @export { ListBranch }
 */

// Referenced Type Imports:
/**
 * @typedef {import('./FilterBranch.js').FilterBranch} FilterBranch
 * @typedef {import('./Automation.js').Connection} Connection
 */

/**
 * @param {FilterBranch} filterBranch - {@link FilterBranch}
 * @param {string} branchName - string
 * @param {Connection} [connection] - {@link Connection}
 * @returns {ListBranch} - .{@link ListBranch}
 */
export function ListBranch(filterBranch, branchName, connection) {
    return {
        filterBranch: filterBranch,
        branchName: branchName,
        connection: connection,
    };
}

/**
 * @typedef {Object} ListBranch
 * 
 * @property {FilterBranch} filterBranch
 * @property {string} branchName
 * @property {Connection} [connection]
 */
