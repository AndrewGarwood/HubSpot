/**
 * @file src/automation/flows.ts
 */
import { 
    HUBSPOT_ACCESS_TOKEN, FLOWS_API_URL, OUTPUT_DIR, 
    mainLogger as mlog, apiLogger as alog, INDENT_LOG_LINE as TAB, NEW_LINE as NL 
} from '../config';
import { AxiosCallEnum as HTTP, AxiosContentTypeEnum as CONTENT_TYPE} from '../utils/api/types/AxiosEnums';
import { 
    batchGeneratePropertyContainsStringChildFilterBranch, 
    distributeFilterValuesOfListBranch, 
    getListBranchFlowFilterValueArrayLengths, 
    partitionArrayByNumSubarrays 
} from './flowFactory';
import { 
    Flow, Action, ActionTypeEnum, ActionTypeIdEnum, FlowFilter, MAX_VALUES_PER_FILTER,
    FilterBranch, FilterBranchTypeEnum, ListBranch, FlowBranchUpdate 
} from './types';

const BEARER_ACCESS_TOKEN = `Bearer ${HUBSPOT_ACCESS_TOKEN}`;
export const debugLogs: any[] = [];
/**
 * @param flowId `string` 
 * @returns **`response`** = `Promise<`{@link Flow} `| undefined>`
 */
export async function getFlowById(flowId: string): Promise<Flow | undefined> {
    if (!flowId || typeof flowId !== 'string') {
        mlog.error(`getFlowById() Invalid Parameter:`,
            TAB+`typeof flowId: ${typeof flowId}, flowId: '${flowId}'`
        );
        return {} as Flow;
    }
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
            method: HTTP.GET,
            headers: {
                "accept": CONTENT_TYPE.JSON,
                'Content-Type': CONTENT_TYPE.JSON,
                'Authorization': BEARER_ACCESS_TOKEN
            }
        });
        if (!response.ok) {
            mlog.error(JSON.stringify(response, null, 4));
            throw new Error(`HTTP request failed with status ${response.status}`);
        }
        return response.json();
    } catch (e) {
        mlog.error('Error in getFlowById():', e);
        return undefined;
    }
}

/**
 * @param flowId `string`
 * @param flowDefinition {@link Flow}  
 * @returns **`response`** = `Promise<`{@link Flow} `| undefined>`
 */
export async function setFlowById(flowId: string, flowDefinition: Flow): Promise<Flow | undefined> {
    if (!flowId || typeof flowId !== 'string' || !flowDefinition || typeof flowDefinition !== 'object') {
        mlog.error(`setFlowById() Invalid Parameters:`,
            TAB+`        typeof flowId: ${typeof flowId}, flowId: '${flowId}'`,
            TAB+`typeof flowDefinition: ${typeof flowDefinition}`
        );
        return {} as Flow;
    }
    try {
        const response = await fetch(`${FLOWS_API_URL}/${flowId}`, {
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
        mlog.error('Error in setFlowById():', e);
        return undefined;
    }
}

/**
 * override previous content of `filter.operation.values` with `values`
 * @param filter {@link FlowFilter}
 * @param targetProperty - `string`
 * @param values - `Array<string>`
 * @returns **`filter`** — {@link FlowFilter}
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
        debugLogs.push(`Skipping filter in setFlowFilterValues():`,
            TAB+`property '${filter.property}' !== '${targetProperty}'`);
        return filter;
    }
    if (!filter.operation.values) {
        filter.operation.values = [];
    }
    const sameLength = filter.operation.values.length === values.length;
    const sameValues = filter.operation.values.every(value => values.includes(value));
    if (sameLength && sameValues) { // no change to filter
        debugLogs.push(NL + `No change after setFlowFilterValues() for property '${targetProperty}'.`);
        return filter;
    }
    filter.operation.values = values;
    return filter;
}

/**
 * @param filter {@link FlowFilter}
 * @param targetProperty - `string`
 * @param valuesToRemove - `Array<string>`
 * @returns **`filter`** — {@link FlowFilter}
 */
export function removeFlowFilterValues(
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
 * @param filter {@link FlowFilter}
 * @param targetProperty - `string`
 * @param valuesToAdd - `Array<string>`
 * @returns **`filter`** — {@link FlowFilter}
 */
export function addFlowFilterValues(
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
 * @param flow {@link Flow}
 * @param targetBranchName - `string`
 * @returns **`listBranch`** {@link ListBranch}
 */
export function getListBranchByName(
    flow: Flow, 
    targetBranchName: string
): ListBranch | null {
    if (!targetBranchName) {
        debugLogs.push(NL + `Exiting getListBranchByName() - input targetBranchName was undefined.`);
        return null;
    }
    if (!flow || !flow.actions || flow.actions.length === 0) {
        return null;
    }
    let actions: Action[] = flow.actions;
    debugLogs.push(
        (debugLogs.length > 0 ? NL : '') 
        + `getListBranchByName() Begin search for branch: '${targetBranchName}'`
    );
    for (let action of actions) {
        const isNotListBranchAction = Boolean(!action
            || action.type !== ActionTypeEnum.LIST_BRANCH
            || !action.listBranches
            || (action.actionTypeId && action.actionTypeId === ActionTypeIdEnum.SET_PROPERTY)
        );
        if (isNotListBranchAction) {
            // debugLogs.push(NL + `Skipping action: ${action.actionId} with type: ${action.type}`);
            continue;
        }
        let listBranch = Object.values(action.listBranches as ListBranch[]).find(
            listBranch => listBranch.branchName === targetBranchName
        );
        if (listBranch) {
            debugLogs.push(TAB + `Found branch '${targetBranchName}'`,
                TAB + `at actionId: '${action.actionId}' with type: '${action.type}'`
            );
            return listBranch;
        }
    }
    mlog.warn(`No branch found with name: '${targetBranchName}'`);
    return null;
}


/**
 * Get all {@link ListBranch} names from a {@link Flow} object.
 * @param flow {@link Flow}
 * @returns **`branchNames`**: `Array<string>`
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
                debugLogs.push(NL + `Skipping listBranch with undefined branchName.`);
            }
        }
    }
    return branchNames;
}

/**
 * `flow.action.listBranches` - `Array<`{@link ListBranch}`>`
 * @param flow {@link Flow}
 * @returns **`boolean`**
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
        mlog.error('Error in hasUniqueBranchNames():', e);
        return false;
    }
}

/**
 * @param listBranch 
 * @param newChildFilterBranches - `Array<`{@link FilterBranch}`>`
 * @returns **`listBranch`** - {@link ListBranch}
 */
export function setChildFilterBranchesOfListBranch(
    listBranch: ListBranch,
    newChildFilterBranches: Array<FilterBranch>,
): ListBranch {
    if (!listBranch || !listBranch.filterBranch) {
        debugLogs.push(NL + `Exiting setChildFilterBranchesOfListBranch() - input listBranch was undefined or does not have defined filterBranch.`);
        return listBranch;
    }
    if (!newChildFilterBranches || newChildFilterBranches.length === 0) {
        debugLogs.push(NL + `Exiting setChildFilterBranchesOfListBranch() - input newChildFilterBranches was undefined or empty.`);
        return listBranch;
    }
    let filterBranch = listBranch.filterBranch;
    filterBranch.filterBranches = newChildFilterBranches;
    return listBranch;
}

/**
 * @param flow - {@link Flow}
 * @param targetBranchName 
 * @param newChildFilterBranches - `Array<`{@link FilterBranch}`>`
 * @returns **`flow`** - {@link Flow}
 */
export function setChildFilterBranchesByListBranchName(
    flow: Flow,
    targetBranchName: string,
    newChildFilterBranches: Array<FilterBranch>,
): Flow {
    if (!flow || !flow.actions || flow.actions.length === 0) {
        debugLogs.push(NL + ` Exiting setChildFilterBranchesByListBranchName() - input flow was undefined or had no actions.`);
        return flow;
    }
    let listBranch = getListBranchByName(flow, targetBranchName);
    if (!listBranch) {
        debugLogs.push(NL + ` Exiting setChildFilterBranchesByListBranchName() - input listBranch was undefined.`);
        return flow;
    }
    listBranch = setChildFilterBranchesOfListBranch(listBranch, newChildFilterBranches);
    return flow;
}

/**
 * adds `childFilterBranch` to first `listBranch` with matching `branchName`.
 * @param flow - {@link Flow}
 * @param targetBranchName - `string`
 * @param childFilterBranch - {@link FilterBranch}
 * @returns **`flow`** - {@link Flow}
 */
export function addChildFilterBranchToListBranchByName(
    flow: Flow,
    targetBranchName: string,
    childFilterBranch: FilterBranch,
): Flow {
    if (!targetBranchName) {
        debugLogs.push(NL + `Exiting addChildFilterBranchToListBranchByName() - input targetBranchName was undefined.`);
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
 * @param flow {@link Flow}
 * @param flowId 
 * @returns **`boolean`**
 * @description Checks if flow exists and has unique branch names.
 */
export function isValidFlow(
    flow: Flow, 
    flowId: string
): boolean {
    if (!flowId) {
        mlog.error(`flowExistsAndHasUniqueBranches() Flow ID is undefined.`);
        return false;
    }
    if (!flow || typeof flow !== 'object') {
        mlog.error(`Flow not found (undefined or null or non object): ${flowId}`);
        return false;
    } else if (!hasUniqueBranchNames(flow)) {
        mlog.error(`Flow has duplicate branch names: ${flowId}`, 
            TAB+'getAllBranchNames(flow): ', getAllBranchNames(flow));
        return false;
    }
    return true;
}

/**
 * @param filterBranch {@link FilterBranch}
 * @param targetProperty - `string`
 * @param valuesToAdd - `Array<string>`
 * @param valuesToRemove - `Array<string>`
 * @param replacePreviousValues - `boolean`
 * @returns **`filterBranch`** — {@link FilterBranch}
 */
export function updateFilterBranchChildren(
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
 * @param filterBranch {@link FilterBranch}
 * @param targetProperty - `string`
 * @param valuesToAdd - `Array<string>`
 * @param valuesToRemove - `Array<string>`
 * @param replacePreviousValues - `boolean`
 * @returns **`filterBranch`** — {@link FilterBranch}
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
                flowFilter = addFlowFilterValues(flowFilter, targetProperty, valuesToAdd);
                flowFilter = removeFlowFilterValues(flowFilter, targetProperty, valuesToRemove);
            }
            let updatedValues: string[] = flowFilter.operation.values || [];
            debugLogs.push(
                // NL + `filter.property: '${flowFilter.property}'`,
                TAB + `previousValues.length: ${previousValues.length}`, 
                TAB + ` updatedValues.length: ${updatedValues.length}`,
                TAB + `      => Difference =  ${updatedValues.length - previousValues.length}`,
            );
        }
    }
    return filterBranch;
}

/**
 * @param filterBranch {@link FilterBranch} 
 * @param targetProperty 
 * @param valuesToAdd - `Array<string>`
 * @param valuesToRemove - `Array<string>`
 * @param replacePreviousValues - `boolean`
 * @returns **`filterBranch`** — {@link FilterBranch}
 */
export function updateFilterBranch(
    filterBranch: FilterBranch,
    targetProperty: string,
    valuesToAdd: Array<string> = [],
    valuesToRemove: Array<string> = [],
    replacePreviousValues: boolean = false
): FilterBranch {
    if (!filterBranch || !filterBranch.filters || !filterBranch.filterBranches) {
        debugLogs.push(NL + `Skipping filter branch in updateFilterBranch():`,
            TAB+`filters or filter branches were undefined/null.`
        );
        return filterBranch;
    }
    if (filterBranch.filters.length > 0) {
        filterBranch = updateFilterBranchFlowFilters(
            filterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    if (filterBranch.filterBranches.length > 0) {
        filterBranch = updateFilterBranchChildren(
            filterBranch, targetProperty, valuesToAdd, valuesToRemove, replacePreviousValues
        );
    }
    return filterBranch;
}


/**
 * @param flow {@link Flow}
 * @param targetBranchName - `string`
 * @param targetProperty - `string`
 * @param valuesToAdd - `Array<string>`
 * @param valuesToRemove - `Array<string>`
 * @param replacePreviousValues - `boolean`
 * @param enforceMaxValues - `boolean` from {@link FlowFilter}.ts
 * @returns **`flow`** — {@link Flow}
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
    debugLogs.push(NL+`Start of updateFlowByBranchName(flow, '${targetBranchName}', '${targetProperty}'...)`);
    if (enforceMaxValues && Math.max(...getListBranchFlowFilterValueArrayLengths(branch, targetProperty)) > MAX_VALUES_PER_FILTER) {
        debugLogs.push(NL + `Initial Distribution of filter values for branch: '${targetBranchName}'`);
        branch = distributeFilterValuesOfListBranch(
            branch, targetProperty, MAX_VALUES_PER_FILTER
        );
    }
    let filterBranch = branch.filterBranch;
    const needToDistributeValues = Boolean(enforceMaxValues 
        && filterBranch.filterBranches
        && (filterBranch.filterBranches.length > 1 || valuesToAdd.length > MAX_VALUES_PER_FILTER)
        && replacePreviousValues
        && filterBranch.filterBranchType === FilterBranchTypeEnum.OR
    );
    if (needToDistributeValues) {
        mlog.warn(`!!FOUND BRANCH WHERE NEED TO DISTRIBUTE VALUES!!`);
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
    debugLogs.push(NL + `End of updateFlowByBranchName(flow, branchName='${targetBranchName}', prop='${targetProperty}'...)`);
    mlog.debug(...debugLogs);
    debugLogs.length = 0; // clear debug logs
    return flow;
}

/**
 * @param flow {@link Flow}
 * @param updates `Array<`{@link FlowBranchUpdate}`>` 
 * @returns **`flow`** — {@link Flow}
 */
export function batchUpdateFlowByBranchName(flow: Flow, updates: Array<FlowBranchUpdate>): Flow {
    if (!flow || !updates || updates.length === 0) {
        return flow;
    }
    const targetBranchNames = updates.map(u => u.targetBranchName);
    const existingBranchNames = getAllBranchNames(flow);
    const undefinedTargetBranchNames = Array.from(new Set([
        ...targetBranchNames.filter(
            targetBranchName => !existingBranchNames.includes(targetBranchName)
        )
    ]));
    if (undefinedTargetBranchNames.length > 0) {
        mlog.warn(`batchUpdateFlowByBranchName(): Flow is missing ${undefinedTargetBranchNames.length} targetBranchName(s)`,
            TAB+`The following targetBranchNames were not found in the flow: ${JSON.stringify(undefinedTargetBranchNames)}`,
            NL+ `Removing undefinedTargetBranchNames from updates...`
        );
        updates = updates.filter(
            u => !undefinedTargetBranchNames.includes(u.targetBranchName)
        );
    }
    for (let u of updates) {
        flow = updateFlowByBranchName(flow, 
            u.targetBranchName, u.targetProperty, u.valuesToAdd, 
            u.valuesToRemove, u.replacePreviousValues, u.enforceMaxValues
        );
    }
    return flow;
}