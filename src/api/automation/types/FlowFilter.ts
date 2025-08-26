/**
 * @file src/utils/automation/types/FlowFilter.ts
 */
import { Operation } from "./Operation";


export const MAX_VALUES_PER_FILTER = 5000;

/**
 * @interface FlowFilter
 * @property {string} property
 * @property {Operation} operation
 * @property {FlowFilterTypeEnum} filterType - see {@link FlowFilterTypeEnum}
 */
export interface FlowFilter {
    property: string;
    operation: Operation;
    filterType: FlowFilterTypeEnum;
}

/**
 * @enum {string} FlowFilterTypeEnum
 * @readonly
 * @property {string} PROPERTY
 */
export enum FlowFilterTypeEnum {
    PROPERTY = 'PROPERTY',
}