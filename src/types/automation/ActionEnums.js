/**
 * @file ActionEnums.js
 * @module ActionEnums
 * @export { ActionTypeEnum, ActionTypeIdEnum }
 */

/**
 * @enum {string} ActionTypeEnum
 * @readonly
 *- LIST_BRANCH
 *- SINGLE_CONNECTION
 */
export const ActionTypeEnum = {
    LIST_BRANCH: 'LIST_BRANCH',
    SINGLE_CONNECTION: 'SINGLE_CONNECTION',
};

/**
 * @enum {string} ActionTypeIdEnum
 * @readonly
 *- DELAY_UNTIL_DATE - 0-35 - Delay until a preconfigured calendar date or date property of the enrolled record.
 *- DELAY_TIME - 0-1 - Delay for a preconfigured amount of time (e.g., 3 hours, 5 days, etc.), until a specific day (e.g., Tuesday), or time of day (12:00 AM EST).
 *- ADD_TO_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 *- REMOVE_FROM_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 *- SEND_AUTOMATED_EMAIL - 0-4 - Send an automated marketing email to the enrolled record.
 *- SEND_EMAIL_NOTIFICATION - 0-8 - Send an internal email notification to a user or team in your account.
 *- SEND_IN_APP_NOTIFICATION - 0-9 - Trigger an in-app notification to a user or team in your account.
 *- SET_PROPERTY - 0-5 - Set a property on an enrolled object.
 *- CREATE_TASK - 0-3 - Create a new task.
 *- CREATE_RECORD - 0-14 - Create a new record (contact, company, deal, ticket, or lead).
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
