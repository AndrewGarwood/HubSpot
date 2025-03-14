/** 
 * @file Automation.js
 * @module Automation
 */

// Referenced Type Imports:
/**
 * @typedef {import('./FilterBranch.js').FilterBranch} FilterBranch
 * @typedef {import('./FlowFilter.js').FlowFilter} FlowFilter
 * @typedef {import('./Action.js').Action} Action
 */



// FlowBranchUpdate --------------------------------


/**
 * @param {string} targetBranchName - string
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {boolean} replacePreviousValues - boolean
 * @returns {FlowBranchUpdate} - .{@link FlowBranchUpdate}
 */
export function FlowBranchUpdate(targetBranchName, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues) {
    return {
        targetBranchName: targetBranchName,
        targetProperty: targetProperty,
        valuesToAdd: valuesToAdd || [],
        valuesToRemove: valuesToRemove || [],
        replacePreviousValues: replacePreviousValues || false,
    };
}

/**
 * @typedef {Object} FlowBranchUpdate
 * 
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array<string>} valuesToAdd
 * @property {Array<string>} valuesToRemove
 * @property {boolean} replacePreviousValues
 * @export
 */

// Connection --------------------------------


/**
 * @param {EdgeTypeEnum} edgeType - {@link EdgeTypeEnum}
 * @param {string} nextActionId - string
 * @returns {Connection} - .{@link Connection}
 */
export function Connection(edgeType=EdgeTypeEnum.STANDARD, nextActionId) {
    return {
        edgeType: edgeType,
        nextActionId: nextActionId,
    };
}

/**
 * @typedef {Object} Connection
 * 
 * @property {EdgeTypeEnum} edgeType
 * @property {string} nextActionId
 * @export
 */

// EnrollmentCriteria --------------------------------
/**
 *- listFilterBranch: {@link FilterBranch}
 *- reEnrollmentTriggersFilterBranches: Array\<{@link FilterBranch}> 
 *- type: {@link EnrollmentCriteriaTypeEnum} 
 * 
 * @typedef {Object} EnrollmentCriteria
 * 
 * @property {boolean} shouldReEnroll
 * @property {FilterBranch} listFilterBranch
 * @property {boolean} unEnrollObjectsNotMeetingCriteria
 * @property {Array<FilterBranch>} reEnrollmentTriggersFilterBranches
 * @property {EnrollmentCriteriaTypeEnum} type
 * @export
 */

// PublicIndexedTimePoint --------------------------------
/**
 *- offset: {@link PublicIndexOffset} 
 *- indexReference: {@link PublicIndexedTimePointIndexReference} 
 *- timeType: {@link PublicIndexedTimePointTimeTypeEnum}
 * 
 * @typedef {Object} PublicIndexedTimePoint
 * 
 * @property {PublicIndexOffset} offset
 * @property {string} timezoneSource
 * @property {PublicIndexedTimePointIndexReference} indexReference
 * @property {PublicIndexedTimePointTimeTypeEnum} timeType
 * @property {string} zoneId
 * @export
 */

// PublicIndexedTimePointIndexReference --------------------------------
/**
 *- referenceType: {@link PublicIndexedTimePointIndexReferenceReferenceTypeEnum}
 *- dayOfWeek: {@link PublicIndexedTimePointIndexReferenceDayOfWeekEnum} 
 * 
 * @typedef {Object} PublicIndexedTimePointIndexReference
 * 
 * @property {number} [hour]
 * @property {number} [millisecond]
 * @property {PublicIndexedTimePointIndexReferenceReferenceTypeEnum} referenceType
 * @property {number} [minute]
 * @property {number} [second]
 * @property {PublicIndexedTimePointIndexReferenceDayOfWeekEnum} dayOfWeek
 * @property {number} month
 * @property {number} day
 * @export
 */

// PublicIndexOffset --------------------------------
/**
 * @typedef {Object} PublicIndexOffset
 * @property {number} [milliseconds]
 * @property {number} [hours]
 * @property {number} [seconds]
 * @property {number} [months]
 * @property {number} [weeks]
 * @property {number} [minutes]
 * @property {number} [quarters]
 * @property {number} [days]
 * @property {number} [years]
 * @export
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
