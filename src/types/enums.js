/**
 * @file enums.js
 */

// node_modules\@hubspot\api-client\lib\src\discovery\crm\CrmDiscovery.d.ts


/**
 * @enum {string}
 * @readonly
 * @export
 * @property {string} LT - Less than the specified value.
 * @property {string} LTE - Less than or equal to the specified value.
 * @property {string} GT - Greater than the specified value.
 * @property {string} GTE - Greater than or equal to the specified value.
 * @property {string} EQ - Equal to the specified value.
 * @property {string} NEQ - Not equal to the specified value.
 * @property {string} BETWEEN - Within the specified range. In your request, use key-value pairs to set highValue and value. Refer to the example below the table.
 * @property {string} IN - Included within the specified list. Searches by exact match. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase. Refer to the example below the table.
 * @property {string} NOT_IN - Not included within the specified list. In your request, include the list values in a values array. When searching a string property with this operator, values must be lowercase.
 * --  IN / NOT_IN for enumeration properties only?
 * @property {string} HAS_PROPERTY - Has a value for the specified property.
 * @property {string} NOT_HAS_PROPERTY - Doesn't have a value for the specified property.
 * @property {string} CONTAINS_TOKEN - Contains a token. In your request, you can use wildcards (*) to complete a partial search. For example, use the value *@hubspot.com to retrieve contacts with a HubSpot email address.
 * @property {string} NOT_CONTAINS_TOKEN - Doesn't contain a token.
 *
 * 
 */
export const FilterOperatorEnum = {
    Eq: 'EQ',
    Neq: 'NEQ',
    Lt: 'LT',
    Lte: 'LTE',
    Gt: 'GT',
    Gte: 'GTE',
    Between: 'BETWEEN',
    In: 'IN',
    NotIn: 'NOT_IN',
    HasProperty: 'HAS_PROPERTY',
    NotHasProperty: 'NOT_HAS_PROPERTY',
    ContainsToken: 'CONTAINS_TOKEN',
    NotContainsToken: 'NOT_CONTAINS_TOKEN'
};

/**
 * @enum {string}
 * @readonly
 * @export
 * @property {string} String - A string property.
 * @property {string} Number - A number property.
 * @property {string} Date - A date property. 
 * @property {string} Datetime - A datetime property.
 * @property {string} Enumeration - An enumeration property.
 * @property {string} Bool - A boolean property.
 */
export const PropertyCreateTypeEnum = {
    String: 'string',
    Number: 'number',
    Date: 'date',
    Datetime: 'datetime',
    Enumeration: 'enumeration',
    Bool: 'bool'
};

/**
 * @enum {string}
 * @readonly
 * @export
 * @property {string} textarea - A text area field.
 * @property {string} text - A single line text field.
 * @property {string} date - A date field. 
 * @property {string} file - A file field.
 * @property {string} number - A number field.
 * @property {string} select - A select field.
 * @property {string} radio - A radio button field.
 * @property {string} checkbox - A checkbox field.
 * @property {string} booleancheckbox - A boolean checkbox field.
 * @property {string} calculation_equation - A calculation equation field.
 */
export const PropertyCreateFieldTypeEnum = {
    Textarea: 'textarea',
    Text: 'text',
    Date: 'date',
    File: 'file',
    Number: 'number',
    Select: 'select',
    Radio: 'radio',
    Checkbox: 'checkbox',
    Booleancheckbox: 'booleancheckbox',
    CalculationEquation: 'calculation_equation'
};

// export const FieldTypeDefinitionReferencedObjectTypeEnum {
//     Contact = "CONTACT",
//     Company = "COMPANY",
//     Deal = "DEAL",
//     Engagement = "ENGAGEMENT",
//     Ticket = "TICKET",
//     Owner = "OWNER",
//     Product = "PRODUCT",
//     LineItem = "LINE_ITEM",
//     BetDeliverableService = "BET_DELIVERABLE_SERVICE",
//     Content = "CONTENT",
//     Conversation = "CONVERSATION",
//     BetAlert = "BET_ALERT",
//     Portal = "PORTAL",
//     Quote = "QUOTE",
//     FormSubmissionInbounddb = "FORM_SUBMISSION_INBOUNDDB",
//     Quota = "QUOTA",
//     Unsubscribe = "UNSUBSCRIBE",
//     Communication = "COMMUNICATION",
//     FeedbackSubmission = "FEEDBACK_SUBMISSION",
//     Attribution = "ATTRIBUTION",
//     SalesforceSyncError = "SALESFORCE_SYNC_ERROR",
//     RestorableCrmObject = "RESTORABLE_CRM_OBJECT",
//     Hub = "HUB",
//     LandingPage = "LANDING_PAGE",
//     ProductOrFolder = "PRODUCT_OR_FOLDER",
//     Task = "TASK",
//     Form = "FORM",
//     MarketingEmail = "MARKETING_EMAIL",
//     AdAccount = "AD_ACCOUNT",
//     AdCampaign = "AD_CAMPAIGN",
//     AdGroup = "AD_GROUP",
//     Ad = "AD",
//     Keyword = "KEYWORD",
//     Campaign = "CAMPAIGN",
//     SocialChannel = "SOCIAL_CHANNEL",
//     SocialPost = "SOCIAL_POST",
//     SitePage = "SITE_PAGE",
//     BlogPost = "BLOG_POST",
//     Import = "IMPORT",
//     Export = "EXPORT",
//     Cta = "CTA",
//     TaskTemplate = "TASK_TEMPLATE",
//     AutomationPlatformFlow = "AUTOMATION_PLATFORM_FLOW",
//     ObjectList = "OBJECT_LIST",
//     Note = "NOTE",
//     MeetingEvent = "MEETING_EVENT",
//     Call = "CALL",
//     Email = "EMAIL",
//     PublishingTask = "PUBLISHING_TASK",
//     ConversationSession = "CONVERSATION_SESSION",
//     ContactCreateAttribution = "CONTACT_CREATE_ATTRIBUTION",
//     Invoice = "INVOICE",
//     MarketingEvent = "MARKETING_EVENT",
//     ConversationInbox = "CONVERSATION_INBOX",
//     Chatflow = "CHATFLOW",
//     MediaBridge = "MEDIA_BRIDGE",
//     Sequence = "SEQUENCE",
//     SequenceStep = "SEQUENCE_STEP",
//     Forecast = "FORECAST",
//     Snippet = "SNIPPET",
//     Template = "TEMPLATE",
//     DealCreateAttribution = "DEAL_CREATE_ATTRIBUTION",
//     QuoteTemplate = "QUOTE_TEMPLATE",
//     QuoteModule = "QUOTE_MODULE",
//     QuoteModuleField = "QUOTE_MODULE_FIELD",
//     QuoteField = "QUOTE_FIELD",
//     SequenceEnrollment = "SEQUENCE_ENROLLMENT",
//     Subscription = "SUBSCRIPTION",
//     AcceptanceTest = "ACCEPTANCE_TEST",
//     SocialBroadcast = "SOCIAL_BROADCAST",
//     DealSplit = "DEAL_SPLIT",
//     DealRegistration = "DEAL_REGISTRATION",
//     GoalTarget = "GOAL_TARGET",
//     GoalTargetGroup = "GOAL_TARGET_GROUP",
//     PortalObjectSyncMessage = "PORTAL_OBJECT_SYNC_MESSAGE",
//     FileManagerFile = "FILE_MANAGER_FILE",
//     FileManagerFolder = "FILE_MANAGER_FOLDER",
//     SequenceStepEnrollment = "SEQUENCE_STEP_ENROLLMENT",
//     Approval = "APPROVAL",
//     ApprovalStep = "APPROVAL_STEP",
//     CtaVariant = "CTA_VARIANT",
//     SalesDocument = "SALES_DOCUMENT",
//     Discount = "DISCOUNT",
//     Fee = "FEE",
//     Tax = "TAX",
//     MarketingCalendar = "MARKETING_CALENDAR",
//     PermissionsTesting = "PERMISSIONS_TESTING",
//     PrivacyScannerCookie = "PRIVACY_SCANNER_COOKIE",
//     DataSyncState = "DATA_SYNC_STATE",
//     WebInteractive = "WEB_INTERACTIVE",
//     Playbook = "PLAYBOOK",
//     Folder = "FOLDER",
//     PlaybookQuestion = "PLAYBOOK_QUESTION",
//     PlaybookSubmission = "PLAYBOOK_SUBMISSION",
//     PlaybookSubmissionAnswer = "PLAYBOOK_SUBMISSION_ANSWER",
//     CommercePayment = "COMMERCE_PAYMENT",
//     GscProperty = "GSC_PROPERTY",
//     SoxProtectedDummyType = "SOX_PROTECTED_DUMMY_TYPE",
//     BlogListingPage = "BLOG_LISTING_PAGE",
//     QuarantinedSubmission = "QUARANTINED_SUBMISSION",
//     PaymentSchedule = "PAYMENT_SCHEDULE",
//     PaymentScheduleInstallment = "PAYMENT_SCHEDULE_INSTALLMENT",
//     MarketingCampaignUtm = "MARKETING_CAMPAIGN_UTM",
//     DiscountTemplate = "DISCOUNT_TEMPLATE",
//     DiscountCode = "DISCOUNT_CODE",
//     FeedbackSurvey = "FEEDBACK_SURVEY",
//     CmsUrl = "CMS_URL",
//     SalesTask = "SALES_TASK",
//     SalesWorkload = "SALES_WORKLOAD",
//     User = "USER",
//     PostalMail = "POSTAL_MAIL",
//     SchemasBackendTest = "SCHEMAS_BACKEND_TEST",
//     PaymentLink = "PAYMENT_LINK",
//     SubmissionTag = "SUBMISSION_TAG",
//     CampaignStep = "CAMPAIGN_STEP",
//     SchedulingPage = "SCHEDULING_PAGE",
//     SoxProtectedTestType = "SOX_PROTECTED_TEST_TYPE",
//     Order = "ORDER",
//     MarketingSms = "MARKETING_SMS",
//     PartnerAccount = "PARTNER_ACCOUNT",
//     CampaignTemplate = "CAMPAIGN_TEMPLATE",
//     CampaignTemplateStep = "CAMPAIGN_TEMPLATE_STEP",
//     Playlist = "PLAYLIST",
//     Clip = "CLIP",
//     CampaignBudgetItem = "CAMPAIGN_BUDGET_ITEM",
//     CampaignSpendItem = "CAMPAIGN_SPEND_ITEM",
//     Mic = "MIC",
//     ContentAudit = "CONTENT_AUDIT",
//     ContentAuditPage = "CONTENT_AUDIT_PAGE",
//     PlaylistFolder = "PLAYLIST_FOLDER",
//     Lead = "LEAD",
//     AbandonedCart = "ABANDONED_CART",
//     ExternalWebUrl = "EXTERNAL_WEB_URL",
//     View = "VIEW",
//     ViewBlock = "VIEW_BLOCK",
//     Roster = "ROSTER",
//     Cart = "CART",
//     AutomationPlatformFlowAction = "AUTOMATION_PLATFORM_FLOW_ACTION",
//     SocialProfile = "SOCIAL_PROFILE",
//     PartnerClient = "PARTNER_CLIENT",
//     RosterMember = "ROSTER_MEMBER",
//     MarketingEventAttendance = "MARKETING_EVENT_ATTENDANCE",
//     AllPages = "ALL_PAGES",
//     AiForecast = "AI_FORECAST",
//     CrmPipelinesDummyType = "CRM_PIPELINES_DUMMY_TYPE",
//     KnowledgeArticle = "KNOWLEDGE_ARTICLE",
//     PropertyInfo = "PROPERTY_INFO",
//     DataPrivacyConsent = "DATA_PRIVACY_CONSENT",
//     GoalTemplate = "GOAL_TEMPLATE",
//     ScoreConfiguration = "SCORE_CONFIGURATION",
//     Audience = "AUDIENCE",
//     PartnerClientRevenue = "PARTNER_CLIENT_REVENUE",
//     AutomationJourney = "AUTOMATION_JOURNEY",
//     Unknown = "UNKNOWN"
// }
// export const FieldTypeDefinitionTypeEnum {
//     String = "string",
//     Number = "number",
//     Bool = "bool",
//     Datetime = "datetime",
//     Enumeration = "enumeration",
//     Date = "date",
//     PhoneNumber = "phone_number",
//     CurrencyNumber = "currency_number",
//     Json = "json",
//     ObjectCoordinates = "object_coordinates"
// }
// export const FieldTypeDefinitionFieldTypeEnum {
//     Booleancheckbox = "booleancheckbox",
//     Checkbox = "checkbox",
//     Date = "date",
//     File = "file",
//     Number = "number",
//     Phonenumber = "phonenumber",
//     Radio = "radio",
//     Select = "select",
//     Text = "text",
//     Textarea = "textarea",
//     CalculationEquation = "calculation_equation",
//     CalculationRollup = "calculation_rollup",
//     CalculationScore = "calculation_score",
//     CalculationReadTime = "calculation_read_time",
//     Unknown = "unknown",
//     Html = "html"
// }