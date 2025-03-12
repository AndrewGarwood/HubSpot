import { writeToJsonFile, printJson, getJsonFromFile } from '../io/io_utils.mjs';
import '../../types/workflow_types.js';
import '../../types/workflow_enums.js';
import { ActionTypeEnum } from '../../types/workflow_enums.js';
import { HUBSPOT_ACCESS_TOKEN, FLOWS_API_URL } from '../../config/env.mjs';


/**
 * @TODO decide whether or not flowId should be in a ParamObject or not. . .
 * @param {GetFlowConfig} ParamObject GetFlowConfig { flowId: string }
 * @param {string} flowId string 
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function getFlowById({flowId}) {
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
            method: 'GET',
            headers: {
                "accept": "application/json",
                'Content-Type': 'application/json',
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
 * @param {SetFlowConfig} ParamObject SetFlowConfig { flowId: string, flowDefinition: {@link Flow}  }
 * @param {string} flowId string
 * @param {Flow} flowDefinition {@link Flow}  
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function setFlowById({flowId, flowDefinition}) {
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
            method: 'PUT',
            headers: {
                "accept": "application/json",
                'Content-Type': 'application/json',
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

    filter.operation.values = filter.operation.values.filter(value => !valuesToRemove.includes(value));
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
    if (filter.property !== targetProperty || !filter.operation || !filter.operation.values) {
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
        return filter;
    }
    filter.operation.values = values;
    return filter;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToRemove 
 * @param {Array<string>} valuesToAdd 
 * @returns {FilterBranch}
 */
export function updateFilterBranchFilterBranches(filterBranch, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    for (let filterBranch of filterBranch.filterBranches) {
        filterBranch = updateFilterBranchFlowFilters(filterBranch, targetProperty, valuesToRemove, valuesToAdd);
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranchFlowFilters(filterBranch, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    for (let flowFilter of filterBranch.filters) {
        if (flowFilter.property === targetProperty) {
            flowFilter = removeValuesFromFilter(flowFilter, targetProperty, valuesToRemove);
            flowFilter = addValuesToFilter(flowFilter, targetProperty, valuesToAdd);
        }
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch} 
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranch(filterBranch, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    filterBranch = updateFilterBranchFlowFilters(filterBranch, targetProperty, valuesToRemove, valuesToAdd);
    filterBranch = updateFilterBranchFilterBranches(filterBranch, targetProperty, valuesToRemove, valuesToAdd);
    return filterBranch;
}

// /**@deprecated*/export function updateListBranch(listBranch, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
//     if (!listBranch || !listBranch.filterBranch) {
//         return listBranch;
//     }
//     listBranch.filterBranch = updateFilterBranch(listBranch.filterBranch, targetProperty, valuesToRemove, valuesToAdd);
//     return listBranch;
// }

/**
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - string
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @returns {Flow} flow — {@link Flow}
 */
export function updateFlowByBranchName(flow, targetBranchName, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return flow;
    }
    let actions = flow.actions;
    for (let action of actions) {
        if (!action.type === ActionTypeEnum.LIST_BRANCH) {
            continue;
        }
        for (let listBranch of action.listBranches) {
            if (listBranch.branchName === targetBranchName && listBranch.filterBranch) {
                listBranch.filterBranch = updateFilterBranch(listBranch, targetProperty, valuesToRemove, valuesToAdd);
            }
        }
    }
    return flow;
}

/**
 * @param {Flow} flow {@link Flow}
 * @param {Array<FlowBranchUpdate>} updates Array<{@link FlowBranchUpdate}> 
 * @returns {Flow} flow — {@link Flow}
 */
export function batchUpdateFlowByBranchName(flow, updates) {
    if (!flow || !updates || updates.length === 0) {
        return flow;
    }
    for (let u of updates) {
        flow = updateFlowByBranchName(flow, u.targetBranchName, u.targetProperty, u.valuesToRemove, u.valuesToAdd);
    }
    return flow;
}

/**
 * @param {Flow} flow {@link Flow}
 * @param {string} branchName - string
 * @returns {ListBranch} .{@link ListBranch}
 */
export function getBranchByName(flow, branchName) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return null;
    }
    let actions = flow.actions;
    for (let action of actions) {
        if (!action.type === ActionTypeEnum.LIST_BRANCH) {
            continue;
        }
        for (let listBranch of action.listBranches) {
            if (listBranch.branchName === branchName) {
                console.log('found branch at actionId:', action.actionId);
                return listBranch;
            }
        }
    }
    console.log(`No branch found with name: ${branchName}`);
    return null;
}