/**
 * @file src/api/crm/types/CrmEnums.ts
 */


/**
 * @enum {string} **`CrmObjectTypeIdEnum`**
 * @property **`CONTACT`** `'0-1'`
 * @property **`COMPANY`** `'0-2'`
 * @property **`DEAL`** `'0-3'`
 * @property **`TICKET`** `'0-5'`
 * @property **`PRODUCT`** `'0-7'`
 * @property **`LINE_ITEM`** `'0-8'`
 * @property **`LEAD`** `'0-136'`
 */
export enum CrmObjectTypeIdEnum  {
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
};
export const ObjectTypeIdEnumReverseMap: Record<string, keyof typeof CrmObjectTypeIdEnum> 
    = Object.entries(CrmObjectTypeIdEnum).reduce((acc, [key, value]) => {
        acc[value] = key as keyof typeof CrmObjectTypeIdEnum;
        return acc;
    }, {} as Record<string, keyof typeof CrmObjectTypeIdEnum>);

/**
 * @enum {string} **`PropertyTypeEnum`**
 * @property **`STRING`** `'string'`
 * @property **`NUMBER`** `'number'`
 * @property **`DATE`** `'date'`
 * @property **`DATETIME`** `'datetime'`
 * @property **`ENUMERATION`** `'enumeration'`
 * @property **`BOOL`** `'bool'`
 */
export enum PropertyTypeEnum  {
    STRING = 'string',
    NUMBER = 'number',
    DATE = 'date',
    DATETIME = 'datetime',
    ENUMERATION = 'enumeration',
    BOOL = 'bool',
};

/**
 * @enum {number} **`DealAssociationTypeIdEnum`**
 * @property **`DEAL_TO_DEAL`** `451`
 * @property **`DEAL_TO_LINE_ITEM`** `19`
 * @property **`DEAL_TO_CONTACT`** `3`
 * @property **`DEAL_TO_COMPANY`** `341`
 * @property **`DEAL_TO_COMPANY_PRIMARY`** `5`
 * @more `...`
 */
export enum DealAssociationTypeIdEnum {
    DEAL_TO_DEAL = 451,
    DEAL_TO_CONTACT = 3,
    DEAL_TO_COMPANY = 341,
    DEAL_TO_COMPANY_PRIMARY = 5,
    DEAL_TO_TICKET = 27,
    DEAL_TO_CALL = 205,
    DEAL_TO_EMAIL = 209,
    DEAL_TO_MEETING = 211,
    DEAL_TO_NOTE = 213,
    DEAL_TO_TASK = 215,
    /**SMS, WhatsApp, or LinkedIn message */
    DEAL_TO_COMMUNICATION = 86,
    DEAL_TO_POSTAL_MAIL = 458,
    DEAL_TO_DEAL_SPLIT = 313,
    DEAL_TO_LINE_ITEM = 19,
    DEAL_TO_INVOICE = 176,
    DEAL_TO_ORDER = 511,
    DEAL_TO_PAYMENT = 392,
    DEAL_TO_QUOTE = 63,
    DEAL_TO_SUBSCRIPTION = 300
}

/**
 * @enum {number} **`ContactAssociationTypeIdEnum`**
 * @property **`CONTACT_TO_CONTACT`** `449`
 * @property **`CONTACT_TO_DEAL`** `4`
 * @property **`CONTACT_TO_COMPANY`** `279`
 * @property **`CONTACT_TO_COMPANY_PRIMARY`** `1`
 * @property **`CONTACT_TO_TICKET`** `15`
 * @more `...`
 */
export enum ContactAssociationTypeIdEnum {
    CONTACT_TO_CONTACT = 449,
    CONTACT_TO_COMPANY = 279,
    CONTACT_TO_COMPANY_PRIMARY = 1,
    CONTACT_TO_DEAL = 4,
    CONTACT_TO_TICKET = 15,
    CONTACT_TO_CALL = 193,
    CONTACT_TO_EMAIL = 197,
    CONTACT_TO_MEETING = 199,
    CONTACT_TO_NOTE = 201,
    CONTACT_TO_TASK = 203,
    /**SMS, WhatsApp, or LinkedIn message */
    CONTACT_TO_COMMUNICATION = 82,
    CONTACT_TO_POSTAL_MAIL = 454,
    CONTACT_TO_CART = 587,
    CONTACT_TO_ORDER = 508,
    CONTACT_TO_INVOICE = 178,
    CONTACT_TO_PAYMENT = 388,
    CONTACT_TO_SUBSCRIPTION = 296
}

/**
 * @enum {number} **`CompanyAssociationTypeIdEnum`**
 * @property **`COMPANY_TO_COMPANY_CHILD`** `14`
 * @property **`COMPANY_TO_COMPANY_PARENT`** `13`
 * @property **`COMPANY_TO_CONTACT`** `280`
 * @property **`COMPANY_TO_CONTACT_PRIMARY`** `2`
 * @property **`COMPANY_TO_DEAL`** `342`
 * @property **`COMPANY_TO_DEAL_PRIMARY`** `6`
 * @property **`COMPANY_TO_TICKET`** `340`
 * @property **`COMPANY_TO_TICKET_PRIMARY`** `25`
 * @more `...`
 */
export enum CompanyAssociationTypeIdEnum {
    COMPANY_TO_COMPANY_CHILD = 14,
    COMPANY_TO_COMPANY_PARENT = 13,
    COMPANY_TO_CONTACT = 280,
    COMPANY_TO_CONTACT_PRIMARY = 2,
    COMPANY_TO_DEAL = 342,
    COMPANY_TO_DEAL_PRIMARY = 6,
    COMPANY_TO_TICKET = 340,
    COMPANY_TO_TICKET_PRIMARY = 25,
    COMPANY_TO_CALL = 181,
    COMPANY_TO_EMAIL = 185,
    COMPANY_TO_MEETING = 187,
    COMPANY_TO_NOTE = 189,
    COMPANY_TO_TASK = 191,
    COMPANY_TO_COMMUNICATION = 88,
    COMPANY_TO_POSTAL_MAIL = 460,
    COMPANY_TO_INVOICE = 180,
    COMPANY_TO_ORDER = 510,
    COMPANY_TO_PAYMENT = 390,
    COMPANY_TO_SUBSCRIPTION = 298
}



export enum CartAssociationTypeIdEnum {
    CART_TO_CONTACT = 586,
    CART_TO_DISCOUNT = 588,
    CART_TO_LINE_ITEM = 590,
    CART_TO_ORDER = 592,
    CART_TO_QUOTE = 732,
    CART_TO_TASK = 728,
    CART_TO_TICKET = 594
}

export enum OrderAssociationTypeIdEnum {
    ORDER_TO_CART = 593,
    ORDER_TO_CONTACT = 507,
    ORDER_TO_COMPANY = 509,
    ORDER_TO_DEAL = 512,
    ORDER_TO_DISCOUNT = 519,
    ORDER_TO_DISCOUNT_CODE = 521,
    ORDER_TO_INVOICE = 518,
    ORDER_TO_LINE_ITEM = 513,
    ORDER_TO_PAYMENT = 523,
    ORDER_TO_QUOTE = 730,
    ORDER_TO_SUBSCRIPTION = 516,
    ORDER_TO_TASK = 726,
    ORDER_TO_TICKET = 525
}


export enum LeadAssociationTypeIdEnum {
    LEAD_TO_PRIMARY_CONTACT = 578,
    LEAD_TO_CALL = 596,
    LEAD_TO_EMAIL = 598,
    LEAD_TO_MEETING = 600,
    LEAD_TO_COMMUNICATION = 602,
    LEAD_TO_CONTACT = 608,
    LEAD_TO_COMPANY = 610,
    LEAD_TO_TASK = 646
}

export enum TicketAssociationTypeIdEnum {
    TICKET_TO_TICKET = 452,
    TICKET_TO_CONTACT = 16,
    TICKET_TO_COMPANY = 339,
    TICKET_TO_COMPANY_PRIMARY = 26,
    TICKET_TO_DEAL = 28,
    TICKET_TO_CALL = 219,
    TICKET_TO_EMAIL = 223,
    TICKET_TO_MEETING = 225,
    TICKET_TO_NOTE = 227,
    TICKET_TO_TASK = 229,
    /**SMS, WhatsApp, or LinkedIn message */
    TICKET_TO_COMMUNICATION = 84,
    TICKET_TO_POSTAL_MAIL = 456,
    TICKET_TO_THREAD = 32,
    TICKET_TO_CONVERSATION = 278,
    TICKET_TO_ORDER = 526
}


/**
 * strings used as dictionary keys to access different parts of the CRM API with `hubspotClient`.
 * @example 
 * hubspotClient.crm[CrmObjectEnum.CONTACTS].basicApi 
 * // is equivalent to 
 * hubspotClient.crm.contacts.basicApi
 * @enum {string} **`ApiObjectEnum`**
 * @property **`CONTACTS`** `'contacts'`
 * @property **`DEALS`** `'deals'`
 * @property **`COMPANIES`** `'companies'`
 * @property **`PRODUCTS`** `'products'`
 * @property **`LINE_ITEMS`** `'lineItems'`
 * @property **`TICKETS`** `'tickets'`
 */
export enum ApiObjectEnum {
    CONTACTS = 'contacts',
    DEALS = 'deals',
    COMPANIES = 'companies',
    PRODUCTS = 'products',
    LINE_ITEMS = 'lineItems',
    TICKETS = 'tickets'
}

// export enum CrmObjectTypeEnum {
//     CONTACT = 'contacts',
//     DEAL = 'deals',
//     COMPANIE = 'companies',
//     PRODUCT = 'products',
//     LINE_ITEM = 'lineItems',
//     TICKET = 'tickets'
// }


/**
 * @note redundant... except for LINE_ITEMS
 * @enum {string} **`CrmAssociationObjectEnum`**
 * @readonly
 * @property **`CONTACTS`** `'contacts'`
 * @property **`DEALS`** `'deals'`
 * @property **`COMPANIES`** `'companies'`
 * @property **`PRODUCTS`** `'products'`
 * @property **`LINE_ITEMS`** `line_items`
 * @property **`TICKETS`** `'tickets'`
 */
export enum CrmAssociationObjectEnum {
    CONTACTS = 'contacts',
    DEALS = 'deals',
    COMPANIES = 'companies',
    PRODUCTS = 'products',
    LINE_ITEMS = 'line_items',
    TICKETS = 'tickets'
}

/**
 * @enum {string} **`AssociationCategoryEnum`**
 * @property **`HUBSPOT_DEFINED`** `'HUBSPOT_DEFINED'`
 * @property **`USER_DEFINED`** `'USER_DEFINED'`
 */
export enum AssociationCategoryEnum {
    HUBSPOT_DEFINED = 'HUBSPOT_DEFINED',
    USER_DEFINED = 'USER_DEFINED'
}

/**
 * @enum {string} **`FilterOperatorEnum`**
 * @property **`LESS_THAN`** `'LT'` - Less than the specified value.
 * @property **`LESS_THAN_OR_EQUAL_TO`** `'LTE'` - Less than or equal to the specified value.
 * @property **`GREATER_THAN`** `'GT'` - Greater than the specified value.
 * @property **`GREATER_THAN_OR_EQUAL_TO`** `'GTE'` - Greater than or equal to the specified value.
 * @property **`EQUAL_TO`** `'EQ'` - Equal to the specified value.
 * @property **`NOT_EQUAL_TO`** `'NEQ'` - Not equal to the specified value.
 * @property **`BETWEEN`** - Within the specified range. In your request, use key-value pairs to set highValue and value. Refer to the example below the table.
 * @property **`IN`** `'IN'` - Included within the specified list. Searches by exact match. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase. Refer to the example below the table.
 * @property **`NOT_IN`** `'NOT_IN'` - Not included within the specified list. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase.
 * > `IN / NOT_IN` for enumeration properties only?
 * @property **`HAS_PROPERTY`** `'HAS_PROPERTY'` - Has a value for the specified property.
 * @property **`NOT_HAS_PROPERTY`** `'NOT_HAS_PROPERTY'` - Doesn't have a value for the specified property.
 * @property **`CONTAINS_TOKEN`** `'CONTAINS_TOKEN'` - Contains a token. In your request, you can use wildcards (*) to complete a partial search. For example, use the value *@hubspot.com to retrieve contacts with a HubSpot email address.
 * @property **`NOT_CONTAINS_TOKEN`** `'NOT_CONTAINS_TOKEN'` - Doesn't contain a token.
 */
export enum FilterOperatorEnum {
    LESS_THAN = 'LT',
    LESS_THAN_OR_EQUAL_TO = 'LTE',
    GREATER_THAN = 'GT',
    GREATER_THAN_OR_EQUAL_TO = 'GTE',
    EQUAL_TO = 'EQ',
    NOT_EQUAL_TO = 'NEQ',
    BETWEEN = 'BETWEEN',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    HAS_PROPERTY = 'HAS_PROPERTY',
    NOT_HAS_PROPERTY = 'NOT_HAS_PROPERTY',
    CONTAINS_TOKEN = 'CONTAINS_TOKEN',
    NOT_CONTAINS_TOKEN = 'NOT_CONTAINS_TOKEN'
}