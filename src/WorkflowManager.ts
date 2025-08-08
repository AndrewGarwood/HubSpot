/**
 * @file src/WorkflowManager.ts
 */
import { 
    TerritoryData,
    isDataInitialized,
    initializeData,
    getTerritoryData,
    STOP_RUNNING, DELAY,
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, INFO_LOGS as INFO
} from './config';
import { 
    getFlowById, 
    setFlowById, 
    isValidFlow,
    batchUpdateFlowByBranchName
} from './api/automation/flows';
import { FlowBranchUpdate, Flow } from './api/automation/types';
import { isNonEmptyArray } from './utils/typeValidation';


export async function updateTerritoryWorkflows(
    flowIds: string[]
): Promise<void> {
    if (!isDataInitialized()) {
        mlog.error('[WorkflowManager.updateTerritoryWorkflows()] Data not initialized. Initializing now...');
        await initializeData();
    }
    mlog.info('[WorkflowManager.updateTerritoryWorkflows()] Starting flow updates',
        TAB+`flows.length: ${flowIds.length}`,    
    );
    const updateStartTime = new Date();
    for (const [index, flowId] of flowIds.entries()) {
        const territoryUpdateStartTime = new Date();
        INFO.push((INFO.length > 0 ? NL : '')+`Processing flow ${index+1}/${flowIds.length}`,
            TAB+`flowId: ${flowId}`,
            TAB+`starting territory branches update at ${territoryUpdateStartTime.toLocaleTimeString()}`,
        );
        await updateTerritoryBranches(flowId);
        INFO.push(NL+`Finished updating territory branches.`,
            TAB+`Time Elapsed: ${(new Date().getTime() - territoryUpdateStartTime.getTime())/1000} seconds.`
        );
        DELAY(2000, null);
        const regionUpdateStartTime = new Date();
        await updateRegionBranches(flowId);
        INFO.push(NL+`Finished updating region branches.`,
            TAB+`Time Elapsed: ${(new Date().getTime() - regionUpdateStartTime.getTime())/1000} seconds.`,
            NL+`Finished processing flow ${index+1}/${flowIds.length}`,
            TAB+`Time Elapsed: ${(new Date().getTime() - territoryUpdateStartTime.getTime())/1000} seconds.`,
        );
        mlog.info(...INFO);
        INFO.length = 0;
    }
    mlog.info(`[END WorkflowManager.updateTerritoryWorkflows()] Successfully updated ${flowIds.length} flow(s).`,
        TAB+`Total Time Elapsed: ${(new Date().getTime() - updateStartTime.getTime())/1000} seconds.`,
    );
    return;
}


/**
 * @param flowId - `string` a single flow ID to update
 * @param territoryZipDict - `Record<string, Array<string>>` mapping territory names to zip codes, defaults to loaded territory data
 * @param targetProps - `Array<string>` of property names to update, defaults to loaded territory props
 * @param targetTerritories - `Array<string>` (`optional`) (if only want to process subset of territories) territory names to update their corresponding branches. defaults to empty array, resulting in all territories in `territoryZipDict` being processed
 * @returns **`results`** = `Promise<Flow>` updated flow
 */
export async function updateTerritoryBranches(
    flowId: string, 
    territoryZipDict?: Record<string, Array<string>>,
    targetProps?: string[],
    targetTerritories: string[] = []
): Promise<Flow> {
    if (!flowId) {
        mlog.error('[updateTerritoryBranches()] flowId is undefined or null');
        return {} as Flow;
    }
    
    // Get data from the loader
    const territoryData = getTerritoryData() as TerritoryData;
    const zipDict = territoryZipDict || territoryData.ALL_TERRITORIES_ZIP_DICT;
    const propList = targetProps || territoryData.TERRITORY_ZIP_PROPS;

    let result: Flow;
    
    let flow = await getFlowById(flowId) as Flow;
    if (!isValidFlow(flow, flowId)) {
        STOP_RUNNING();
    }
    let updateArr = generateFlowBranchUpdateByReplaceArray(
        (isNonEmptyArray(targetTerritories) 
            ? targetTerritories 
            : Object.keys(zipDict)
        ),
        propList,
        territoryData.TERRITORY_BRANCH_NAME_DICT, 
        zipDict
    );
    flow = batchUpdateFlowByBranchName(flow as Flow, updateArr);
    result = await setFlowById(flowId, flow) as Flow;
    return result;
}

/**
 * @description Updates the branches of the specified flows with the given region zip codes.
 * @param flowId - `string` single flowId to update
 * @param regionZipDict - `Record<string, Array<string>>` mapping region names to zip codes, defaults to loaded region data
 * @param targetProps - `Array<string>` of property names to update, defaults to loaded region props
 * @param targetRegions - (`optional`) region names to update its corresponding branches (e.g., `['East', 'West']`) defaults to empty array, resulting in all regions in `regionZipDict` being processed
 * @returns **`result`** = `Promise<Flow>` updated flow
 */
export async function updateRegionBranches(
    flowId: string, 
    regionZipDict?: Record<string, Array<string>>, 
    targetProps?: string[],
    targetRegions: string[] = []
): Promise<Flow> {
    if (!flowId || typeof flowId !== 'string' || flowId.trim() === '') {
        mlog.error('[updateRegionBranches()] flowId is undefined or null');
        return {} as Flow;
    }
    
    // Get data from the loader
    const territoryData = getTerritoryData() as TerritoryData;
    const zipDict = regionZipDict || territoryData.ALL_REGIONS_ZIP_DICT;
    const propList = targetProps || territoryData.REGION_ZIP_PROPS;

    let result: Flow;
    let flow: Flow | undefined = await getFlowById(flowId);
    if (flow === undefined || !isValidFlow(flow, flowId)) {
        STOP_RUNNING();
    }    
    let updateArr = generateFlowBranchUpdateByReplaceArray(
        (isNonEmptyArray(targetRegions)
            ? targetRegions 
            : Object.keys(zipDict)
        ),
        propList,
        territoryData.TERRITORY_BRANCH_NAME_DICT,
        zipDict
    );
    flow = batchUpdateFlowByBranchName(flow as Flow, updateArr);
    result = await setFlowById(flowId, flow) as Flow;
    return result;
}

/**
 * @description Generates Array of {@link FlowBranchUpdate} objects for the specified territories and properties.
 * - Will overwrite the branches previous values with the new values from {@link zipDict}.
 * @param targetTerritories - `Array<string>` of territory (or region) names to update their corresponding branches
 * @param targetProps - `Array<string>` of property names to update (e.g., `['zip', 'unific_shipping_postal_code']`)
 * @param branchNameDict - `Record<string, string>` mapping territory (and region) names to the flow's actual branch names
 * @param zipDict - `Record<string, Array<string>>` mapping territory names to zip codes
 * @returns **`updates`** = `Array<`{@link FlowBranchUpdate}`>`
 */
function generateFlowBranchUpdateByReplaceArray(
    targetTerritories: string[], 
    targetProps: string[], 
    branchNameDict: Record<string, string>, 
    zipDict: Record<string, Array<string>>
): FlowBranchUpdate[] {
    if (!isNonEmptyArray(targetTerritories)) {
        mlog.error('targetTerritories is undefined or empty');
        return [];
    }
    if (!isNonEmptyArray(targetProps)) {
        mlog.error('targetProps is undefined or empty');
        return [];
    }
    if (!branchNameDict || Object.keys(branchNameDict).length === 0) {
        mlog.error('branchNameDict is undefined or empty');
        return [];
    }
    if (!zipDict || Object.keys(zipDict).length === 0) {
        mlog.error('zipDict is undefined or empty');
        return [];
    }
    let updates: FlowBranchUpdate[] = [];
    targetTerritories.forEach(territory => {
        if (!branchNameDict[territory]) {
            mlog.error(`Branch name not found for territory: ${territory}`);
            STOP_RUNNING(1);
        }
        targetProps.forEach(prop => {
            updates.push({
                targetBranchName: branchNameDict[territory],
                targetProperty: prop,
                valuesToAdd: zipDict[territory],
                valuesToRemove: [],
                replacePreviousValues: true
            } as FlowBranchUpdate);
        });
    });
    return updates;
}