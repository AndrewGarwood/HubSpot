/**
 * @file src/utils/automation/types/Automation.ts
 */
import { FilterBranch } from "./FilterBranch";

/**
 * @typedefn `FlowBranchUpdate`
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array<string>} [valuesToAdd] `Array<string>`
 * @property {Array<string>} [valuesToRemove] `Array<string>`
 * @property {boolean} [replacePreviousValues]
 * @property {boolean} [enforceMaxValues]
 */
export type FlowBranchUpdate = {
    targetBranchName: string;
    targetProperty: string;
    valuesToAdd?: Array<string>;
    valuesToRemove?: Array<string>;
    replacePreviousValues?: boolean;
    enforceMaxValues?: boolean;
};



/**
 * @interface Connection
 * @property {EdgeTypeEnum} edgeType - see {@link EdgeTypeEnum}
 * @property {string} nextActionId
 */
export interface Connection {
    edgeType: EdgeTypeEnum;
    nextActionId: string;
}


// EnrollmentCriteria --------------------------------
/**
 * @interface EnrollmentCriteria
 * @property {boolean} shouldReEnroll
 * @property {FilterBranch} listFilterBranch - see {@link FilterBranch}
 * @property {boolean} unEnrollObjectsNotMeetingCriteria
 * @property {Array<FilterBranch>} reEnrollmentTriggersFilterBranches - `Array<`{@link FilterBranch}`>`
 * @property {EnrollmentCriteriaTypeEnum} type - see {@link EnrollmentCriteriaTypeEnum}
 */
export interface EnrollmentCriteria {
    shouldReEnroll: boolean;
    listFilterBranch: FilterBranch;
    unEnrollObjectsNotMeetingCriteria: boolean;
    reEnrollmentTriggersFilterBranches: Array<FilterBranch>;
    type: EnrollmentCriteriaTypeEnum;
}


// PublicIndexedTimePoint --------------------------------
/**
 * @interface PublicIndexedTimePoint
 * @property {PublicIndexOffset} offset
 * @property {string} timezoneSource
 * @property {PublicIndexedTimePointIndexReference} indexReference
 * @property {PublicIndexedTimePointTimeTypeEnum} timeType
 * @property {string} zoneId
 */
export interface PublicIndexedTimePoint {
    offset: PublicIndexOffset;
    timezoneSource: string;
    indexReference: PublicIndexedTimePointIndexReference;
    timeType: PublicIndexedTimePointTimeTypeEnum;
    zoneId: string;
}



// PublicIndexedTimePointIndexReference --------------------------------
/**
 * @interface PublicIndexedTimePointIndexReference
 * @property {number} [hour]
 * @property {number} [millisecond]
 * @property {PublicIndexedTimePointIndexReferenceReferenceTypeEnum} referenceType
 * @property {number} [minute]
 * @property {number} [second]
 * @property {PublicIndexedTimePointIndexReferenceDayOfWeekEnum} dayOfWeek
 * @property {number} month
 * @property {number} day
 */
export interface PublicIndexedTimePointIndexReference {
    hour?: number;
    millisecond?: number;
    referenceType: PublicIndexedTimePointIndexReferenceReferenceTypeEnum;
    minute?: number;
    second?: number;
    dayOfWeek: PublicIndexedTimePointIndexReferenceDayOfWeekEnum;
    month: number;
    day: number;
}



// PublicIndexOffset --------------------------------
/**
 * @interface PublicIndexOffset
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
export interface PublicIndexOffset {
    milliseconds?: number;
    hours?: number;
    seconds?: number;
    months?: number;
    weeks?: number;
    minutes?: number;
    quarters?: number;
    days?: number;
    years?: number;
}



/**
 * @enum {string} AutomationTypeEnum
 * @readonly
 * @property {string} WORKFLOW
 */
export enum AutomationTypeEnum {
    WORKFLOW = 'WORKFLOW',
}

/**
 * @enum {string} EnrollmentCriteriaTypeEnum
 * @readonly
 * @property {string} LIST_BASED
 */
export enum EnrollmentCriteriaTypeEnum {
    LIST_BASED = 'LIST_BASED',
}

/**
 * @enum {string} EdgeTypeEnum
 * @readonly
 * @property {string} STANDARD
 * @property {string} GOTO
 */
export enum EdgeTypeEnum {
    STANDARD = 'STANDARD',
    GOTO = 'GOTO',
}

/**
 * @enum {string} PublicTodayReferenceReferenceTypeEnum
 * @readonly
 * @property {string} TODAY
 */
export enum PublicTodayReferenceReferenceTypeEnum {
    TODAY = 'TODAY',
}

/**
 * @enum {string} PublicIndexedTimePointTimeTypeEnum
 * @readonly
 * @property {string} INDEXED
 */
export enum PublicIndexedTimePointTimeTypeEnum {
    INDEXED = 'Indexed',
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceReferenceTypeEnum
 * @readonly
 * @property {string} MONTH
 */
export enum PublicIndexedTimePointIndexReferenceReferenceTypeEnum {
    MONTH = 'MONTH',
}

/**
 * @enum {string} PublicIndexedTimePointIndexReferenceDayOfWeekEnum
 * @readonly
 * @property {string} MONDAY = "MONDAY",
 * @property {string} TUESDAY = "TUESDAY",
 * @property {string} WEDNESDAY = "WEDNESDAY",
 * @property {string} THURSDAY = "THURSDAY",
 * @property {string} FRIDAY = "FRIDAY",
 * @property {string} SATURDAY = "SATURDAY",
 * @property {string} SUNDAY = "SUNDAY"
 */
export enum PublicIndexedTimePointIndexReferenceDayOfWeekEnum {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}