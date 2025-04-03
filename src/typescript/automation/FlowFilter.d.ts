/**
 * @file FlowFilter.d.ts
 * @module FlowFilter
 */

// Testing type hint tooltip when use an interface in a .d.ts file

import { Operation } from './Operation';

/**
 * @enum {string} FlowFilterTypeEnum
 * @property {string} PROPERTY - filter on a HubSpot object's property
 */
export declare enum FlowFilterTypeEnum {
    PROPERTY = 'PROPERTY'
}

/**
 * @typedefn FlowFilter
 * @property {string} property - The property to filter on
 * @property {Operation} operation - (See {@link Operation}) The operation to perform on the property
 * @property {FlowFilterTypeEnum} filterType - The type of filter, see {@link FlowFilterTypeEnum}
 */
export type FlowFilter = {
    property: string;
    operation: Operation;
    filterType: FlowFilterTypeEnum;
}