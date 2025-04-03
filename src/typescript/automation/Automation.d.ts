/** 
 * @file Automation.d.ts
 * @module Automation
 */

// Referenced Type Imports:


import { FilterBranch } from "./FilterBranch";
import { FlowFilter } from "./FlowFilter";

// FlowBranchUpdate --------------------------------


/**
 * @typedefn FlowBranchUpdate
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array\<string>} valuesToAdd
 * @property {Array\<string>} valuesToRemove
 * @property {boolean} replacePreviousValues
 * @export
 */
export type FlowBranchUpdate = {
    targetBranchName: string;
    targetProperty: string;
    valuesToAdd: Array<string>;
    valuesToRemove: Array<string>;
    replacePreviousValues: boolean;
};

// Connection --------------------------------

/**
 * @typedefn Connection
 * @property {EdgeTypeEnum} edgeType {@link EdgeTypeEnum}
 * @property {string} nextActionId
 */
export type Connection = {
    edgeType: EdgeTypeEnum;
    nextActionId: string;
};

// EnrollmentCriteria --------------------------------
/**
 * @typedefn EnrollmentCriteria
 * @property {boolean} shouldReEnroll
 * @property {FilterBranch} listFilterBranch — {@link FilterBranch}
 * @property {boolean} unEnrollObjectsNotMeetingCriteria
 * @property {Array\<FilterBranch>} reEnrollmentTriggersFilterBranches — Array<{@link FilterBranch}> 
 * @property {EnrollmentCriteriaTypeEnum} type — {@link EnrollmentCriteriaTypeEnum} 
 */
export type EnrollmentCriteria = {
    shouldReEnroll: boolean;
    listFilterBranch: FilterBranch;
    unEnrollObjectsNotMeetingCriteria: boolean;
    reEnrollmentTriggersFilterBranches: Array<FilterBranch>;
    type: EnrollmentCriteriaTypeEnum;
};

// PublicIndexedTimePoint --------------------------------
/**
 * @typedefn PublicIndexedTimePoint
 * @property {PublicIndexOffset} offset {@link PublicIndexOffset}
 * @property {string} timezoneSource
 * @property {PublicIndexedTimePointIndexReference} indexReference {@link PublicIndexedTimePointIndexReference}
 * @property {PublicIndexedTimePointTimeTypeEnum} timeType {@link PublicIndexedTimePointTimeTypeEnum}
 * @property {string} zoneId
 */
export type PublicIndexedTimePoint = {
    offset: PublicIndexOffset;
    timezoneSource: string;
    indexReference: PublicIndexedTimePointIndexReference;
    timeType: PublicIndexedTimePointTimeTypeEnum;
    zoneId: string;
};

// PublicIndexedTimePointIndexReference --------------------------------
/**
 * @typedefn PublicIndexedTimePointIndexReference
 * @property {number} [hour]
 * @property {number} [millisecond]
 * @property {PublicIndexedTimePointIndexReferenceReferenceTypeEnum} referenceType {@link PublicIndexedTimePointIndexReferenceReferenceTypeEnum}
 * @property {number} [minute]
 * @property {number} [second]
 * @property {PublicIndexedTimePointIndexReferenceDayOfWeekEnum} dayOfWeek {@link PublicIndexedTimePointIndexReferenceDayOfWeekEnum}
 * @property {number} month
 * @property {number} day
 */
export type PublicIndexedTimePointIndexReference = {
    hour?: number;
    millisecond?: number;
    referenceType: PublicIndexedTimePointIndexReferenceReferenceTypeEnum;
    minute?: number;
    second?: number;
    dayOfWeek: PublicIndexedTimePointIndexReferenceDayOfWeekEnum;
    month: number;
    day: number;
};

// PublicIndexOffset --------------------------------
/**
 * @typedefn PublicIndexOffset
 * @property {number} [milliseconds]
 * @property {number} [hours]
 * @property {number} [seconds]
 * @property {number} [months]
 * @property {number} [weeks]
 * @property {number} [minutes]
 * @property {number} [quarters]
 * @property {number} [days]
 * @property {number} [years]
 */
export type PublicIndexOffset = {
    milliseconds?: number;
    hours?: number;
    seconds?: number;
    months?: number;
    weeks?: number;
    minutes?: number;
    quarters?: number;
    days?: number;
    years?: number;
};

/**
 * @enum {string} AutomationTypeEnum
 * @readonly
 * @property {string} WORKFLOW - Represents a workflow automation type
 * @property {string} SEQUENCE - Represents a sequence automation type
 */
export declare enum AutomationTypeEnum {
    WORKFLOW = 'WORKFLOW',
    SEQUENCE = 'SEQUENCE',
}

/**
 * @enum {string} EnrollmentCriteriaTypeEnum
 * @readonly
 * @property {string} LIST_BASED - Represents a list-based enrollment criteria type
 */
export declare enum EnrollmentCriteriaTypeEnum {
    LIST_BASED = 'LIST_BASED',
}


/**
 * @enum {string} EdgeTypeEnum
 * @readonly
 * @property {string} STANDARD - Represents a standard edge type
 * @property {string} GOTO - Represents a goto edge type
 */
export declare enum EdgeTypeEnum {
    STANDARD = 'STANDARD',
    GOTO = 'GOTO',
}

/**
 * @enum {string} PublicTodayReferenceReferenceTypeEnum
 * @readonly
 * @property {string} TODAY - Represents a today reference type
 */
export declare enum PublicTodayReferenceReferenceTypeEnum {
    TODAY = 'TODAY',
}

/**
 * @enum {string} PublicIndexedTimePointTimeTypeEnum
 * @readonly
 * @property {string} INDEXED - Represents an indexed time type
 */
export declare enum PublicIndexedTimePointTimeTypeEnum {
    INDEXED = "INDEXED"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceReferenceTypeEnum
 * @readonly
 * @property {string} MONTH - Represents a month reference type
 */
export declare enum PublicIndexedTimePointIndexReferenceReferenceTypeEnum {
    MONTH = "MONTH"
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceDayOfWeekEnum
 * @readonly
 * @property {string} MONDAY - Represents Monday
 * @property {string} TUESDAY - Represents Tuesday
 * @property {string} WEDNESDAY - Represents Wednesday
 * @property {string} THURSDAY - Represents Thursday
 * @property {string} FRIDAY - Represents Friday
 * @property {string} SATURDAY - Represents Saturday
 * @property {string} SUNDAY - Represents Sunday
 */
export declare enum PublicIndexedTimePointIndexReferenceDayOfWeekEnum {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
