import { writeToJsonFile, printJson, getJsonFromFile } from '../io/io_utils.mjs';
import { HUBSPOT_ACCESS_TOKEN, FLOWS_API_URL } from '../../config/env.mjs';
import { ActionTypeEnum } from '../../types/automation/ActionEnums.js';
import '../../types/automation/Flow.js';
import '../../types/automation/FilterBranch.js';
import '../../types/automation/ListBranch.js';

/**
 * @param {string} flowId string 
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function getFlowById(flowId) {
    try {
        const flowURL = `${FLOWS_API_URL}/${flowId}`;
        console.log(flowURL);
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
 * @param {string} flowId string
 * @param {Flow} flowDefinition {@link Flow}  
 * @returns {Promise<Flow>} .{@link Flow}
 */
export async function setFlowById(flowId, flowDefinition) {
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
        return filter;
    }
    filter.operation.values = values;
    return filter;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToAdd 
 * @param {Array<string>} valuesToRemove 
 * @returns {FilterBranch}
 */
export function updateFilterBranchChildFilterBranches(filterBranch, targetProperty, valuesToAdd=[], valuesToRemove=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    // console.log('in updateFilterBranchChildFilterBranches(), filterBranch.filterBranches.length:', filterBranch.filterBranches.length);
    for (let childFilterBranch of filterBranch.filterBranches) {
        // console.log('4. in updateFilterBranchChildFilterBranches(), calling updateFilterBranchFlowFilters()');
        childFilterBranch = updateFilterBranchFlowFilters(childFilterBranch, targetProperty, valuesToAdd, valuesToRemove);
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch}
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranchFlowFilters(filterBranch, targetProperty, valuesToAdd=[], valuesToRemove=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    // console.log('in updateFilterBranchFlowFilters(), filterBranch.filter.length:', filterBranch.filters.length);
    for (let flowFilter of filterBranch.filters) {
        if (flowFilter.property === targetProperty) {
            // console.log('3. in updateFilterBranchFlowFilters(), calling addValuesToFilter() and removeValuesFromFilter()');
            flowFilter = addValuesToFilter(flowFilter, targetProperty, valuesToAdd);
            flowFilter = removeValuesFromFilter(flowFilter, targetProperty, valuesToRemove);
        }
    }
    return filterBranch;
}

/**
 * @param {FilterBranch} filterBranch {@link FilterBranch} 
 * @param {string} targetProperty 
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @returns {FilterBranch} filterBranch — {@link FilterBranch}
 */
export function updateFilterBranch(filterBranch, targetProperty, valuesToAdd=[], valuesToRemove=[]) {
    if (!filterBranch || !filterBranch.filters) {
        return filterBranch;
    }
    // console.log('2. in updateFilterBranch(), calling updateFilterBranchFlowFilters() and updateFilterBranchChildFilterBranches()');
    filterBranch = updateFilterBranchFlowFilters(filterBranch, targetProperty, valuesToAdd, valuesToRemove);
    filterBranch = updateFilterBranchChildFilterBranches(filterBranch, targetProperty, valuesToAdd, valuesToRemove);
    return filterBranch;
}

/**
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - string
 * @param {string} targetProperty - string
 * @param {Array<string>} valuesToAdd - Array\<string>
 * @param {Array<string>} valuesToRemove - Array\<string>
 * @returns {Flow} flow — {@link Flow}
 */
export function updateFlowByBranchName(flow, targetBranchName, targetProperty, valuesToAdd=[], valuesToRemove=[]) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return flow;
    }
    /**@type {ListBranch} {@link ListBranch} */
    let branch = getListBranchByName(flow, targetBranchName);
    if (!branch) {
        return flow;
    }
    branch.filterBranch = updateFilterBranch(branch.filterBranch, targetProperty, valuesToAdd, valuesToRemove);
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
        flow = updateFlowByBranchName(
            flow, u.targetBranchName, u.targetProperty, u.valuesToAdd, u.valuesToRemove
        );
    }
    return flow;
}

/**
 * gets first listBranch with matching branchName
 * @param {Flow} flow {@link Flow}
 * @param {string} targetBranchName - string
 * @returns {ListBranch} .{@link ListBranch}
 */
export function getListBranchByName(flow, targetBranchName) {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return null;
    }
    let actions = flow.actions;
    for (let action of actions) {
        if (!action.type === ActionTypeEnum.LIST_BRANCH || !action.listBranches) {
            continue;
        }
        let listBranch = Object.values(action.listBranches).find(
            listBranch => listBranch.branchName === targetBranchName
        );
        if (listBranch) {
            console.log('found branch at actionId:', action.actionId);
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
 * 
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


// export function updateListBranch(listBranch, targetProperty, valuesToRemove=[], valuesToAdd=[]) {
//     if (!listBranch || !listBranch.filterBranch) {
//         return listBranch;
//     }
//     listBranch.filterBranch = updateFilterBranch(listBranch.filterBranch, targetProperty, valuesToRemove, valuesToAdd);
//     return listBranch;
// }