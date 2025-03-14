/** 
 * @file Automation.js
 * @module Automation
 */

// Referenced Type Imports:
/**
 * @import { EnrollmentCriteriaTypeEnum, EdgeTypeEnum, PublicIndexedTimePointTimeTypeEnum, PublicIndexedTimePointIndexReferenceReferenceTypeEnum, PublicIndexedTimePointIndexReferenceDayOfWeekEnum } from './AutomationEnums.js';
 * @typedef {import('./FilterBranch.js').FilterBranch} FilterBranch
 * @typedef {import('./FlowFilter.js').FlowFilter} FlowFilter
 * @typedef {import('./Action.js').Action} Action
 */



// FlowBranchUpdate --------------------------------
/**
 * @typedef {Object} FlowBranchUpdate
 * 
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array<string>} valuesToAdd
 * @property {Array<string>} valuesToRemove
 * @export
 */


// Connection --------------------------------
/**
 *- edgeType: {@link EdgeTypeEnum}
 * 
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
