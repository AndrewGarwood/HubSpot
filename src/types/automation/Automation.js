/** 
 * @file Automation.js
 * @module Automation
 */


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
 * @param {boolean} enforceMaxValues - boolean
 * @returns {FlowBranchUpdate} - .{@link FlowBranchUpdate}
 */
export function FlowBranchUpdate(
    targetBranchName, 
    targetProperty, 
    valuesToAdd=[], 
    valuesToRemove=[], 
    replacePreviousValues=false,
    enforceMaxValues=false,
) {
    return {
        targetBranchName: targetBranchName,
        targetProperty: targetProperty,
        valuesToAdd: valuesToAdd,
        valuesToRemove: valuesToRemove,
        replacePreviousValues: replacePreviousValues,
        enforceMaxValues: enforceMaxValues,
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
 * @property {boolean} enforceMaxValues
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
 * @property {string} listFilterBranch: {@link FilterBranch}
 * @property {string} reEnrollmentTriggersFilterBranches: Array\<{@link FilterBranch}> 
 * @property {string} type: {@link EnrollmentCriteriaTypeEnum} 
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
 * @property {string} offset: {@link PublicIndexOffset} 
 * @property {string} indexReference: {@link PublicIndexedTimePointIndexReference} 
 * @property {string} timeType: {@link PublicIndexedTimePointTimeTypeEnum}
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
 * @property {string} referenceType: {@link PublicIndexedTimePointIndexReferenceReferenceTypeEnum}
 * @property {string} dayOfWeek: {@link PublicIndexedTimePointIndexReferenceDayOfWeekEnum} 
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
 * @property {string} WORKFLOW
 */
export const AutomationTypeEnum = {
    WORKFLOW: 'WORKFLOW',
};

/**
 * @enum {string} EnrollmentCriteriaTypeEnum
 * @readonly
 *.
 * @property {string} LIST_BASED
 */
export const EnrollmentCriteriaTypeEnum = {
    LIST_BASED: 'LIST_BASED',
};


/**
 * @enum {string} EdgeTypeEnum
 * @readonly
 * @property {string} STANDARD
 * @property {string} GOTO
 */
export const EdgeTypeEnum = {
    STANDARD: 'STANDARD',
    GOTO: 'GOTO',
};

/**
 * @enum {string} PublicTodayReferenceReferenceTypeEnum
 * @readonly
 *.
 * @property {string} TODAY
 */
export const PublicTodayReferenceReferenceTypeEnum = {
    TODAY: 'TODAY',
};

/**
 * @enum {string} PublicIndexedTimePointTimeTypeEnum
 * @readonly
 *.
 * @property {string} Indexed
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
 * @property {string} Monday = "MONDAY",
 * @property {string} Tuesday = "TUESDAY",
 * @property {string} Wednesday = "WEDNESDAY",
 * @property {string} Thursday = "THURSDAY",
 * @property {string} Friday = "FRIDAY",
 * @property {string} Saturday = "SATURDAY",
 * @property {string} Sunday = "SUNDAY"
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
