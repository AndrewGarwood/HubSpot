import { writeToJsonFile, printJson, readJsonFileAsObject } from '../io/io_utils.mjs';
import { HUBSPOT_ACCESS_TOKEN, FLOWS_API_URL } from '../../config/env.mjs';
import { APPLICATION_JSON } from '../../config/constants.mjs';
import { ActionTypeEnum, ActionTypeIdEnum } from '../../types/automation/Action.js';
import '../../types/automation/Flow.js';
import { Flow } from '../../types/automation/Flow.js';
import '../../types/automation/FlowFilter.js';
import { FlowFilter, FlowFilterTypeEnum, MAX_VALUES_PER_FILTER } from '../../types/automation/FlowFilter.js';
import '../../types/automation/Operation.js';
import { Operation, OperatorEnum, OperationTypeEnum, NumericOperatorEnum } from '../../types/automation/Operation.js';
import '../../types/automation/FilterBranch.js';
import { FilterBranch, FilterBranchTypeEnum, FilterBranchOperatorEnum } from '../../types/automation/FilterBranch.js';
import '../../types/automation/ListBranch.js';
import { ListBranch } from '../../types/automation/ListBranch.js';
import { FlowBranchUpdate } from '../../types/automation/Automation.js';

/**
 * @param {string} flowId string 
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function getFlowById(flowId) {
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
            method: 'GET',
            headers: {
                "accept": APPLICATION_JSON,
                'Content-Type': APPLICATION_JSON,
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
            }
        });
        if (!response.ok) {
            console.error(JSON.stringify(response, null, 4));
            throw new Error(`HTTP request failed with status ${response.status}`);
        }
        return response.json();
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4)) 
            : console.error('Error in getFlowById()', e);
        return null;
    }
}

/**
 * @param {string} flowId string
 * @param {Flow} flowDefinition {@link Flow}  
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function setFlowById(flowId, flowDefinition) {
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
            method: 'PUT',
            headers: {
                "accept": APPLICATION_JSON,
                'Content-Type': APPLICATION_JSON,
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
            },
            body: JSON.stringify(flowDefinition)
        });
        if (!response.ok) {
            throw new Error(`HTTP request failed with status ${response.status}`);
        }
        return response.json();
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 4)) 
            : console.error('Error in setFlowById()', e);
        return null;
    }
}

/**
 * @param {FlowFilter} filter {@link FlowFilter}
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @returns {FlowFilter} filter — {@link FlowFilter}
 */
export function removeValuesFromFilter(filter, targetProperty, valuesToRemove) {
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
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @returns {FlowFilter} filter — {@link FlowFilter}
 */
export function addValuesToFilter(filter, targetProperty, valuesToAdd) {
    if (!filter || !valuesToAdd || valuesToAdd.length === 0) {
        return filter;
    }
    if (filter.property !== targetProperty || !filter.operation) {
        return filter;
    }
    for (let value of valuesToAdd) {
        if (!filter.operation.values.includes(value)) {
            filter.operation.values.push(value);
        }
    }
    return filter;
}

/**
 * override previous content of filter.operation.values with values
 * @param {FlowFilter} filter {@link FlowFilter}
 * @param {string} targetProperty - string
 * @param {Array<string>} values - Array\<string>
 * @returns {FlowFilter} filter — {@link FlowFilter}
 */
export function setFlowFilterValues(filter, targetProperty, values) {
    if (!filter || !values || values.length === 0) {
        return filter;
    }
    if (filter.property !== targetProperty || !filter.operation) {
        console.log(`\tSkipping filter, property ${filter.property} !== ${targetProperty}`);
        return filter;
    }
    if ( // noChange
        filter.operation.values.length === values.length &&
        values.every(value => filter.operation.values.includes(value))
    ) {
        console.log(`\tNo change in filter values for property ${targetProperty}.`);
        return filter;
    }
    filter.operation.values = values;
    return filter;
}

/**
 * @description Sets flow.actions[indexOfTargetBranch].filterBranch.filterBranches to newChildFilterBranches.
 * @param {Flow} flow - {@link Flow}
 * @param {string} targetBranchName 
 * @param {Array.<FilterBranch>} newChildFilterBranches - Array\<{@link FilterBranch}>
 * @returns {Flow} flow - {@link Flow}
 */
export function setChildFilterBranchesByListBranchName(
    flow,
    targetBranchName,
    newChildFilterBranches,
) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        console.log(`\t Exiting setChildFilterBranchesByListBranchName() input flow was undefined or had no actions.`);
        return flow;
    }
    let listBranch = getListBranchByName(flow, targetBranchName);
    if (!listBranch) {
        console.log(`\t Exiting setChildFilterBranchesByListBranchName() input listBranch was undefined.`);
        return flow;
    }
    listBranch = setChildFilterBranchesOfListBranch(listBranch, newChildFilterBranches);
    return flow;
}


/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {boolean} replacePreviousValues - boolean
 * @returns {FilterBranch}
 */
export function updateFilterBranchChildFilterBranches(
    filterBranch, 
    targetProperty, 
    valuesToAdd=[], 
    valuesToRemove=[], 
    replacePreviousValues=false
) {
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
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {boolean} replacePreviousValues - boolean
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranchFlowFilters(
    filterBranch,
    targetProperty,
    valuesToAdd = [],
    valuesToRemove = [],
    replacePreviousValues = false
) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    for (let flowFilter of filterBranch.filters) {
        if (flowFilter.property === targetProperty) {
            let previousValues = flowFilter.operation.values;
            if (replacePreviousValues) {
                flowFilter = setFlowFilterValues(flowFilter, targetProperty, valuesToAdd);
            } else {
                flowFilter = addValuesToFilter(flowFilter, targetProperty, valuesToAdd);
                flowFilter = removeValuesFromFilter(flowFilter, targetProperty, valuesToRemove);
            }
            let updatedValues = flowFilter.operation.values;
            console.log(
                `\tfilter.property \"${flowFilter.property}\"` +
                `\n\tPrevious values length: ${previousValues.length}, Updated values length: ${updatedValues.length}`
            );
        }
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch} 
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {boolean} replacePreviousValues - boolean
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranch(
    filterBranch,
    targetProperty,
    valuesToAdd = [],
    valuesToRemove = [],
    replacePreviousValues = false
) {
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
 * @param {string} targetBranchName - string
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {boolean} replacePreviousValues - boolean
 * @param {boolean} enforceMaxValues - boolean {@link MAX_VALUES_PER_FILTER} from FlowFilter
 * @returns {Flow} flow — {@link Flow}
 */
export function updateFlowByBranchName(
    flow,
    targetBranchName,
    targetProperty,
    valuesToAdd = [],
    valuesToRemove = [],
    replacePreviousValues = false,
    enforceMaxValues = false
) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return flow;
    }
    /**@type {ListBranch} {@link ListBranch} */
    let branch = getListBranchByName(flow, targetBranchName);
    if (!branch || !branch.filterBranch) {
        return flow;
    }
    if (enforceMaxValues && Math.max(getListBranchFlowFilterValueArrayLengths(branch, targetProperty)) > MAX_VALUES_PER_FILTER) {
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
 * @param {Array<FlowBranchUpdate>} updates Array\<{@link FlowBranchUpdate}> 
 * @returns {Flow} flow — {@link Flow}
 */
export function batchUpdateFlowByBranchName(flow, updates) {
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
 * Gets first listBranch with matching branchName.
 * Log branchName to console and return listBranch if found else, log not found and return null.
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - string
 * @returns {ListBranch} .{@link ListBranch}
 */
export function getListBranchByName(flow, targetBranchName) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return null;
    }
    let actions = flow.actions;
    console.log(`Begin search for branch: ${targetBranchName}`);
    for (let action of actions) {
        if (!action
            || !action.type === ActionTypeEnum.LIST_BRANCH
            || !action.listBranches
            || (action.actionTypeId && action.actionTypeId === ActionTypeIdEnum.SET_PROPERTY)
        ) {
            console.log(`\tSkipping action: ${action.actionId} with type: ${action.type}`);
            continue;
        }
        let listBranch = Object.values(action.listBranches).find(
            listBranch => listBranch.branchName === targetBranchName
        );
        if (listBranch && !(action.actionTypeId && action.actionTypeId === ActionTypeIdEnum.SET_PROPERTY)) {
            console.log(`getListBranchByName() Found branch \"${targetBranchName}\" at actionId: ${action.actionId} with type: ${action.type}`);
            return listBranch;
        }
    }
    console.log(`No branch found with name: ${targetBranchName}`);
    return null;
}

/**
 *- flow.action.listBranches - Array<{@link ListBranch}>
 * @param {Flow} flow {@link Flow}
 * @returns {boolean} boolean
 */
export function hasUniqueBranchNames(flow) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return true;
    }
    let namesSeen = new Set();
    let actions = flow.actions;
    for (let action of actions) {
        if (!action.type === ActionTypeEnum.LIST_BRANCH || !action.listBranches) {
            continue;
        }
        for (let listBranch of Object.values(action.listBranches)) {
            if (namesSeen.has(listBranch.branchName)) {
                return false;
            }
            namesSeen.add(listBranch.branchName);
        }
    }
    return true;
}

/**
 * Get all {@link ListBranch} names from a {@link Flow} object.
 * @param {Flow} flow {@link Flow}
 * @returns {Array<string>} branchNames: Array\<string>
 */
export function getAllBranchNames(flow) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return [];
    }
    let branchNames = [];
    let actions = flow.actions;
    for (let action of actions) {
        if (!action.type === ActionTypeEnum.LIST_BRANCH || !action.listBranches) {
            continue;
        }
        for (let listBranch of Object.values(action.listBranches)) {
            branchNames.push(listBranch.branchName);
        }
    }
    return branchNames;
}


/**
 * adds childFilterBranch to first listBranch with matching branchName.
 * @param {Flow} flow - {@link Flow}
 * @param {string} targetBranchName - string
 * @param {FilterBranch} childFilterBranch - {@link FilterBranch}
 * @returns {Flow} flow - {@link Flow}
 */
export function addChildFilterBranchToListBranchByName(
    flow,
    targetBranchName,
    childFilterBranch
) {
    if (!flow || !flow.actions || flow.actions.length === 0 || !childFilterBranch) {
        return flow;
    }
    /**@type {ListBranch} {@link ListBranch} */
    let branch = getListBranchByName(flow, targetBranchName);
    if (!branch) {
        return flow;
    }
    branch.filterBranch.filterBranches.push(childFilterBranch);
    return flow;
}



/**
 * 
 * @param {Array<FlowFilter>} flowFilters - Array\<{@link FlowFilter}>
 * @param {FilterBranchTypeEnum} [filterBranchType] - {@link FilterBranchTypeEnum}
 * @param {FilterBranchOperatorEnum} [filterBranchOperator] - {@link FilterBranchOperatorEnum}
 * @returns {FilterBranch} filterBranch - {@link FilterBranch}
 */
export function generateNumericFilterBranch(
    flowFilters, 
    filterBranchType=FilterBranchTypeEnum.AND, 
    filterBranchOperator=FilterBranchOperatorEnum.AND
) {
    let filterBranch = FilterBranch(
        [],
        flowFilters,
        filterBranchType,
        filterBranchOperator
    )
    return filterBranch;
}
/**

 * @param {string} numericTargetProperty - string
 * @param {number} minimum 
 * @param {number} maximum 
 * @returns {FilterBranch} filterBranch - {@link FilterBranch}
 */
export function numberIsBetweenFilterBranch(numericTargetProperty, minimum, maximum){
    let inclusiveRangeFilterBranch = generateNumericFilterBranch(
        generateNumericRangeFlowFilterPair(
            numericTargetProperty,
            NumericOperatorEnum.IS_GREATER_THAN_OR_EQUAL_TO,
            NumericOperatorEnum.IS_LESS_THAN_OR_EQUAL_TO,
            minimum,
            maximum
        ),
        FilterBranchTypeEnum.AND,
        FilterBranchOperatorEnum.AND
    )
    return inclusiveRangeFilterBranch;
}

/**
 * @param {string} numericTargetProperty - string
 * @param {NumericOperatorEnum} lowerBoundOperator - {@link NumericOperatorEnum}
 * @param {NumericOperatorEnum} upperBoundOperator - {@link NumericOperatorEnum}
 * @param {number} minimum - number
 * @param {number} maximum - number
 * @returns {Array<FlowFilter>} flowFilters - Array\<{@link FlowFilter}>
 */
export function generateNumericRangeFlowFilterPair(numericTargetProperty, lowerBoundOperator, upperBoundOperator, minimum, maximum){
    if (!numericTargetProperty || !minimum || !maximum) {
        console.log(`\tSkipping generateInclusiveNumericRangeFlowFilterPair() b/c one of the parameters was undefined.`);
        return [];
    }
    if (minimum > maximum) {
        console.log(`\tSkipping generateInclusiveNumericRangeFlowFilterPair() b/c minimum > maximum.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_GREATER_THAN, NumericOperatorEnum.IS_GREATER_THAN_OR_EQUAL_TO].includes(lowerBoundOperator)) {
        console.log(`\tSkipping generateInclusiveNumericRangeFlowFilterPair() b/c lowerBoundOperator was not IS_GREATER_THAN or IS_GREATER_THAN_OR_EQUAL_TO.`);
        return [];
    }
    if (![NumericOperatorEnum.IS_LESS_THAN, NumericOperatorEnum.IS_LESS_THAN_OR_EQUAL_TO].includes(upperBoundOperator)) {
        console.log(`\tSkipping generateInclusiveNumericRangeFlowFilterPair() b/c upperBoundOperator was not IS_LESS_THAN or IS_LESS_THAN_OR_EQUAL_TO.`);
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
    return [lowerBoundFlowFilter, upperBoundFlowFilter];
}

/**
 * 
 * @param {string} targetProperty 
 * @param {NumericOperatorEnum} operator 
 * @param {number} value 
 * @returns {FlowFilter} flowFilter - {@link FlowFilter}
 */
export function generateNumericComparisonFlowFilter(
    targetProperty,
    operator,
    value,
) {
    if (!targetProperty || !operator || !value) {
        console.log(`\tSkipping generateNumericComparisonFlowFilter() b/c one of the parameters was undefined.`);
        return null;
    }
    let flowFilter = FlowFilter(
        targetProperty,
        Operation(
            operator,
            false,
            value,
            OperationTypeEnum.NUMBER
        ),
        FlowFilterTypeEnum.PROPERTY
    );
    return flowFilter;
}
/**
 * 
 * @param {ListBranch} listBranch - {@link ListBranch}
 * @param {string} targetProperty 
 * @returns {ListBranch} partitionedListBranch — {@link ListBranch}
 */
export function distributeFilterValuesOfListBranch(
    listBranch,
    targetProperty,
    maxValuesPerFilter = MAX_VALUES_PER_FILTER,
) {
    if (!listBranch || !listBranch.filterBranch) {
        return listBranch;
    }
    let filterBranches = listBranch.filterBranch.filterBranches;
    if (!filterBranches || filterBranches.length === 0) {
        return listBranch;
    }
    let newFilterBranches = [];
    for (let filterBranch of filterBranches) {
        let flowFilters = filterBranch.filters;
        if (!flowFilters || flowFilters.length === 0) {
            continue;
        }
        for (let flowFilter of flowFilters) {
            /**if it's a numeric or non-string filter, don't partition it */
            let isNotStringFilter = (  
                flowFilter.operation 
                && (Object.values(NumericOperatorEnum).includes(flowFilter.operation.operationType) 
                    || flowFilter.operation.operationType !== OperationTypeEnum.MULTISTRING
                )
            );
            /** @type {boolean}if it's a string filter and has less than maxValuesPerFilter values, don't partition it */
            let isCompliantStringFilter = ( 
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
            ) {
                newFilterBranches.push(filterBranch);
                continue;
            }
            let batches = partitionArrayByNumSubarrays(
                flowFilter.operation.values,
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
 * @param {Array.<string>} valueArray 
 * @param {string} targetProperty 
 * @returns {FilterBranch} filterBranch - {@link FilterBranch}
 */
export function generatePropertyContainsStringChildFilterBranch(valueArray, targetProperty) {
    if (!valueArray || valueArray.length === 0) {
        return null;
    }
    let filterBranch = FilterBranch(
        [],
        [FlowFilter(
            targetProperty,
            Operation(
                OperatorEnum.CONTAINS,
                false,
                valueArray,
                OperationTypeEnum.MULTISTRING
            ),
            FlowFilterTypeEnum.PROPERTY
        )],
        FilterBranchTypeEnum.AND,
        FilterBranchOperatorEnum.AND
    );
    return filterBranch;
}


/**
 * @param {Array<Array<string>>} valueBatches - Array<Array<string>>
 * @param {string} targetProperty - string
 * @returns {Array<FilterBranch>} filterBranches - Array\<{@link FilterBranch}>
 */
export function batchGeneratePropertyContainsStringChildFilterBranch(valueBatches, targetProperty) {
    if (!valueBatches || valueBatches.length === 0) {
        return [];
    }
    let filterBranches = [];
    for (let batch of valueBatches) {
        let filterBranch = generatePropertyContainsStringChildFilterBranch(batch, targetProperty);
        if (filterBranch) {
            filterBranches.push(filterBranch);
        }
    }
    return filterBranches;
}

/**
 * 
 * @param {ListBranch} listBranch {@link ListBranch} 
 * @param {string} targetProperty 
 * @returns {Array<number>} lengths: Array\<number>
 * @description Get lengths of filter values for each filter branch in the list branch.
 */
export function getListBranchFlowFilterValueArrayLengths(
    listBranch,
    targetProperty,
) {
    if (!listBranch || !listBranch.filterBranch) {
        return null;
    }
    let filterBranches = listBranch.filterBranch.filterBranches;
    if (!filterBranches || filterBranches.length === 0) {
        return null;
    }
    let lengths = [];
    for (let filterBranch of filterBranches) {
        let flowFilters = filterBranch.filters;
        if (!flowFilters || flowFilters.length === 0) {
            continue;
        }
        let flowFilter = flowFilters.find(filter => filter.property === targetProperty);
        if (!flowFilter) {
            continue;
        }
        lengths.push(flowFilter.operation.values.length);
    }
    return lengths;
}



/**
 * 
 * @param {Flow} flow {@link Flow}
 * @param {string} flowId 
 * @returns {boolean} boolean
 * @description Checks if flow exists and has unique branch names.
 */
export function flowExistsAndHasUniqueBranches(flow, flowId) {
    if (!flow) {
        console.error(`Flow not found: ${flowId}`);
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
 * @throws {Error} If arr is not an array or if minNumSubarrays is less than or equal to 0 or if maxSubarraySize is less than or equal to 0.
 * @returns {Array<Array<any>>} subarrays - An array of subarrays.
 * subarrays.length >= Math.min(minNumSubarrays, arr.length)
 * subarrays[i].length <= maxSubarraySize
 */
function partitionArrayByNumSubarrays(arr, minNumSubarrays, maxSubarraySize) {
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
    let subarrays = [];
    let numElements = arr.length;
    let subarraySize = Math.ceil(numElements / minNumSubarrays);
    for (let i = 0; i < numElements; i += subarraySize) {
        subarrays.push(arr.slice(i, i + Math.min(subarraySize, maxSubarraySize)));
    }
    return subarrays;
}
