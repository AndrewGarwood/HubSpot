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


// ListBranch --------------------------------
/**
 *- filterBranch: {@link FilterBranch}
 *- connection: {@link Connection}
 * 
 * @typedef {Object} ListBranch
 * 
 * @property {FilterBranch} filterBranch
 * @property {string} branchName
 * @property {Connection} [connection]
 */