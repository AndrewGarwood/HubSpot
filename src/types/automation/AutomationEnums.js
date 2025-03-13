/**
 * @file AutomationEnums.js
 * @module AutomationEnums
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

/**
 * node_modules\@hubspot\api-client\lib\codegen\crm\lists\models\PublicTodayReference.d.ts
 * @enum {string} PublicTodayReferenceReferenceTypeEnum
 * @readonly
 * @export
 *- TODAY
 */
export const PublicTodayReferenceReferenceTypeEnum = {
    TODAY: 'TODAY',
};

/**
 * @enum {string} PublicIndexedTimePointTimeTypeEnum
 * @readonly
 * @export
 *- Indexed
 */
export const PublicIndexedTimePointTimeTypeEnum = {
    Indexed: "INDEXED"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceReferenceTypeEnum
 * @readonly
 * @export
 *- Month
 */
export const PublicIndexedTimePointIndexReferenceReferenceTypeEnum = {
    Month: "MONTH"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceDayOfWeekEnum
 * @readonly
 * @export
 *- Monday = "MONDAY",
 *- Tuesday = "TUESDAY",
 *- Wednesday = "WEDNESDAY",
 *- Thursday = "THURSDAY",
 *- Friday = "FRIDAY",
 *- Saturday = "SATURDAY",
 *- Sunday = "SUNDAY"
 */
export const PublicIndexedTimePointIndexReferenceDayOfWeekEnum = {
    Monday: "MONDAY",
    Tuesday: "TUESDAY",
    Wednesday: "WEDNESDAY",
    Thursday: "THURSDAY",
    Friday: "FRIDAY",
    Saturday: "SATURDAY",
    Sunday: "SUNDAY"
}
