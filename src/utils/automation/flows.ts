/**
 * @file src/utils/automation/flows.ts
 */

import { HUBSPOT_ACCESS_TOKEN, FLOWS_API_URL, OUTPUT_DIR } from '../../config/env'
import path from 'node:path';
import { AxiosCallEnum as HTTP, AxiosContentTypeEnum as CONTENT_TYPE} from '../../types/AxiosEnums';
import { 
    Flow, Action, ActionTypeEnum, ActionTypeIdEnum, FlowFilter, FlowFilterTypeEnum, MAX_VALUES_PER_FILTER,
    Operation, OperatorEnum, OperationTypeEnum, NumericOperatorEnum, FilterBranch, FilterBranchTypeEnum, FilterBranchOperatorEnum, ListBranch, FlowBranchUpdate 
} from './types';

const BEARER_ACCESS_TOKEN = `Bearer ${HUBSPOT_ACCESS_TOKEN}`;

/**
 * @param {string} flowId `string` 
 * @returns `response` = `Promise<`{@link Flow}`>`
 */
export async function getFlowById(flowId: string): Promise<Flow | undefined> {
    try {
        const response = await fetch(path.join(FLOWS_API_URL, flowId), {
            method: HTTP.GET,
            headers: {
                "accept": CONTENT_TYPE.JSON,
                'Content-Type': CONTENT_TYPE.JSON,
                'Authorization': BEARER_ACCESS_TOKEN
            }
        });
        if (!response.ok) {
            console.error(JSON.stringify(response, null, 4));
            throw new Error(`HTTP request failed with status ${response.status}`);
        }
        return response.json();
    } catch (e) {
        console.error('Error in getFlowById():', e);
        return undefined;
    }
}

/**
 * @param {string} flowId `string`
 * @param {Flow} flowDefinition {@link Flow}  
 * @returns `response` = `Promise<`{@link Flow}`>`
 */
export async function setFlowById(flowId: string, flowDefinition: Flow): Promise<Flow | undefined> {
    try {
        const response = await fetch(path.join(FLOWS_API_URL, flowId), {
            method: HTTP.PUT,
            headers: {
                "accept": CONTENT_TYPE.JSON,
                'Content-Type': CONTENT_TYPE.JSON,
                'Authorization': BEARER_ACCESS_TOKEN
            },
            body: JSON.stringify(flowDefinition)
        });
        if (!response.ok) {
            throw new Error(`HTTP request failed with status ${response.status}`);
        }
        return response.json();
    } catch (e) {
        console.error('Error in setFlowById():', e);
        return undefined;
    }
}

/**
 * override previous content of `filter.operation.values` with `values`
 * @param {FlowFilter} filter {@link FlowFilter}
 * @param {string} targetProperty - `string`
 * @param {Array<string>} values - `Array<string>`
 * @returns {FlowFilter} `filter` — {@link FlowFilter}
 */
export function setFlowFilterValues(
    filter: FlowFilter, 
    targetProperty: string, 
    values: string[]
): FlowFilter {
    if (!filter || !values || values.length === 0) {
        return filter;
    }
    if (filter.property !== targetProperty || !filter.operation) {
        console.log(`\tSkipping filter in setFlowFilterValues(), property ${filter.property} !== ${targetProperty}`);
        return filter;
    }
    if (!filter.operation.values) {
        filter.operation.values = [];
    }
    const sameLength = filter.operation.values.length === values.length;
    const sameValues = filter.operation.values.every(value => values.includes(value));
    if (sameLength && sameValues) { // no change to filter
        console.log(`\tNo change after setFlowFilterValues() for property ${targetProperty}.`);
        return filter;
    }
    filter.operation.values = values;
    return filter;
}

/**
 * @param {FlowFilter} filter {@link FlowFilter}
 * @param {string} targetProperty - `string`
 * @param {Array<string>} valuesToRemove - `Array<string>`
 * @returns {FlowFilter} `filter` — {@link FlowFilter}
 */
export function removeValuesFromFilter(
    filter: FlowFilter, 
    targetProperty: string, 
    valuesToRemove: string[]
): FlowFilter {
    if (!filter || !valuesToRemove || valuesToRemove.length === 0) {
        return filter;
    }
    if (filter.property !== targetProperty || !filter.operation || !filter.operation.values) {
        return filter;
    }
    filter.operation.values = filter.operation.values.filter(
        value => !valuesToRemove.includes(value)
    );
    return filter;
}

/**
 * @param {FlowFilter} filter {@link FlowFilter}
 * @param {string} targetProperty - `string`
 * @param {Array<string>} valuesToAdd - `Array<string>`
 * @returns {FlowFilter} `filter` — {@link FlowFilter}
 */
export function addValuesToFilter(
    filter: FlowFilter, 
    targetProperty: string, 
    valuesToAdd: string[]
): FlowFilter {
    if (!filter || !valuesToAdd || valuesToAdd.length === 0) {
        return filter;
    }
    if (filter.property !== targetProperty || !filter.operation) {
        return filter;
    }
    if (!filter.operation.values) {
        filter.operation.values = [];
    }
    for (let value of valuesToAdd) {
        if (!filter.operation.values.includes(value)) {
            filter.operation.values.push(value);
        }
    }
    return filter;
}

/**
 * Gets first listBranch with matching branchName.
 * Log branchName to console and return listBranch if found else, log not found and return null.
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - `string`
 * @returns {ListBranch} `listBranch` {@link ListBranch}
 */
export function getListBranchByName(
    flow: Flow, 
    targetBranchName: string
): ListBranch | null {
    if (!targetBranchName) {
        console.log(`\t Exiting getListBranchByName() - input targetBranchName was undefined.`);
        return null;
    }
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return null;
    }
    let actions: Action[] = flow.actions;
    console.log(`\tBegin search for branch: ${targetBranchName}`);
    for (let action of actions) {
        if (!action
            || action.type !== ActionTypeEnum.LIST_BRANCH
            || !action.listBranches
            || (action.actionTypeId && action.actionTypeId === ActionTypeIdEnum.SET_PROPERTY)
        ) {
            console.log(`\t\t Skipping action: ${action.actionId} with type: ${action.type}`);
            continue;
        }
        let listBranch = Object.values(action.listBranches).find(
            listBranch => listBranch.branchName === targetBranchName
        );
        if (listBranch) {
            console.log(`\t getListBranchByName() Found branch "${targetBranchName}" at actionId: ${action.actionId} with type: ${action.type}`);
            return listBranch;
        }
    }
    console.log(`No branch found with name: ${targetBranchName}`);
    return null;
}
/**
 *- `flow.action.listBranches` - `Array<`{@link ListBranch}`>`
 * @param {Flow} flow {@link Flow}
 * @returns {boolean} `boolean`
 */
export function hasUniqueBranchNames(flow: Flow): boolean {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return true;
    }
    try {
        let allBranchNames: string[] = getAllBranchNames(flow);
        let uniqueBranchNames: string[] = Array.from(new Set(allBranchNames));
        return allBranchNames.length === uniqueBranchNames.length;
    } catch (e) {
        console.error('Error in hasUniqueBranchNames():', e);
        return false;
    }
}

/**
 * Get all {@link ListBranch} names from a {@link Flow} object.
 * @param {Flow} flow {@link Flow}
 * @returns {Array<string>} `branchNames`: `Array<string>`
 */
export function getAllBranchNames(flow: Flow): Array<string> {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return [];
    }
    let branchNames: string[] = [];
    let actions = flow.actions;
    for (let action of actions) {
        if (action.type !== ActionTypeEnum.LIST_BRANCH || !action.listBranches) {
            continue;
        }
        for (let listBranch of Object.values(action.listBranches)) {
            if (listBranch.branchName) {
                branchNames.push(listBranch.branchName);
            } else {
                console.log(`\t\t Skipping listBranch with undefined branchName.`);
            }
        }
    }
    return branchNames;
}


/**
 * @param {ListBranch} listBranch 
 * @param {Array<FilterBranch>} newChildFilterBranches - `Array<`{@link FilterBranch}`>`
 * @returns {ListBranch} `listBranch` - {@link ListBranch}
 */
export function setChildFilterBranchesOfListBranch(
    listBranch: ListBranch,
    newChildFilterBranches: Array<FilterBranch>,
): ListBranch {
    if (!listBranch || !listBranch.filterBranch) {
        console.log(`\t Exiting setChildFilterBranchesOfListBranch() - input listBranch was undefined or does not have defined filterBranch.`);
        return listBranch;
    }
    if (!newChildFilterBranches || newChildFilterBranches.length === 0) {
        console.log(`\t Exiting setChildFilterBranchesOfListBranch() - input newChildFilterBranches was undefined or empty.`);
        return listBranch;
    }
    let filterBranch = listBranch.filterBranch;
    filterBranch.filterBranches = newChildFilterBranches;
    return listBranch;
}

/**
 * @param {Flow} flow - {@link Flow}
 * @param {string} targetBranchName 
 * @param {Array<FilterBranch>} newChildFilterBranches - `Array<`{@link FilterBranch}`>`
 * @returns {Flow} `flow` - {@link Flow}
 */
export function setChildFilterBranchesByListBranchName(
    flow: Flow,
    targetBranchName: string,
    newChildFilterBranches: Array<FilterBranch>,
): Flow {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        console.log(`\t Exiting setChildFilterBranchesByListBranchName() - input flow was undefined or had no actions.`);
        return flow;
    }
    let listBranch = getListBranchByName(flow, targetBranchName);
    if (!listBranch) {
        console.log(`\t Exiting setChildFilterBranchesByListBranchName() - input listBranch was undefined.`);
        return flow;
    }
    listBranch = setChildFilterBranchesOfListBranch(listBranch, newChildFilterBranches);
    return flow;
}

/**
 * adds `childFilterBranch` to first `listBranch` with matching `branchName`.
 * @param {Flow} flow - {@link Flow}
 * @param {string} targetBranchName - `string`
 * @param {FilterBranch} childFilterBranch - {@link FilterBranch}
 * @returns {Flow} `flow` - {@link Flow}
 */
export function addChildFilterBranchToListBranchByName(
    flow: Flow,
    targetBranchName: string,
    childFilterBranch: FilterBranch,
): Flow {
    if (!targetBranchName) {
        console.log(`\t Exiting addChildFilterBranchToListBranchByName() - input targetBranchName was undefined.`);
        return flow;
    }
    if (!flow || !flow.actions || flow.actions.length === 0 || !childFilterBranch) {
        return flow;
    }
    let branch: ListBranch | null = getListBranchByName(flow, targetBranchName);
    if (!branch) {
        return flow;
    }
    branch.filterBranch.filterBranches.push(childFilterBranch);
    return flow;
}

/**
 * 
 * @param {ListBranch} listBranch {@link ListBranch} 
 * @param {string} targetProperty 
 * @returns {Array<number>} `lengths`: `Array<number>`
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
 * 
 * @param {Flow | undefined} flow {@link Flow}
 * @param {string} flowId 
 * @returns {boolean} `boolean`
 * @description Checks if flow exists and has unique branch names.
 */
export function flowExistsAndHasUniqueBranches(
    flow: Flow | undefined, 
    flowId: string
): boolean {
    if (!flowId) {
        console.error(`flowExistsAndHasUniqueBranches() Flow ID is undefined.`);
        return false;
    }
    if (!flow || typeof flow !== 'object') {
        console.error(`Flow not found (undefined or null or non object): ${flowId}`);
        return false;
    } else if (!hasUniqueBranchNames(flow)) {
        console.error(`Flow has duplicate branch names: ${flowId}`);
        console.log('getAllBranchNames(flow): ', getAllBranchNames(flow));
        return false;
    }
    return true;
}
/**
 * Divides elements of an array into a specified minimum number of subarrays as evenly as possible.
 * @param {Array<any>} arr - The array to divide.
 * @param {number} minNumSubarrays - The number of subarrays to create.
 * @param {number} maxSubarraySize - The maximum size of each subarray.
 * @throws {Error} If arr is not an array or if `minNumSubarrays` is less than or equal to 0 or if `maxSubarraySize` is less than or equal to 0.
 * @returns `subarrays` `Array<Array<any>>` An array of subarrays.
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
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty - `string`
 * @param {Array<string>} valuesToAdd - `Array<string>`
 * @param {Array<string>} valuesToRemove - `Array<string>`
 * @param {boolean} replacePreviousValues - `boolean`
 * @returns {FilterBranch}
 */
export function updateFilterBranchChildFilterBranches(
    filterBranch: FilterBranch,
    targetProperty: string,
    valuesToAdd: Array<string> = [],
    valuesToRemove: Array<string> = [],
    replacePreviousValues: boolean = false
): FilterBranch {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    for (let childFilterBranch of filterBranch.filterBranches) {
        childFilterBranch = updateFilterBranchFlowFilters(
            childFilterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty - `string`
 * @param {Array<string>} valuesToAdd - `Array<string>`
 * @param {Array<string>} valuesToRemove - `Array<string>`
 * @param {boolean} replacePreviousValues - `boolean`
 * @returns {FilterBranch} `filterBranch` — {@link FilterBranch}
 */
export function updateFilterBranchFlowFilters(
    filterBranch: FilterBranch,
    targetProperty: string,
    valuesToAdd: Array<string> = [],
    valuesToRemove: Array<string> = [],
    replacePreviousValues: boolean = false
): FilterBranch {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    for (let flowFilter of filterBranch.filters) {
        if (flowFilter.property === targetProperty) {
            let previousValues: string[] = flowFilter.operation.values || [];
            if (replacePreviousValues) {
                flowFilter = setFlowFilterValues(flowFilter, targetProperty, valuesToAdd);
            } else {
                flowFilter = addValuesToFilter(flowFilter, targetProperty, valuesToAdd);
                flowFilter = removeValuesFromFilter(flowFilter, targetProperty, valuesToRemove);
            }
            let updatedValues: string[] = flowFilter.operation.values || [];
            console.log(
                `\t>> filter.property \"${flowFilter.property}\"`,
                `\n\t>> Previous values length: ${previousValues.length}, Updated values length: ${updatedValues.length}`,
                `\n\t>> Difference = ${updatedValues.length - previousValues.length}`,
            );
        }
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch} 
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToAdd - `Array<string>`
 * @param {Array<string>} valuesToRemove - `Array<string>`
 * @param {boolean} replacePreviousValues - `boolean`
 * @returns {FilterBranch} `filterBranch` — {@link FilterBranch}
 */
export function updateFilterBranch(
    filterBranch: FilterBranch,
    targetProperty: string,
    valuesToAdd: Array<string> = [],
    valuesToRemove: Array<string> = [],
    replacePreviousValues: boolean = false
): FilterBranch {
    if (!filterBranch || !filterBranch.filters || !filterBranch.filterBranches) {
        console.log(`\tSkipping filter branch in updateFilterBranch(); filters or filter branches were undefined/null.`);
        return filterBranch;
    }
    if (filterBranch.filters.length > 0) {
        filterBranch = updateFilterBranchFlowFilters(
            filterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    if (filterBranch.filterBranches.length > 0) {
        filterBranch = updateFilterBranchChildFilterBranches(
            filterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    return filterBranch;
}


/**
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - `string`
 * @param {string} targetProperty - `string`
 * @param {Array<string>} valuesToAdd - `Array<string>`
 * @param {Array<string>} valuesToRemove - `Array<string>`
 * @param {boolean} replacePreviousValues - `boolean`
 * @param {boolean} enforceMaxValues - boolean {@link MAX_VALUES_PER_FILTER} from {@link FlowFilter}.ts
 * @returns {Flow} `flow` — {@link Flow}
 */
export function updateFlowByBranchName(
    flow: Flow,
    targetBranchName: string,
    targetProperty: string,
    valuesToAdd: Array<string> = [],
    valuesToRemove: Array<string> = [],
    replacePreviousValues: boolean = false,
    enforceMaxValues: boolean = false
): Flow {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return flow;
    }
    let branch: ListBranch | null = getListBranchByName(flow, targetBranchName);
    if (!branch || !branch.filterBranch) {
        return flow;
    }
    console.log(`Start of updateFlowByBranchName(flow, ${targetBranchName}, ${targetProperty}...)`);
    if (enforceMaxValues && Math.max(...getListBranchFlowFilterValueArrayLengths(branch, targetProperty)) > MAX_VALUES_PER_FILTER) {
        console.log(`\tInitial Distribution of filter values for branch: ${targetBranchName}`);
        branch = distributeFilterValuesOfListBranch(
            branch, targetProperty, MAX_VALUES_PER_FILTER
        );
    }
    let filterBranch = branch.filterBranch;
    if (enforceMaxValues 
        && filterBranch.filterBranches
        && (filterBranch.filterBranches.length > 1 || valuesToAdd.length > MAX_VALUES_PER_FILTER)
        && replacePreviousValues
        && filterBranch.filterBranchType === FilterBranchTypeEnum.OR
    ) {
        console.log(`\t!!FOUND BRANCH WHERE NEED TO DISTRIBUTE VALUES!!`);
        /* 
        partition valuesToAdd such that the composite valueArray<typeof targetProperty> of each childFilterBranch 
        in filterBranch.filterBranches with childFilterBranch.filters.property === targetProperty is overwritten by valuesToAdd
        1. count the number of childFilterBranches with self.filters[some index].property === targetProperty
        2. partition valuesToAdd into that many arrays
        3. set each (childFilterBranch that has self.filters.[some index].property === targetProperty)'s self.filters.filter.operation.values to the corresponding array of valuesToAdd
        4. concat updated childFilterBranchesWithTargetProperty to filterBranch.filterBranches's childFilterBranchesWithOtherProperty
        */
        let childrenWithTargetProperty = filterBranch.filterBranches.filter(
            childFilterBranch => childFilterBranch.filters.some(
                filter => filter.property === targetProperty
            )
        );
        let unalteredChildren = filterBranch.filterBranches.filter(
            childFilterBranch => !childFilterBranch.filters.some(
                filter => filter.property === targetProperty
            )
        );
        let partitionedValuesToAdd = partitionArrayByNumSubarrays(
            valuesToAdd, childrenWithTargetProperty.length, MAX_VALUES_PER_FILTER
        );
        let updatedChildFilterBranches = childrenWithTargetProperty.map(
            (childFilterBranch, index) => {
                let values = partitionedValuesToAdd[index];
                return updateFilterBranch(
                    childFilterBranch, targetProperty, values, valuesToRemove, replacePreviousValues
                );
            }
        )
        // if there are more values to add than childFilterBranchesWithTargetProperty, add them to the end of the updatedChildFilterBranches
        // else, the updatedChildFilterBranches will be the same length as childFilterBranchesWithTargetProperty.concat(childFilterBranchesWithOtherProperty)
        if (partitionedValuesToAdd.length > childrenWithTargetProperty.length) {
            updatedChildFilterBranches.push(
                ...batchGeneratePropertyContainsStringChildFilterBranch(
                    partitionedValuesToAdd.slice(childrenWithTargetProperty.length),
                    targetProperty
                ));
        }
        updatedChildFilterBranches = updatedChildFilterBranches.concat(
            unalteredChildren
        );
        filterBranch.filterBranches = updatedChildFilterBranches;
    } else {
        filterBranch = updateFilterBranch(
            filterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    console.log(`End of updateFlowByBranchName(flow, ${targetBranchName}, ${targetProperty}...)`);
    return flow;
}

/**
 * @param {Flow} flow {@link Flow}
 * @param {Array<FlowBranchUpdate>} updates `Array<`{@link FlowBranchUpdate}`>` 
 * @returns {Flow} `flow` — {@link Flow}
 */
export function batchUpdateFlowByBranchName(flow: Flow, updates: Array<FlowBranchUpdate>): Flow {
    if (!flow || !updates || updates.length === 0) {
        return flow;
    }
    for (let u of updates) {
        flow = updateFlowByBranchName(
            flow, u.targetBranchName, u.targetProperty, u.valuesToAdd, u.valuesToRemove, u.replacePreviousValues, u.enforceMaxValues
        );
    }
    return flow;
}

/**
 * 
 * @param {Array<FlowFilter>} flowFilters - `Array<`{@link FlowFilter}`>`
 * @param {FilterBranchTypeEnum} [filterBranchType] - {@link FilterBranchTypeEnum}
 * @param {FilterBranchOperatorEnum} [filterBranchOperator] - {@link FilterBranchOperatorEnum}
 * @returns {FilterBranch} `filterBranch` - {@link FilterBranch}
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

 * @param {string} numericTargetProperty - `string`
 * @param {number} minimum - `number`
 * @param {number} maximum - `number`
 * @returns {FilterBranch} `filterBranch` - {@link FilterBranch}
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
        console.log(`\t Error in numberIsBetweenFilterBranch() b/c numericFlowFilterPair was undefined or had length !== 2.`);
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
 * @param {string} numericTargetProperty - `string`
 * @param {NumericOperatorEnum} lowerBoundOperator - {@link NumericOperatorEnum}
 * @param {NumericOperatorEnum} upperBoundOperator - {@link NumericOperatorEnum}
 * @param {number} minimum - `number`
 * @param {number} maximum - `number`
 * @returns {Array<FlowFilter>} `flowFilters` - `Array<`{@link FlowFilter}`>`
 */
export function generateNumericRangeFlowFilterPair(
    numericTargetProperty: string, 
    lowerBoundOperator: NumericOperatorEnum, 
    upperBoundOperator: NumericOperatorEnum, 
    minimum: number, 
    maximum: number
): Array<FlowFilter> {
    if (!numericTargetProperty || !minimum || !maximum) {
        console.log(`\t Skipping generateInclusiveNumericRangeFlowFilterPair() b/c one of the parameters was undefined.`);
        return [];
    }
    if (minimum > maximum) {
        console.log(`\t Skipping generateInclusiveNumericRangeFlowFilterPair() b/c minimum > maximum.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_GREATER_THAN, NumericOperatorEnum.IS_GREATER_THAN_OR_EQUAL_TO].includes(lowerBoundOperator)) {
        console.log(`\t Skipping generateInclusiveNumericRangeFlowFilterPair() b/c lowerBoundOperator was not IS_GREATER_THAN or IS_GREATER_THAN_OR_EQUAL_TO.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_LESS_THAN, NumericOperatorEnum.IS_LESS_THAN_OR_EQUAL_TO].includes(upperBoundOperator)) {
        console.log(`\t Skipping generateInclusiveNumericRangeFlowFilterPair() b/c upperBoundOperator was not IS_LESS_THAN or IS_LESS_THAN_OR_EQUAL_TO.`);
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
        console.log(`\tSkipping generateInclusiveNumericRangeFlowFilterPair() b/c one of [lowerBoundFlowFilter, upperBoundFlowFilter] was undefined.`, lowerBoundFlowFilter, upperBoundFlowFilter);
        return [];
    }
    return [lowerBoundFlowFilter, upperBoundFlowFilter];
}

/**
 * 
 * @param {string} targetProperty 
 * @param {NumericOperatorEnum} operator see {@link NumericOperatorEnum}
 * @param {number} value 
 * @returns {FlowFilter | null} `flowFilter` - {@link FlowFilter}
 */
export function generateNumericComparisonFlowFilter(
    targetProperty: string,
    operator: NumericOperatorEnum,
    value: number,
): FlowFilter | null {
    if (!targetProperty || !operator || !value) {
        console.log(`\tSkipping generateNumericComparisonFlowFilter() b/c one of the parameters was undefined.`);
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
 * @param {ListBranch} listBranch - {@link ListBranch}
 * @param {string} targetProperty 
 * @returns {ListBranch} `partitionedListBranch` — {@link ListBranch}
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
    console.log(`Number of filter branches after distribution: ${newFilterBranches.length}`);
    listBranch.filterBranch.filterBranches = newFilterBranches;
    return listBranch;
}

/**
 * 
 * @param {Array<string>} valueArray - `Array<string>`
 * @param {string} targetProperty 
 * @returns {FilterBranch | null} `filterBranch` - {@link FilterBranch}
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
 * @param {Array<Array<string>>} valueBatches - `Array<Array<string>>`
 * @param {string} targetProperty - `string`
 * @returns {Array<FilterBranch>} `filterBranches` - `Array<`{@link FilterBranch}`>`
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
