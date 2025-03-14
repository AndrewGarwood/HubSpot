/**
 * @file Action.js
 * @module Action
 * @export { Action }
 */

// Referenced Type Imports:
/**
 * @import { ActionTypeEnum, ActionTypeIdEnum } from './ActionEnums.js';
 * @typedef {@import('./ListBranch.js').ListBranch} ListBranch
 * @typedef {@import('./Automation.js').Connection} Connection
 * 
*/

// Action --------------------------------
/**
 *- type: {@link ActionTypeEnum}
 *- actionTypeId: {@link ActionTypeIdEnum}
 *- listBranches: Array\<{@link ListBranch}>
 *- defaultBranch: {@link Connection} 
 * 
 * @typedef {Object} Action
 * 
 * @property {string} actionId
 * @property {ActionTypeEnum} type
 * @property {number} [actionTypeVersion]
 * @property {ActionTypeIdEnum} [actionTypeId]
 * @property {Object.<string, any>} [fields]
 * @property {Array<ListBranch>} [listBranches]
 * @property {string} [defaultBranchName]
 * @property {Connection} [defaultBranch]
 */