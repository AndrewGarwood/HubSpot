/**
 * @file Action.js
 * @module Action
 * @export { Action }
 */

// Referenced Type Imports:
/**
 * @typedef {import('./ListBranch.js').ListBranch} ListBranch
 * @typedef {import('./Automation.js').Connection} Connection
 * 
*/


/**
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


/**
 * @param {string} actionId - string
 * @param {ActionTypeEnum} type - {@link ActionTypeEnum}
 * @param {number} [actionTypeVersion] - number
 * @param {ActionTypeIdEnum} [actionTypeId] - {@link ActionTypeIdEnum}
 * @param {Object.<string, any>} [fields] - Object\<string, any>
 * @param {Array<ListBranch>} [listBranches] - Array\<{@link ListBranch}>
 * @param {string} [defaultBranchName] - string
 * @param {Connection} [defaultBranch] - {@link Connection}
 * @returns {Action} - .{@link Action}
 */
export function Action(actionId, type, actionTypeVersion, actionTypeId, fields, listBranches, defaultBranchName, defaultBranch) {
    return {
        actionId: actionId,
        type: type,
        actionTypeVersion: actionTypeVersion,
        actionTypeId: actionTypeId,
        fields: fields,
        listBranches: listBranches,
        defaultBranchName: defaultBranchName,
        defaultBranch: defaultBranch,
    };
}

/**
 * @enum {string} ActionTypeEnum
 * @readonly
 * @property {string} LIST_BRANCH
 * @property {string} SINGLE_CONNECTION
 */
export const ActionTypeEnum = {
    LIST_BRANCH: 'LIST_BRANCH',
    SINGLE_CONNECTION: 'SINGLE_CONNECTION',
};

/**
 * @enum {string} ActionTypeIdEnum
 * @readonly
 * @property {string} DELAY_UNTIL_DATE - 0-35 - Delay until a preconfigured calendar date or date property of the enrolled record.
 * @property {string} DELAY_TIME - 0-1 - Delay for a preconfigured amount of time (e.g., 3 hours, 5 days, etc.), until a specific day (e.g., Tuesday), or time of day (12:00 AM EST).
 * @property {string} ADD_TO_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 * @property {string} REMOVE_FROM_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 * @property {string} SEND_AUTOMATED_EMAIL - 0-4 - Send an automated marketing email to the enrolled record.
 * @property {string} SEND_EMAIL_NOTIFICATION - 0-8 - Send an internal email notification to a user or team in your account.
 * @property {string} SEND_IN_APP_NOTIFICATION - 0-9 - Trigger an in-app notification to a user or team in your account.
 * @property {string} SET_PROPERTY - 0-5 - Set a property on an enrolled object.
 * @property {string} CREATE_TASK - 0-3 - Create a new task.
 * @property {string} CREATE_RECORD - 0-14 - Create a new record (contact, company, deal, ticket, or lead).
 */
export const ActionTypeIdEnum = {
    DELAY_UNTIL_DATE: '0-35',
    DELAY_TIME: '0-1',
    ADD_TO_LIST: '0-13',
    REMOVE_FROM_LIST: '0-13',
    SEND_AUTOMATED_EMAIL: '0-4',
    SEND_EMAIL_NOTIFICATION: '0-8',
    SEND_IN_APP_NOTIFICATION: '0-9',
    SET_PROPERTY: '0-5',
    CREATE_TASK: '0-3',
    CREATE_RECORD: '0-14',
};
