/**
 * @file workflow_enums.js
 * { ObjectTypeEnum, FlowTypeEnum, ActionTypeEnum, ActionTypeIdEnum, 
 * FilterBranchTypeEnum, FilterBranchOperatorEnum, FilterTypeEnum, 
 * OperatorEnum, OperationTypeEnum
 * } from './workflow_enums.js';
 */

/**
 * @enum {string} AutomationTypeEnum
 * @readonly
 * @export
 *- WORKFLOW
 */
export const AutomationTypeEnum = {
    WORKFLOW: 'WORKFLOW',
};

/**
 * @enum {string} EnrollmentCriteriaTypeEnum
 * @readonly
 * @export
 *- LIST_BASED
 */
export const EnrollmentCriteriaTypeEnum = {
    LIST_BASED: 'LIST_BASED',
};


/**
 * @enum {string} ObjectTypeIdEnum
 * @readonly
 * @export
 *- CONTACT - 0-1
 */
export const ObjectTypeIdEnum = {
    CONTACT: '0-1',
};
// Contacts: 0-1
// Companies:  0-2
// Deals: 0-3
// Tickets: 0-5
// Custom objects: to find the ID value for your custom object, make a GET request to /crm/v3/schemas. The value will look similar to 2-3453932. 
// Calls: 0-48
// Emails: 0-49
// Meetings: 0-47
// Notes: 0-46
// Tasks: 0-27
// Products: 0-7
// Invoices: 0-52
// Line items: 0-8
// Payments: 0-101
// Quotes: 0-14
// Subscriptions: 0-69
// Communications (SMS, LinkedIn, WhatsApp messages): 0-18
// Postal mail: 0-116
// Marketing events: 0-54
// Feedback submissions: 0-19
// Appointments: 0-421
// Courses: 0-410
// Listings: 0-420
// Services: 0-162
/**
 * @enum {string} FlowObjectTypeEnum
 * @readonly
 * @export
 *- CONTACT_FLOW
 *- DEAL_FLOW
 *- TICKET_FLOW

 */
export const FlowObjectTypeEnum = {
    CONTACT_FLOW: 'CONTACT_FLOW',
    DEAL_FLOW: 'DEAL_FLOW',
    TICKET_FLOW: 'TICKET_FLOW',
};


/**
 * @enum {string} ActionTypeEnum
 * @readonly
 * @export
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
 * @export
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

/**
 * @enum {string} FilterBranchTypeEnum
 * @readonly
 * @export
 *- AND
 *- OR
 *
 */
export const FilterBranchTypeEnum = {
    AND: 'AND',
    OR: 'OR',
};

/**
 * @enum {string} FilterBranchOperatorEnum
 * @readonly
 * @export
 *- AND
 *- OR
 *
 */
export const FilterBranchOperatorEnum = {
    AND: 'AND',
    OR: 'OR',
};

/**
 * @enum {string} FilterTypeEnum
 * @readonly
 * @export
 *- PROPERTY
 *
 *
 */
export const FilterTypeEnum = {
    PROPERTY: 'PROPERTY',
};

/**
 * @enum {string} OperatorEnum
 * @readonly
 * @export
 *- IS_EQUAL_TO - "is equal to any of"
 *- IS_NOT_EQUAL_TO - "is not equal to any of"
 *- CONTAINS - "contains any of"
 *- DOES_NOT_CONTAIN - "doesn't contain any of"
 *- STARTS_WITH - "starts with any of"
 *- ENDS_WITH - "ends with any of"
 *- IS_KNOWN - "is known"
 *- IS_UNKNOWN - "is unknown"
 *- HAS_EVER_BEEN_EQUAL_TO - "has ever been equal to any of"
 *- HAS_NEVER_BEEN_EQUAL_TO - "has never been equal to any of"
 *- HAS_EVER_CONTAINED - "has ever contained any of"
 *- HAS_NEVER_CONTAINED - "has never contained any of"
 *- IS_BETWEEN - "is between (dates)"
 */
export const OperatorEnum = {
    IS_EQUAL_TO: 'IS_EQUAL_TO',
    IS_NOT_EQUAL_TO: 'IS_NOT_EQUAL_TO',
    CONTAINS: 'CONTAINS',
    DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN',
    STARTS_WITH: 'STARTS_WITH',
    ENDS_WITH: 'ENDS_WITH',
    IS_KNOWN: 'IS_KNOWN',
    IS_UNKNOWN: 'IS_UNKNOWN',
    HAS_EVER_BEEN_EQUAL_TO: 'HAS_EVER_BEEN_EQUAL_TO',
    HAS_NEVER_BEEN_EQUAL_TO: 'HAS_NEVER_BEEN_EQUAL_TO',
    HAS_EVER_CONTAINED: 'HAS_EVER_CONTAINED',
    HAS_NEVER_CONTAINED: 'HAS_NEVER_CONTAINED',
    IS_BETWEEN: 'IS_BETWEEN',
};


/**
 * @enum {string} OperationTypeEnum
 * @readonly
 * @export
 *- ALL_PROPERTY
 *- STRING
 *- MULTISTRING
 *- TIME_RANGED
 *- TIME_POINT
 */
export const OperationTypeEnum = {
    PROPERTY: 'PROPERTY',
};

/**
 * @enum {string} TimePointReferenceTypeEnum
 * @readonly
 * @export
 *- TODAY
 */
export const TimePointReferenceTypeEnum = {
    TODAY: 'TODAY',
};

/**
 * @enum {string} EdgeTypeEnum
 * @readonly
 * @export
 *- STANDARD
 *- GOTO
 */
export const EdgeTypeEnum = {
    STANDARD: 'STANDARD',
    GOTO: 'GOTO',
};