/**
 * @file src/WorkflowManager.ts
 */
import { 
    TEST_FLOW_ID, 
    TERRITORY_BRANCH_NAME_DICT,
    EAST_TERRITORY_ZIPS_DICT,
    WEST_TERRITORY_ZIPS_DICT,
    ALL_TERRITORIES_ZIP_DICT,
    ALL_REGIONS_ZIP_DICT,
    EAST_ZIPS,
    WEST_ZIPS,
    REGION_ZIP_PROPS,
    TERRITORY_ZIP_PROPS
} from './config/loadData';
import { 
    getFlowById, 
    setFlowById, 
    flowExistsAndHasUniqueBranches,
    batchUpdateFlowByBranchName, FlowBranchUpdate, Flow
} from "./automation";
import { ONE_DRIVE_DIR, OUTPUT_DIR, STOP_RUNNING, DELAY } from './config/env';
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
    await updateTerritoryBranches(FLOW_ID_LIST);
    DELAY(2000);
    await updateRegionBranches(FLOW_ID_LIST);
}


/**
 * 
 * @param {Array<string> | string} flowIds - `Array<string>` of flow IDs to update, or a single string
 * @param {Record<string, Array<string>>} [territoryZipDict] - `Record<string, Array<string>>` mapping territory names to zip codes, defaults to {@link ALL_TERRITORIES_ZIP_DICT}
 * @param {Array<string>} [targetProps] - `Array<string>` of property names to update, defaults to `['zip', 'unific_shipping_postal_code']` = {@link TERRITORY_ZIP_PROPS}
 * @param {Array<string>} [targetTerritories] - (`optional`) (if only want to process subset of territories) `Array<string>` of territory names to update their corresponding branches. defaults to empty array, resulting in all territories in `territoryZipDict` being processed
 * @returns {Promise<Array<Flow>>} `results` = `Promise<Array<`{@link Flow}`>>` of updated flows
 */
export async function updateTerritoryBranches(
    flowIds: Array<string> | string, 
    territoryZipDict: Record<string, Array<string>> = ALL_TERRITORIES_ZIP_DICT,
    targetProps: string[] = TERRITORY_ZIP_PROPS,
    targetTerritories: string[] = []
): Promise<Flow[]> {
    if (!flowIds) {
        console.error('flowIds is undefined or null');
        return [];
    }
    if (typeof flowIds === 'string') {
        flowIds = [flowIds];
    }
    let results: Flow[] = [];
    for (let flowId of flowIds) {
        let flow: Flow | undefined = await getFlowById(flowId);
        if (!flowExistsAndHasUniqueBranches(flow, flowId)) {
            STOP_RUNNING();
        }
        let updateArr = generateFlowBranchUpdateByReplaceArray(
            (Array.isArray(targetTerritories) && targetTerritories.length > 0 ? targetTerritories : Object.keys(territoryZipDict)), 
            targetProps, 
            TERRITORY_BRANCH_NAME_DICT, 
            territoryZipDict
        );
        flow = batchUpdateFlowByBranchName(flow as Flow, updateArr);
        results.push(await setFlowById(flowId, flow) as Flow);
    }
    return results;
}

/**
 * @description Updates the branches of the specified flows with the given region zip codes.
 *
 * @param {Array<string> | string} flowIds - `Array<string>` of flow IDs to update
 * @param {Record<string, Array<string>>} [regionZipDict] - `Record<string, Array<string>>` mapping region names to zip codes, defaults to {@link ALL_REGIONS_ZIP_DICT}
 * @param {Array<string>} [targetProps] - `Array<string>` of property names to update  defaults to `['unific_shipping_postal_code']` = {@link REGION_ZIP_PROPS}
 * @param {Array<string>} [targetRegions] - (`optional`) region names to update its corresponding branches (e.g., `['East', 'West']`) defaults to empty array, resulting in all regions in `regionZipDict` being processed
 * @returns {Promise<Array<Flow>>} `results` = `Promise<Array<`{@link Flow}`>>` of updated flows
 */
export async function updateRegionBranches(
    flowIds: Array<string> | string, 
    regionZipDict: Record<string, Array<string>> = ALL_REGIONS_ZIP_DICT, 
    targetProps: string[] = REGION_ZIP_PROPS,
    targetRegions: string[] = []
): Promise<Flow[]> {
    if (!flowIds) {
        console.error('flowIds is undefined or null');
        return [];
    }
    if (typeof flowIds === 'string') {
        flowIds = [flowIds];
    }
    let results: Flow[] = [];
    for (let flowId of flowIds) {
        let flow: Flow | undefined = await getFlowById(flowId);
        if (flow === undefined || !flowExistsAndHasUniqueBranches(flow, flowId)) {
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
        results.push(await setFlowById(flowId, flow) as Flow);
    }
    return results;
}

/**
 * @description Generates Array of {@link FlowBranchUpdate} objects for the specified territories and properties.
 * Will overwrite the branches previous values with the new values from {@link TERRITORY_ZIPS_DICT}.
 * @param {Array<string>} targetTerritories - `Array<string>` of territory (or region) names to update their corresponding branches
 * @param {Array<string>} targetProps - `Array<string>` of property names to update (e.g., `['zip', 'unific_shipping_postal_code']`)
 * @param {Record<string, string>} branchNameDict - `Record<string, string>` mapping territory (and region) names to the flow's actual branch names
 * @param {Record<string, Array<string>>} zipDict - `Record<string, Array<string>>` mapping territory names to zip codes
 * @returns {Array<FlowBranchUpdate>} `Array<`{@link FlowBranchUpdate}`>`
 */
function generateFlowBranchUpdateByReplaceArray(
    targetTerritories: string[], 
    targetProps: string[], 
    branchNameDict: Record<string, string>, 
    zipDict: Record<string, Array<string>>
): FlowBranchUpdate[] {
    if (!targetTerritories || targetTerritories.length === 0) {
        console.error('targetTerritories is undefined or empty');
        return [];
    }
    if (!targetProps || targetProps.length === 0) {
        console.error('targetProps is undefined or empty');
        return [];
    }
    if (!branchNameDict || Object.keys(branchNameDict).length === 0) {
        console.error('branchNameDict is undefined or empty');
        return [];
    }
    if (!zipDict || Object.keys(zipDict).length === 0) {
        console.error('zipDict is undefined or empty');
        return [];
    }
    let updates: FlowBranchUpdate[] = [];
    targetTerritories.forEach(territory => {
        if (!branchNameDict[territory]) {
            console.error(`Branch name not found for territory: ${territory}`);
            STOP_RUNNING();
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