/** 
 * @file src/types/HubSpot.ts
 */


// HubSpotUser ----------------
/**
 * @interface HubSpotUser
 * @property {number} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName
 * @property {boolean} removed
 * @property {boolean} gdprDeleted

 * 
 */
export interface HubSpotUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    removed: boolean;
    gdprDeleted: boolean;
}

// BusinessUnit ----------------
/**
 * @interface BusinessUnit
 * @property {number} hubId
 * @property {string} name
 * @property {boolean} allUsersHaveAccess
 * @property {number} id

 */

export interface BusinessUnit {
    hubId: number;
    name: string;
    allUsersHaveAccess: boolean;
    id: number;
}


// PermissionSentence ----------------
/**
 * @interface PermissionSentence
 * @property {UserSetTypeEnum} userSetType
 * @property {number} userSetId
 * @property {number} dashboardId
 * @property {number} portalId
 * @property {number} objectId
 * @property {AnalyticsObjectTypeEnum} objectType
 * @property {PermissionLevelEnum} permissionLevel

 */
export interface PermissionSentence {
    userSetType: UserSetTypeEnum;
    userSetId: number;
    dashboardId: number;
    portalId: number;
    objectId: number;
    objectType: AnalyticsObjectTypeEnum;
    permissionLevel: PermissionLevelEnum;
}


// PublicSubscriptionStatus ----------------
/**
 * @interface PublicSubscriptionStatus
 * @property {number} [brandId]
 * @property {string} name
 * @property {string} description
 * @property {PublicSubscriptionStatusLegalBasisEnum} [legalBasis]
 * @property {string} [preferenceGroupName]
 * @property {string} id
 * @property {string} [legalBasisExplanation]

 */
export interface PublicSubscriptionStatus {
    brandId?: number;
    name: string;
    description: string;
    legalBasis?: PublicSubscriptionStatusLegalBasisEnum;
    preferenceGroupName?: string;
    id: string;
    legalBasisExplanation?: string;
}

/**
 * @enum {string} ObjectTypeIdEnum
 * @readonly
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
 * @property {string} LEAD - 0-136 - Represents a lead object.
 */
export enum ObjectTypeIdEnum  {
    CONTACT = '0-1',
    COMPANY = '0-2',
    DEAL = '0-3',
    TICKET = '0-5',
    CALL = '0-48',
    EMAIL = '0-49',
    MEETING = '0-47',
    NOTE = '0-46',
    TASK = '0-27',
    PRODUCT = '0-7',
    INVOICE = '0-52',
    LINE_ITEM = '0-8',
    PAYMENT = '0-101',
    QUOTE = '0-14',
    SUBSCRIPTION = '0-69',
    COMMUNICATION = '0-18',
    POSTAL_MAIL = '0-116',
    MARKETING_EVENT = '0-54',
    FEEDBACK_SUBMISSION = '0-19',
    APPOINTMENT = '0-421',
    COURSE = '0-410',
    LISTING = '0-420',
    SERVICE = '0-162',
    LEAD = '0-136'
    //LEAD = '0-4',
};


/**
 * @enum {string} `PropertyTypeEnum`
 * @readonly
 * @property {string} String
 * @property {string} Number
 * @property {string} Date
 * @property {string} Datetime
 * @property {string} Enumeration
 * @property {string} Bool
 */
export enum PropertyTypeEnum  {
    String = 'string',
    Number = 'number',
    Date = 'date',
    Datetime = 'datetime',
    Enumeration = 'enumeration',
    Bool = 'bool',
};

/**
 * @enum {string} `PermissionLevelEnum`
 * @readonly
 * @property {string} CREATE_AND_OWN
 * @property {string} EDIT
 */
export enum PermissionLevelEnum  {
    CREATE_AND_OWN = 'CREATE_AND_OWN',
    EDIT = 'EDIT',
};

/**
 * @enum {string} `UserSetTypeEnum`
 * @readonly
 * @property {string} SINGLE_USER
 */
export enum UserSetTypeEnum  {
    SINGLE_USER = 'SINGLE_USER',
};

/**
 * @enum {string} `ResolveTypeEnum`
 * @readonly
 * @property {string} REPORT_DEFINITION
 */
export enum ResolveTypeEnum  {
    REPORT_DEFINITION = 'REPORT_DEFINITION',
};

/**
 * @enum {string} `AccessClassificationEnum`
 * @readonly
 * @property {string} NONE
 */
export enum AccessClassificationEnum  {
    NONE = 'NONE',
};

/**
 * @enum {string} `AnalyticsObjectTypeEnum`
 * @readonly
 * @property {string} REPORT
 */
export enum AnalyticsObjectTypeEnum  {
    REPORT = 'REPORT',
};


/**
 * @enum {string} `PublicSubscriptionChannelEnum`
 * @readonly
 * @property {string} Email - Indicates that the user has opted in to receive communications via email.
 * @property {string} Sms - Indicates that the user has opted in to receive communications via SMS.
 * @property {string} Push - Indicates that the user has opted in to receive push notifications.
 * @property {string} Chat - Indicates that the user has opted in to receive communications via chat.
 * @property {string} Other - Indicates that the user has opted in to receive communications via other channels.
 */
export enum PublicSubscriptionChannelEnum  {
    Email = "EMAIL",
    Sms = "SMS",
    Push = "PUSH",
    Chat = "CHAT",
    Other = "OTHER"
};

/**
 * @enum {string} `PublicSubscriptionOptStateEnum`
 * @readonly
 * @property {string} OPT_IN - Indicates that the user has opted in to receive communications.
 * @property {string} OPT_OUT - Indicates that the user has opted out of receiving communications.
 * @property {string} SUBSCRIBED - Indicates that the user is subscribed to receive communications.
 * @property {string} UNSUBSCRIBED - Indicates that the user has unsubscribed from receiving communications.
 * @property {string} UNKNOWN - Indicates that the subscription status is unknown.
 */
export enum PublicSubscriptionOptStateEnum  {
    OPT_IN = "OPT_IN",
    OPT_OUT = "OPT_OUT",
    SUBSCRIBED = "SUBSCRIBED",
    UNSUBSCRIBED = "UNSUBSCRIBED",
    UNKNOWN = "UNKNOWN"
};


/**
 * @enum {string} `PublicSubscriptionStatusLegalBasisEnum`
 * @readonly
 * @property {string} LegitimateInterestPql - Indicates that the legal basis for processing is legitimate interest (PQL).
 * @property {string} LegitimateInterestClient - Indicates that the legal basis for processing is legitimate interest (client).
 * @property {string} PerformanceOfContract - Indicates that the legal basis for processing is performance of a contract.
 * @property {string} ConsentWithNotice - Indicates that the legal basis for processing is consent with notice.
 * @property {string} NonGdpr - Indicates that the legal basis for processing is non-GDPR.
 * @property {string} ProcessAndStore - Indicates that the legal basis for processing is process and store.
 * @property {string} LegitimateInterestOther - Indicates that the legal basis for processing is legitimate interest (other).
 */
export enum PublicSubscriptionStatusLegalBasisEnum  { 
    LegitimateInterestPql = "LEGITIMATE_INTEREST_PQL",
    LegitimateInterestClient = "LEGITIMATE_INTEREST_CLIENT",
    PerformanceOfContract = "PERFORMANCE_OF_CONTRACT",
    ConsentWithNotice = "CONSENT_WITH_NOTICE",
    NonGdpr = "NON_GDPR",
    ProcessAndStore = "PROCESS_AND_STORE",
    LegitimateInterestOther = "LEGITIMATE_INTEREST_OTHER"
};

/**
 * @enum {string} `OptStateEnum`
 * @readonly
 * @property {string} Subscribed - Indicates that the user is subscribed to the channel.
 * @property {string} NotSubscribed - Indicates that the user is not subscribed to the channel.
 */
export enum PublicSubscriptionStatusStatusEnum  {
    Subscribed = "SUBSCRIBED",
    NotSubscribed = "NOT_SUBSCRIBED"
};

/**
 * @enum {string} `PublicSubscriptionStatusSourceOfStatusEnum`
 * @readonly
 * @property {string} PortalWideStatus - Indicates that the status is determined by the portal-wide settings.
 * @property {string} BrandWideStatus - Indicates that the status is determined by the brand-wide settings.
 * @property {string} SubscriptionStatus - Indicates that the status is determined by the subscription settings.
 */
export enum PublicSubscriptionStatusSourceOfStatusEnum  {
    PortalWideStatus = "PORTAL_WIDE_STATUS",
    BrandWideStatus = "BRAND_WIDE_STATUS",
    SubscriptionStatus = "SUBSCRIPTION_STATUS"
};
