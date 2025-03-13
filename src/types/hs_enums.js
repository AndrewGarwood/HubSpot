/**
 * @file hs_enums.js
 */

/**
 * @enum {string} ObjectTypeIdEnum
 * @readonly
 * @export
 *- CONTACT - 0-1 - Represents a contact object.
 *- COMPANY - 0-2 - Represents a company object.
 *- DEAL - 0-3 - Represents a deal object.
 *- TICKET - 0-5 - Represents a ticket object.
 *- CALL - 0-48 - Represents a call object.
 *- EMAIL - 0-49 - Represents an email object.
 *- MEETING - 0-47 - Represents a meeting object.
 *- NOTE - 0-46 - Represents a note object.
 *- TASK - 0-27 - Represents a task object.
 *- PRODUCT - 0-7 - Represents a product object.
 *- INVOICE - 0-52 - Represents an invoice object.
 *- LINE_ITEM - 0-8 - Represents a line item object.
 *- PAYMENT - 0-101 - Represents a payment object.
 *- QUOTE - 0-14 - Represents a quote object.
 *- SUBSCRIPTION - 0-69 - Represents a subscription object.
 *- COMMUNICATION - 0-18 - Represents a communication object.
 *- POSTAL_MAIL - 0-116 - Represents a postal mail object.
 *- MARKETING_EVENT - 0-54 - Represents a marketing event object.
 *- FEEDBACK_SUBMISSION - 0-19 - Represents a feedback submission object.
 *- APPOINTMENT - 0-421 - Represents an appointment object.
 *- COURSE - 0-410 - Represents a course object.
 *- LISTING - 0-420 - Represents a listing object.
 *- SERVICE - 0-162 - Represents a service object.
 */
export const ObjectTypeIdEnum = {
    CONTACT: '0-1',
    COMPANY: '0-2',
    DEAL: '0-3',
    TICKET: '0-5',
    CALL: '0-48',
    EMAIL: '0-49',
    MEETING: '0-47',
    NOTE: '0-46',
    TASK: '0-27',
    PRODUCT: '0-7',
    INVOICE: '0-52',
    LINE_ITEM: '0-8',
    PAYMENT: '0-101',
    QUOTE: '0-14',
    SUBSCRIPTION: '0-69',
    COMMUNICATION: '0-18',
    POSTAL_MAIL: '0-116',
    MARKETING_EVENT: '0-54',
    FEEDBACK_SUBMISSION: '0-19',
    APPOINTMENT: '0-421',
    COURSE: '0-410',
    LISTING: '0-420',
    SERVICE: '0-162',
    //LEAD: '0-4',
};


/**
 * @enum {string} PropertyTypeEnum
 * @readonly
 * @export
 *- String
 *- Number
 *- Date
 *- Datetime
 *- Enumeration
 *- Bool
 */
export const PropertyTypeEnum = {
    String: 'string',
    Number: 'number',
    Date: 'date',
    Datetime: 'datetime',
    Enumeration: 'enumeration',
    Bool: 'bool',
};

/**
 * @enum {string} PermissionLevelEnum
 * @readonly
 * @export
 *- CREATE_AND_OWN
 *- EDIT
 */
export const PermissionLevelEnum = {
    CREATE_AND_OWN: 'CREATE_AND_OWN',
    EDIT: 'EDIT',
};

/**
 * @enum {string} UserSetTypeEnum
 * @readonly
 * @export
 *- SINGLE_USER
 */
export const UserSetTypeEnum = {
    SINGLE_USER: 'SINGLE_USER',
};

/**
 * @enum {string} ResolveTypeEnum
 * @readonly
 * @export
 *- REPORT_DEFINITION
 */
export const ResolveTypeEnum = {
    REPORT_DEFINITION: 'REPORT_DEFINITION',
};

/**
 * @enum {string} AccessClassificationEnum
 * @readonly
 * @export
 *- NONE
 */
export const AccessClassificationEnum = {
    NONE: 'NONE',
};

/**
 * @enum {string} AnalyticsObjectTypeEnum
 * @readonly
 * @export
 *- REPORT
 */
export const AnalyticsObjectTypeEnum = {
    REPORT: 'REPORT',
};
