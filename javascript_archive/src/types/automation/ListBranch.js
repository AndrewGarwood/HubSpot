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
 * @typedef {Object} ListBranch
 * 
 * @property {FilterBranch} filterBranch
 * @property {string} branchName
 * @property {Connection} [connection]
 */

/**
 * @param {FilterBranch} filterBranch - {@link FilterBranch}
 * @param {string} branchName - string
 * @param {Connection} [connection] - {@link Connection}
 * @returns {ListBranch} - .{@link ListBranch}
 */
export function ListBranch(filterBranch, branchName, connection) {
    let listBranch = {
        filterBranch: filterBranch,
        branchName: branchName,
    };
    if (connection) {
        listBranch.connection = connection;
    }
    return listBranch;
}


