/** 
 * @file Automation.js
 * @import { FilterBranch } from './FilterBranch.js';
 * @import { enrollmentCriteriaTypeEnum } from './EnrollmentCriteriaEnums.js';
 */

// FlowBranchUpdate --------------------------------
/**
 * @typedef {Object} FlowBranchUpdate
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array<string>} valuesToRemove
 * @property {Array<string>} valuesToAdd
 * @export
 */


// Connection --------------------------------
/**
 *- edgeType: {@link EdgeTypeEnum}
 * @typedef {Object} Connection
 * @property {EdgeTypeEnum} edgeType
 * @property {string} nextActionId
 * @export
 */

// EnrollmentCriteria --------------------------------
/**
 * @typedef {Object} EnrollmentCriteria
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
 * @typedef {Object} PublicIndexedTimePoint
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
 * @typedef {Object} PublicIndexedTimePointIndexReference
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
