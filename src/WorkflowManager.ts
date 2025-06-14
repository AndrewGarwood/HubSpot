/**
 * @file src/WorkflowManager.ts
 */
import { 
    // loadData.ts
    TEST_FLOW_ID,
    TERRITORY_BRANCH_NAME_DICT,
    ALL_TERRITORIES_ZIP_DICT,
    ALL_REGIONS_ZIP_DICT,
    REGION_ZIP_PROPS,
    TERRITORY_ZIP_PROPS, 
    // env.ts
    ONE_DRIVE_DIR, OUTPUT_DIR, STOP_RUNNING, DELAY,
    // setupLog.ts
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL,
} from './config';
import { 
    getFlowById, 
    setFlowById, 
    isValidFlow,
    batchUpdateFlowByBranchName, FlowBranchUpdate, Flow
} from "./automation";
import { 
    readJsonFileAsObject, 
    printJson, 
    printConsoleGroup, 
    writeObjectToJson,
    validateFileExtension,
    parseExcelForOneToMany
} from './utils/io'
const FLOW_ID_LIST = [TEST_FLOW_ID]

main().catch(e => {
    console.error('Error in main():', e);
    STOP_RUNNING(1);
});
async function main() {
    mlog.info('Starting WorkflowManager main()',
        TAB+`FLOW_ID_LIST.length: ${FLOW_ID_LIST.length}`,    
    );
    const mainStartTime = new Date();
    for (const [index, flowId] of FLOW_ID_LIST.entries()) {
        const territoryUpdateStartTime = new Date();
        let infoLogs = [`Processing flow ${index+1}/${FLOW_ID_LIST.length}`,
            TAB+`flowId: ${flowId}`,
            TAB+`starting territory branches update at ${territoryUpdateStartTime.toLocaleTimeString()}`,
        ]
        await updateTerritoryBranches(flowId);
        infoLogs.push(NL+`Finished updating territory branches.`,
            TAB+`Time Elapsed: ${(new Date().getTime() - territoryUpdateStartTime.getTime())/1000} seconds.`
        );
        DELAY(2000, null);
        const regionUpdateStartTime = new Date();
        await updateRegionBranches(flowId);
        infoLogs.push(`Finished updating region branches.`,
            TAB+`Time Elapsed: ${(new Date().getTime() - regionUpdateStartTime.getTime())/1000} seconds.`,
            NL+`Finished processing flow ${index+1}/${FLOW_ID_LIST.length}`,
            TAB+`Time Elapsed: ${(new Date().getTime() - territoryUpdateStartTime.getTime())/1000} seconds.`,
        );
        mlog.info(...infoLogs);
    }
    mlog.info(`End of main(). Successfully updated ${FLOW_ID_LIST.length} flow(s).`,
        TAB+`Total Time Elapsed: ${(new Date().getTime() - mainStartTime.getTime())/1000} seconds.`,
    );
    STOP_RUNNING(0);
}


/**
 * @param flowId - `string` a single flow ID to update
 * @param territoryZipDict - `Record<string, Array<string>>` mapping territory names to zip codes, defaults to {@link ALL_TERRITORIES_ZIP_DICT}
 * @param targetProps - `Array<string>` of property names to update, defaults to `['zip', 'unific_shipping_postal_code']` = {@link TERRITORY_ZIP_PROPS}
 * @param targetTerritories - `Array<string>` (`optional`) (if only want to process subset of territories) territory names to update their corresponding branches. defaults to empty array, resulting in all territories in `territoryZipDict` being processed
 * @returns **`results`** = `Promise<`{@link Flow}`>` updated flow
 */
export async function updateTerritoryBranches(
    flowId: string, 
    territoryZipDict: Record<string, Array<string>> = ALL_TERRITORIES_ZIP_DICT,
    targetProps: string[] = TERRITORY_ZIP_PROPS,
    targetTerritories: string[] = []
): Promise<Flow> {
    if (!flowId) {
        mlog.error('flowId is undefined or null');
        return {} as Flow;
    }
    let result: Flow;
    
    let flow = await getFlowById(flowId) as Flow;
    if (!isValidFlow(flow, flowId)) {
        STOP_RUNNING();
    }
    let updateArr = generateFlowBranchUpdateByReplaceArray(
        (Array.isArray(targetTerritories) && targetTerritories.length > 0 
            ? targetTerritories : Object.keys(territoryZipDict)), 
        targetProps, 
        TERRITORY_BRANCH_NAME_DICT, 
        territoryZipDict
    );
    flow = batchUpdateFlowByBranchName(flow as Flow, updateArr);
    result = await setFlowById(flowId, flow) as Flow;
    return result;
}

/**
 * @description Updates the branches of the specified flows with the given region zip codes.
 * @param flowId - `string` single flowId to update
 * @param regionZipDict - `Record<string, Array<string>>` mapping region names to zip codes, defaults to {@link ALL_REGIONS_ZIP_DICT}
 * @param targetProps - `Array<string>` of property names to update  defaults to `['unific_shipping_postal_code']` = {@link REGION_ZIP_PROPS}
 * @param targetRegions - (`optional`) region names to update its corresponding branches (e.g., `['East', 'West']`) defaults to empty array, resulting in all regions in `regionZipDict` being processed
 * @returns **`result`** = `Promise<`{@link Flow}`>` updated flow
 */
export async function updateRegionBranches(
    flowId: string, 
    regionZipDict: Record<string, Array<string>> = ALL_REGIONS_ZIP_DICT, 
    targetProps: string[] = REGION_ZIP_PROPS,
    targetRegions: string[] = []
): Promise<Flow> {
    if (!flowId || typeof flowId !== 'string' || flowId.trim() === '') {
        mlog.error('flowId is undefined or null');
        return {} as Flow;
    }
    let result: Flow;
    let flow: Flow | undefined = await getFlowById(flowId);
    if (flow === undefined || !isValidFlow(flow, flowId)) {
        STOP_RUNNING();
    }    
    let updateArr = generateFlowBranchUpdateByReplaceArray(
        (Array.isArray(targetRegions) && targetRegions.length > 0 
            ? targetRegions : Object.keys(regionZipDict)), 
        targetProps, 
        TERRITORY_BRANCH_NAME_DICT, 
        regionZipDict
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
    if (!targetTerritories || targetTerritories.length === 0) {
        mlog.error('targetTerritories is undefined or empty');
        return [];
    }
    if (!targetProps || targetProps.length === 0) {
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