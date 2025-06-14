/**
 * @file src/automation/flowFactory.ts
 */

import { debugLogs } from "./flows";
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from "../config";
import { 
    FlowFilter, FilterBranchTypeEnum, FilterBranchOperatorEnum, FilterBranch, 
    NumericOperatorEnum, OperationTypeEnum, Operation, FlowFilterTypeEnum, 
    ListBranch, MAX_VALUES_PER_FILTER, OperatorEnum 
} from "./types";

/**
 * Divides elements of an array into a specified minimum number of subarrays as evenly as possible.
 * @param arr - The array to divide.
 * @param minNumSubarrays - The number of subarrays to create.
 * @param maxSubarraySize - The maximum size of each subarray.
 * @throws {Error} If arr is not an array or if `minNumSubarrays` is less than or equal to 0 or if `maxSubarraySize` is less than or equal to 0.
 * @returns **`subarrays`** `Array<Array<any>>` An array of subarrays.
 * `subarrays.length` >= `Math.min(minNumSubarrays, arr.length)`
 * `subarrays[i].length` <= `maxSubarraySize`
 */
export function partitionArrayByNumSubarrays(arr: Array<any>, minNumSubarrays: number, maxSubarraySize: number): Array<Array<any>> {
    if (!Array.isArray(arr)) {
        throw new Error('Input must be an array.');
    }
    if (minNumSubarrays <= 0) {
        throw new Error(`Minimum number of subarrays must be greater than 0, but got ${minNumSubarrays}.`);
    }
    if (maxSubarraySize <= 0) {
        throw new Error(`Maximum subarray size must be greater than 0, but got ${maxSubarraySize}.`);
    }
    if (arr.length === 0) {
        return [[]];
    }
    if (arr.length <= minNumSubarrays) {
        return arr.map(item => [item]);
    }
    let subarrays: Array<Array<any>> = [];
    let numElements = arr.length;
    let subarraySize = Math.ceil(numElements / minNumSubarrays);
    for (let i = 0; i < numElements; i += subarraySize) {
        subarrays.push(arr.slice(i, i + Math.min(subarraySize, maxSubarraySize)));
    }
    return subarrays;
}

/**
 * @param listBranch {@link ListBranch} 
 * @param targetProperty 
 * @returns **`lengths`**: `Array<number>`
 * @description Get lengths of filter values for each filter branch in the list branch.
 */
export function getListBranchFlowFilterValueArrayLengths(
    listBranch: ListBranch,
    targetProperty: string,
): Array<number>{
    if (!listBranch || !listBranch.filterBranch) {
        return [];
    }
    let filterBranches = listBranch.filterBranch.filterBranches;
    if (!filterBranches || filterBranches.length === 0) {
        return [];
    }
    let lengths: number[] = [];
    for (let filterBranch of filterBranches) {
        let flowFilters = filterBranch.filters;
        if (!flowFilters || flowFilters.length === 0) {
            continue;
        }
        let flowFilter: FlowFilter | undefined = flowFilters.find(filter => filter.property === targetProperty);
        if (!flowFilter || !flowFilter.operation || !flowFilter.operation.values) {
            continue;
        }
        lengths.push(flowFilter.operation.values.length);
    }
    return lengths;
}

/**
 * @param flowFilters - `Array<`{@link FlowFilter}`>`
 * @param filterBranchType - {@link FilterBranchTypeEnum}
 * @param filterBranchOperator - {@link FilterBranchOperatorEnum}
 * @returns {FilterBranch} **`filterBranch`** - {@link FilterBranch}
 */
export function generateNumericFilterBranch(
    flowFilters: Array<FlowFilter>, 
    filterBranchType: FilterBranchTypeEnum=FilterBranchTypeEnum.AND, 
    filterBranchOperator: FilterBranchOperatorEnum=FilterBranchOperatorEnum.AND
): FilterBranch {
    let filterBranch = {
        filterBranches: [],
        filters: flowFilters,
        filterBranchType: filterBranchType,
        filterBranchOperator: filterBranchOperator
    } as FilterBranch;
    return filterBranch;
}

/**
 * @param numericTargetProperty - `string`
 * @param minimum - `number`
 * @param maximum - `number`
 * @returns {FilterBranch} **`filterBranch`** - {@link FilterBranch}
 */
export function numberIsBetweenFilterBranch(
    numericTargetProperty: string, 
    minimum: number, 
    maximum: number
): FilterBranch | null {
    let numericFlowFilterPair = generateNumericRangeFlowFilterPair(
        numericTargetProperty,
        NumericOperatorEnum.IS_GREATER_THAN_OR_EQUAL_TO,
        NumericOperatorEnum.IS_LESS_THAN_OR_EQUAL_TO,
        minimum,
        maximum
    );
    if (!numericFlowFilterPair || numericFlowFilterPair.length !== 2) {
        debugLogs.push(NL + ` Error in numberIsBetweenFilterBranch() b/c numericFlowFilterPair was undefined or had length !== 2.`);
        return null;
    }
    let inclusiveRangeFilterBranch = generateNumericFilterBranch(
        numericFlowFilterPair,
        FilterBranchTypeEnum.AND,
        FilterBranchOperatorEnum.AND
    )
    return inclusiveRangeFilterBranch;
}

/**
 * @param numericTargetProperty - `string`
 * @param lowerBoundOperator - {@link NumericOperatorEnum}
 * @param upperBoundOperator - {@link NumericOperatorEnum}
 * @param minimum - `number`
 * @param maximum - `number`
 * @returns {Array<FlowFilter>} **`flowFilters`** - `Array<`{@link FlowFilter}`>`
 */
export function generateNumericRangeFlowFilterPair(
    numericTargetProperty: string, 
    lowerBoundOperator: NumericOperatorEnum, 
    upperBoundOperator: NumericOperatorEnum, 
    minimum: number, 
    maximum: number
): Array<FlowFilter> {
    if (!numericTargetProperty || !minimum || !maximum) {
        debugLogs.push(NL + ` Skipping generateInclusiveNumericRangeFlowFilterPair() b/c one of the parameters was undefined.`);
        return [];
    }
    if (minimum > maximum) {
        debugLogs.push(NL + ` Skipping generateInclusiveNumericRangeFlowFilterPair() b/c minimum > maximum.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_GREATER_THAN, NumericOperatorEnum.IS_GREATER_THAN_OR_EQUAL_TO].includes(lowerBoundOperator)) {
        debugLogs.push(NL + ` Skipping generateInclusiveNumericRangeFlowFilterPair() b/c lowerBoundOperator was not IS_GREATER_THAN or IS_GREATER_THAN_OR_EQUAL_TO.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_LESS_THAN, NumericOperatorEnum.IS_LESS_THAN_OR_EQUAL_TO].includes(upperBoundOperator)) {
        debugLogs.push(NL + ` Skipping generateInclusiveNumericRangeFlowFilterPair() b/c upperBoundOperator was not IS_LESS_THAN or IS_LESS_THAN_OR_EQUAL_TO.`);
        return [];
    }
    let lowerBoundFlowFilter = generateNumericComparisonFlowFilter(
        numericTargetProperty,
        lowerBoundOperator,
        minimum,
    )
    let upperBoundFlowFilter = generateNumericComparisonFlowFilter(
        numericTargetProperty,
        upperBoundOperator,
        maximum,
    )
    if (!lowerBoundFlowFilter || !upperBoundFlowFilter) {
        debugLogs.push(NL + `Skipping generateInclusiveNumericRangeFlowFilterPair() b/c one of [lowerBoundFlowFilter, upperBoundFlowFilter] was undefined.`, lowerBoundFlowFilter, upperBoundFlowFilter);
        return [];
    }
    return [lowerBoundFlowFilter, upperBoundFlowFilter];
}

/**
 * @param targetProperty 
 * @param operator see {@link NumericOperatorEnum}
 * @param value 
 * @returns {FlowFilter | null} **`flowFilter`** - {@link FlowFilter}
 */
export function generateNumericComparisonFlowFilter(
    targetProperty: string,
    operator: NumericOperatorEnum,
    value: number,
): FlowFilter | null {
    if (!targetProperty || !operator || !value) {
        debugLogs.push(NL + `Skipping generateNumericComparisonFlowFilter() b/c one of the parameters was undefined.`);
        return null;
    }
    let flowFilter = {
        property: targetProperty,
        operation: {
            operator: operator,
            includeObjectsWithNoValueSet: false,
            values: undefined,
            value: value,
            operationType: OperationTypeEnum.NUMBER
        } as Operation,
        filterType: FlowFilterTypeEnum.PROPERTY
    } as FlowFilter;
    return flowFilter;
}
/**
 * 
 * @param listBranch - {@link ListBranch}
 * @param targetProperty 
 * @returns {ListBranch} **`partitionedListBranch`** — {@link ListBranch}
 */
export function distributeFilterValuesOfListBranch(
    listBranch: ListBranch,
    targetProperty: string,
    maxValuesPerFilter = MAX_VALUES_PER_FILTER,
): ListBranch {
    if (!listBranch || !listBranch.filterBranch) {
        return listBranch;
    }
    let filterBranches = listBranch.filterBranch.filterBranches;
    if (!filterBranches || filterBranches.length === 0) {
        return listBranch;
    }
    let newFilterBranches: FilterBranch[] = [];
    for (let filterBranch of filterBranches) {
        let flowFilters = filterBranch.filters;
        if (!flowFilters || flowFilters.length === 0) {
            continue;
        }
        for (let flowFilter of flowFilters) {
            /**if it's a numeric or non-string filter, don't partition it */
            let isNotStringFilter = (  
                flowFilter.operation 
                && (Object.values(NumericOperatorEnum).includes(flowFilter.operation.operationType as unknown as NumericOperatorEnum) 
                    || flowFilter.operation.operationType !== OperationTypeEnum.MULTISTRING
                )
            );
            /** @type {boolean}if it's a string filter and has less than maxValuesPerFilter values, don't partition it */
            let isCompliantStringFilter: boolean = Boolean( 
                flowFilter.operation 
                && flowFilter.operation.operationType === OperationTypeEnum.MULTISTRING
                && flowFilter.operation.values
                && flowFilter.operation.values.length
                && flowFilter.operation.values.length <= maxValuesPerFilter
            )
            if (!flowFilter
                || flowFilter.property !== targetProperty
                || isNotStringFilter
                || isCompliantStringFilter
                || !flowFilter.operation
                || !flowFilter.operation.values
            ) {
                newFilterBranches.push(filterBranch);
                continue;
            }
            let batches = partitionArrayByNumSubarrays(
                flowFilter.operation.values as Array<string>,
                Math.ceil(flowFilter.operation.values.length / maxValuesPerFilter),
                maxValuesPerFilter
            );
            newFilterBranches.push(
                ...batchGeneratePropertyContainsStringChildFilterBranch(batches, targetProperty)
            );
        }
    }
    debugLogs.push(NL + `Number of filter branches after distribution: ${newFilterBranches.length}`);
    listBranch.filterBranch.filterBranches = newFilterBranches;
    return listBranch;
}

/**
 * @param valueArray - `Array<string>`
 * @param targetProperty 
 * @returns {FilterBranch | null} **`filterBranch`** - {@link FilterBranch}
 */
export function generatePropertyContainsStringChildFilterBranch(
    valueArray: Array<string>, targetProperty: string
): FilterBranch | null {
    if (!valueArray || valueArray.length === 0) {
        return null;
    }
    let filterBranch: FilterBranch = {
        filterBranches: [],
        filters: [{
            property: targetProperty,
            operation: {
                operator: OperatorEnum.CONTAINS,
                includeObjectsWithNoValueSet: false,
                values: valueArray,
                operationType: OperationTypeEnum.MULTISTRING
            } as Operation,
            filterType: FlowFilterTypeEnum.PROPERTY
        } as FlowFilter],
        filterBranchType: FilterBranchTypeEnum.AND,
        filterBranchOperator: FilterBranchOperatorEnum.AND
    };
    return filterBranch;
}

/**
 * @param valueBatches - `Array<Array<string>>`
 * @param targetProperty - `string`
 * @returns {Array<FilterBranch>} **`filterBranches`** - `Array<`{@link FilterBranch}`>`
 */
export function batchGeneratePropertyContainsStringChildFilterBranch(
    valueBatches: Array<Array<string>>, 
    targetProperty: string
): Array<FilterBranch> {
    if (!valueBatches || valueBatches.length === 0) {
        return [];
    }
    let filterBranches: FilterBranch[] = [];
    for (let batch of valueBatches) {
        let filterBranch = generatePropertyContainsStringChildFilterBranch(batch, targetProperty);
        if (filterBranch) {
            filterBranches.push(filterBranch);
        }
    }
    return filterBranches;
}