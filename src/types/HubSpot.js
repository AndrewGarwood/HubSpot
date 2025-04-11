/** 
 * @file hs_types.js
 * @import { PermissionLevelEnum, UserSetTypeEnum } from './hs_enums.js';
 * @import { AnalyticsObjectTypeEnum } from './analytics_enums.js';
 */


// HubSpotUser ----------------
/**
 * @export
 * @typedef {Object} HubSpotUser
 * @property {number} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName
 * @property {boolean} removed
 * @property {boolean} gdprDeleted
 * 
 */

// BusinessUnit ----------------
/**
 * @export
 * @typedef {Object} BusinessUnit
 * @property {number} hubId
 * @property {string} name
 * @property {boolean} allUsersHaveAccess
 * @property {number} id
 */

// PermissionSentence ----------------
/**
 * @export
 * @typedef {Object} PermissionSentence
 * @property {UserSetTypeEnum} userSetType
 * @property {number} userSetId
 * @property {number} dashboardId
 * @property {number} portalId
 * @property {number} objectId
 * @property {AnalyticsObjectTypeEnum} objectType
 * @property {PermissionLevelEnum} permissionLevel
 */

// PublicSubscriptionStatus ----------------

/**
 * @typedef {Object} PublicSubscriptionStatus
 * @property {number} [brandId]
 * @property {string} name
 * @property {string} description
 * @property {PublicSubscriptionStatusLegalBasisEnum} [legalBasis]
 * @property {string} [preferenceGroupName]
 * @property {string} id
 * @property {string} [legalBasisExplanation]
 */

/**
 * @enum {string} ObjectTypeIdEnum
 * @readonly
 * @export
 * @property {string} CONTACT - 0-1 - Represents a contact object.
 * @property {string} COMPANY - 0-2 - Represents a company object.
 * @property {string} DEAL - 0-3 - Represents a deal object.
 * @property {string} TICKET - 0-5 - Represents a ticket object.
 * @property {string} CALL - 0-48 - Represents a call object.
 * @property {string} EMAIL - 0-49 - Represents an email object.
 * @property {string} MEETING - 0-47 - Represents a meeting object.
 * @property {string} NOTE - 0-46 - Represents a note object.
 * @property {string} TASK - 0-27 - Represents a task object.
 * @property {string} PRODUCT - 0-7 - Represents a product object.
 * @property {string} INVOICE - 0-52 - Represents an invoice object.
 * @property {string} LINE_ITEM - 0-8 - Represents a line item object.
 * @property {string} PAYMENT - 0-101 - Represents a payment object.
 * @property {string} QUOTE - 0-14 - Represents a quote object.
 * @property {string} SUBSCRIPTION - 0-69 - Represents a subscription object.
 * @property {string} COMMUNICATION - 0-18 - Represents a communication object.
 * @property {string} POSTAL_MAIL - 0-116 - Represents a postal mail object.
 * @property {string} MARKETING_EVENT - 0-54 - Represents a marketing event object.
 * @property {string} FEEDBACK_SUBMISSION - 0-19 - Represents a feedback submission object.
 * @property {string} APPOINTMENT - 0-421 - Represents an appointment object.
 * @property {string} COURSE - 0-410 - Represents a course object.
 * @property {string} LISTING - 0-420 - Represents a listing object.
 * @property {string} SERVICE - 0-162 - Represents a service object.
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
 * @property {string} String
 * @property {string} Number
 * @property {string} Date
 * @property {string} Datetime
 * @property {string} Enumeration
 * @property {string} Bool
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
 * @property {string} CREATE_AND_OWN
 * @property {string} EDIT
 */
export const PermissionLevelEnum = {
    CREATE_AND_OWN: 'CREATE_AND_OWN',
    EDIT: 'EDIT',
};

/**
 * @enum {string} UserSetTypeEnum
 * @readonly
 * @export
 * @property {string} SINGLE_USER
 */
export const UserSetTypeEnum = {
    SINGLE_USER: 'SINGLE_USER',
};

/**
 * @enum {string} ResolveTypeEnum
 * @readonly
 * @export
 * @property {string} REPORT_DEFINITION
 */
export const ResolveTypeEnum = {
    REPORT_DEFINITION: 'REPORT_DEFINITION',
};

/**
 * @enum {string} AccessClassificationEnum
 * @readonly
 * @export
 * @property {string} NONE
 */
export const AccessClassificationEnum = {
    NONE: 'NONE',
};

/**
 * @enum {string} AnalyticsObjectTypeEnum
 * @readonly
 * @export
 * @property {string} REPORT
 */
export const AnalyticsObjectTypeEnum = {
    REPORT: 'REPORT',
};


/**
 * @enum {string} PublicSubscriptionChannelEnum
 * @readonly
 */
export const PublicSubscriptionChannelEnum = {
    Email: "EMAIL",
    Sms: "SMS",
    Push: "PUSH",
    Chat: "CHAT",
    Other: "OTHER"
};

/**
 * @enum {string} PublicSubscriptionOptStateEnum
 * @readonly
 */
export const PublicSubscriptionOptStateEnum = {
    OptIn: "OPT_IN",
    OptOut: "OPT_OUT",
    Subscribed: "SUBSCRIBED",
    Unsubscribed: "UNSUBSCRIBED",
    Unknown: "UNKNOWN"
};


/**
 * @enum {string} PublicSubscriptionStatusLegalBasisEnum
 * @readonly
 * @property {string} LegitimateInterestPql - LEGITIMATE_INTEREST_PQL
 * @property {string} LegitimateInterestClient - LEGITIMATE_INTEREST_CLIENT
 * @property {string} PerformanceOfContract - PERFORMANCE_OF_CONTRACT
 * @property {string} ConsentWithNotice - CONSENT_WITH_NOTICE
 * @property {string} NonGdpr - NON_GDPR
 * @property {string} ProcessAndStore - PROCESS_AND_STORE
 * @property {string} LegitimateInterestOther - LEGITIMATE_INTEREST_OTHER
 */
export const PublicSubscriptionStatusLegalBasisEnum = { 
    LegitimateInterestPql: "LEGITIMATE_INTEREST_PQL",
    LegitimateInterestClient: "LEGITIMATE_INTEREST_CLIENT",
    PerformanceOfContract: "PERFORMANCE_OF_CONTRACT",
    ConsentWithNotice: "CONSENT_WITH_NOTICE",
    NonGdpr: "NON_GDPR",
    ProcessAndStore: "PROCESS_AND_STORE",
    LegitimateInterestOther: "LEGITIMATE_INTEREST_OTHER"
};

/**
 * @enum {string} PublicSubscriptionStatusStatusEnum
 * @readonly
 * @property {string} Subscribed - SUBSCRIBED
 * @property {string} Unsubscribed - UNSUBSCRIBED
 */
export const PublicSubscriptionStatusStatusEnum = {
    Subscribed: "SUBSCRIBED",
    NotSubscribed: "NOT_SUBSCRIBED"
};

/**
 * @enum {string} PublicSubscriptionStatusSourceOfStatusEnum
 * @readonly
 * @property {string} PortalWideStatus - PORTAL_WIDE_STATUS
 * @property {string} BrandWideStatus - BRAND_WIDE_STATUS
 * @property {string} SubscriptionStatus - SUBSCRIPTION_STATUS
 */
export const PublicSubscriptionStatusSourceOfStatusEnum = {
    PortalWideStatus: "PORTAL_WIDE_STATUS",
    BrandWideStatus: "BRAND_WIDE_STATUS",
    SubscriptionStatus: "SUBSCRIPTION_STATUS"
};

