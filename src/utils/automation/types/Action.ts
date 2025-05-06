/**
 * @file src/utils/automation/types/Action.ts
 */
import { ListBranch } from "./ListBranch";
import { ActionFields } from "./ActionFields";
import { Connection } from "./Automation";

/**
 * @interface Action
 * @property {string} actionId
 * @property {ActionTypeEnum} type - see {@link ActionTypeEnum}
 * @property {number} [actionTypeVersion]
 * @property {ActionTypeIdEnum} [actionTypeId] - see {@link ActionTypeIdEnum}
 * @property {ActionFields} [fields] - see {@link ActionFields}
 * @property {Array<ListBranch>} [listBranches] - `Array<`{@link ListBranch}`>`
 * @property {string} [defaultBranchName]
 * @property {Connection} [defaultBranch] - see {@link Connection}
 */
export interface Action {
    actionId: string;
    type: ActionTypeEnum;
    actionTypeVersion?: number;
    actionTypeId?: ActionTypeIdEnum;
    fields?: ActionFields;
    listBranches?: Array<ListBranch>;
    defaultBranchName?: string;
    defaultBranch?: Connection;
}

/**
 * @enum {string} ActionTypeEnum
 * @readonly
 * @property {string} LIST_BRANCH
 * @property {string} SINGLE_CONNECTION
 */
export enum ActionTypeEnum {
    LIST_BRANCH = 'LIST_BRANCH',
    SINGLE_CONNECTION = 'SINGLE_CONNECTION',
}

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
export enum ActionTypeIdEnum {
    DELAY_UNTIL_DATE = '0-35',
    DELAY_TIME = '0-1',
    ADD_TO_LIST = '0-13',
    REMOVE_FROM_LIST = '0-13',
    SEND_AUTOMATED_EMAIL = '0-4',
    SEND_EMAIL_NOTIFICATION = '0-8',
    SEND_IN_APP_NOTIFICATION = '0-9',
    SET_PROPERTY = '0-5',
    CREATE_TASK = '0-3',
    CREATE_RECORD = '0-14',
}