/**
 * @file AutomationEnums.js
 * @module AutomationEnums
 * @export { 
 * AutomationTypeEnum, 
 * EnrollmentCriteriaTypeEnum, 
 * EdgeTypeEnum, 
 * PublicTodayReferenceReferenceTypeEnum, 
 * PublicIndexedTimePointTimeTypeEnum, 
 * PublicIndexedTimePointIndexReferenceReferenceTypeEnum, 
 * PublicIndexedTimePointIndexReferenceDayOfWeekEnum 
 * }
 */

/**
 * @enum {string} AutomationTypeEnum
 * @readonly
 *.
 *- WORKFLOW
 */
export const AutomationTypeEnum = {
    WORKFLOW: 'WORKFLOW',
};

/**
 * @enum {string} EnrollmentCriteriaTypeEnum
 * @readonly
 *.
 *- LIST_BASED
 */
export const EnrollmentCriteriaTypeEnum = {
    LIST_BASED: 'LIST_BASED',
};


/**
 * @enum {string} EdgeTypeEnum
 * @readonly
 *- STANDARD
 *- GOTO
 */
export const EdgeTypeEnum = {
    STANDARD: 'STANDARD',
    GOTO: 'GOTO',
};

/**
 * @enum {string} PublicTodayReferenceReferenceTypeEnum
 * @readonly
 *.
 *- TODAY
 */
export const PublicTodayReferenceReferenceTypeEnum = {
    TODAY: 'TODAY',
};

/**
 * @enum {string} PublicIndexedTimePointTimeTypeEnum
 * @readonly
 *.
 *- Indexed
 */
export const PublicIndexedTimePointTimeTypeEnum = {
    Indexed: "INDEXED"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceReferenceTypeEnum
 * @readonly
 *.
 * - Month
 */
export const PublicIndexedTimePointIndexReferenceReferenceTypeEnum = {
    Month: "MONTH"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceDayOfWeekEnum
 * @readonly
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
