/**
 * @file Action.js
 * @module Action
 * @import { ActionTypeEnum, ActionTypeIdEnum } from './ActionEnums.js';
 * @import { ListBranch } from './ListBranch.js';
 * @import { Connection } from './Automation.js';
 */

// Action --------------------------------
/**
 * @export
 *- type: {@link ActionTypeEnum}
 *- actionTypeId: {@link ActionTypeIdEnum}
 *- listBranches: Array<{@link ListBranch}>
 * @typedef {Object} Action
 * @property {string} actionId
 * @property {ActionTypeEnum} type
 * @property {number} [actionTypeVersion]
 * @property {ActionTypeIdEnum} [actionTypeId]
 * @property {Object.<string, any>} [fields]
 * @property {Array<ListBranch>} [listBranches]
 * @property {string} [defaultBranchName]
 * @property {Connection} [defaultBranch]
 */