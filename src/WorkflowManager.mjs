import { 
    getJsonFromFile, 
    readFileLinesIntoArray, 
    printJson, 
    printConsoleGroup, 
    writeToJsonFile,
    validateFileExtension,
    parseExcelForOneToMany
} from './utils/io/io_utils.mjs';
import { 
    getFlowById, 
    setFlowById,
    flowExistsAndHasUniqueBranches,
    updateFlowByBranchName, 
    batchUpdateFlowByBranchName, 
    getListBranchByName,
    getAllBranchNames,
    hasUniqueBranchNames,
    addChildFilterBranchToListBranchByName,
    distributeFilterValuesOfListBranch,
    numberIsBetweenFilterBranch,
    generatePropertyContainsStringChildFilterBranch,
    batchGeneratePropertyContainsStringChildFilterBranch
} from './utils/auotmation/flows.mjs';

import { 
    TEST_FLOW_ID, 
    TERRITORY_BRANCH_NAME_DICT, 
    ALL_TERRITORIES_ZIP_DICT, 
    ALL_REGIONS_ZIP_DICT, 
    TERRITORY_ZIP_PROPS, 
    REGION_ZIP_PROPS 
} from './config/constants.mjs';
import { STOP_RUNNING } from './config/env.mjs';
import './types/automation/Automation.js';
import {FlowBranchUpdate} from './types/automation/Automation.js';
import './types/ConsecutiveIntegerSequence.js';
import { ConsecutiveIntegerSequence } from './types/ConsecutiveIntegerSequence.js';
import './types/automation/Operation.js';
import { Operation, NumericOperatorEnum, OperationTypeEnum, OperatorEnum } from './types/automation/Operation.js';
import './types/automation/Flow.js';
import { Flow } from './types/automation/Flow.js';
import './types/automation/FilterBranch.js';
import './types/automation/ListBranch.js';



async function main() {
    let flowId = TEST_FLOW_ID;

    /**@type {Flow} {@link Flow}*/
    let flow = await getFlowById(flowId);
    console.log('hasUniqueBranchNames(flow): ', hasUniqueBranchNames(flow));
    
    /** @example 1, update flow object in place*/
    await updateTerritoryBranches([TEST_FLOW_ID]);
    await updateRegionBranches([TEST_FLOW_ID]);
    
    /** @example 2, update flow object by replacing one a substructure in the flow object*/
    let eastBranch = getListBranchByName(flow, 'East');
    let westBranch = getListBranchByName(flow, 'West');
    eastBranch.filterBranch.filterBranches = [
        generatePropertyContainsStringChildFilterBranch(EAST_ZIPS, REGION_ZIP_PROPS[0])
    ];
    westBranch.filterBranch.filterBranches = [
        generatePropertyContainsStringChildFilterBranch(WEST_ZIPS, REGION_ZIP_PROPS[0])
    ];
    let result = await setFlowById(TEST_FLOW_ID, flow);
    writeToJsonFile({data: result, filePath: OUTPUT_DIR + '/backup_flow_after_update.json', enableOverwrite: true});

}


/**
 * 
 * @param {Array<string> | string} flowIds - Array\<string> of flow IDs to update, or a single string
 * @param {Object.<string, Array<string>>} [territoryZipDict] - Object\<string, Array<string>> mapping territory names to zip codes, defaults to {@link ALL_TERRITORIES_ZIP_DICT}
 * @param {Array<string>} [targetProps] - Array\<string> of property names to update, defaults to ['zip', 'unific_shipping_postal_code'] = {@link TERRITORY_ZIP_PROPS}
 * @param {Array<string>} [targetTerritories] - (optional) (if only want to process subset of territories) Array\<string> of territory names to update their corresponding branches. defaults to empty array, resulting in all territories in territoryZipDict being processed
 * @returns {Promise<Array<Flow>>} results = Promise<Array\<{@link Flow}>> of updated flows
 */
export async function updateTerritoryBranches(
    flowIds, 
    territoryZipDict=ALL_TERRITORIES_ZIP_DICT,
    targetProps=TERRITORY_ZIP_PROPS,
    targetTerritories=[]
) {
    if (flowIds && typeof flowIds === 'string') {
        flowIds = [flowIds];
    }
    let results = [];
    for (let flowId of flowIds) {
        /**@type {Flow} {@link Flow}*/
        let flow = await getFlowById(flowId);
        if (!flowExistsAndHasUniqueBranches(flow, flowId)) {
            STOP_RUNNING();
        }
        let updateArr = generateFlowBranchUpdateByReplaceArray(
            (Array.isArray(targetTerritories) && targetTerritories.length > 0 ? targetTerritories : Object.keys(territoryZipDict)), 
            targetProps, 
            TERRITORY_BRANCH_NAME_DICT, 
            territoryZipDict
        );
        flow = batchUpdateFlowByBranchName(flow, updateArr);
        results.push(await setFlowById(flowId, flow));
    }
    return results;
}

/**
 * @description Updates the branches of the specified flows with the given region zip codes.
 *
 * @param {Array<string> | string} flowIds - Array\<string> of flow IDs to update
 * @param {Object.<string, Array<string>>} [regionZipDict] - Object\<string, Array<string>> mapping region names to zip codes, defaults to {@link ALL_REGIONS_ZIP_DICT}
 * @param {Array<string>} [targetProps] - Array\<string> of property names to update  defaults to ['unific_shipping_postal_code'] = {@link REGION_ZIP_PROPS}
 * @param {Array<string>} [targetRegions] - (optional) region names to update its corresponding branches (e.g., ['East', 'West']) defaults to empty array, resulting in all regions in regionZipDict being processed
 * @returns {Promise<Array<Flow>>} results = Promise<Array\<{@link Flow}>> of updated flows
 */
export async function updateRegionBranches(
    flowIds, 
    regionZipDict=ALL_REGIONS_ZIP_DICT, 
    targetProps=REGION_ZIP_PROPS,
    targetRegions=[]
) {
    if (flowIds && typeof flowIds === 'string') {
        flowIds = [flowIds];
    }
    let results = [];
    for (let flowId of flowIds) {
        /**@type {Flow} {@link Flow}*/
        let flow = await getFlowById(flowId);
        if (!flowExistsAndHasUniqueBranches(flow, flowId)) {
            STOP_RUNNING();
        }    
        let updateArr = generateFlowBranchUpdateByReplaceArray(
            (Array.isArray(targetRegions) && targetRegions.length > 0 ? targetRegions : Object.keys(regionZipDict)), 
            targetProps, 
            TERRITORY_BRANCH_NAME_DICT, 
            regionZipDict
        );
        flow = batchUpdateFlowByBranchName(flow, updateArr);
    
        results.push(await setFlowById(flowId, flow));
    }
    return results;
}

/**
 * @description Generates Array of FlowBranchUpdate objects for the specified territories and properties.
 * Will overwrite the branches previous values with the new values from TERRITORY_ZIPS_DICT.
 * @param {Array<string>} targetTerritories - Array\<string> of territory (or region) names to update their corresponding branches
 * @param {Array<string>} targetProps - Array\<string> of property names to update (e.g., ['zip', 'unific_shipping_postal_code'])
 * @param {Object.<string, string>} branchNameDict - Object\<string, string> mapping territory (and region) names to the flow's actual branch names
 * @param {Object.<string, Array<string>>} zipDict - Object\<string, Array<string>> mapping territory names to zip codes
 * @returns {Array<FlowBranchUpdate>} Array\<{@link FlowBranchUpdate}>
 */
function generateFlowBranchUpdateByReplaceArray(targetTerritories, targetProps, branchNameDict, zipDict) {
    
    /**@type {Array<FlowBranchUpdate>} @see {@link FlowBranchUpdate} */
    let updates = [];
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
            });
        });
    });
    return updates;
}

/**
 * @typedef {Object} FindConsecutiveIntegerSequencesResult
 * @property {Array.<ConsecutiveIntegerSequence>} sequences - Array\<{@link ConsecutiveIntegerSequence}> of consecutive integer sequences
 * @property {Array.<string>} remainingValues - Array\<string> of non-consecutive values (i.e. the zip code contains non-numeric characters)
 */
/**
 * 
 * @param {Array.<string>} valuesArr - Array\<string> of values (in this case zip codes) to check for consecutive integer sequences 
 * @param {number} maxNumSequences - Maximum number of sequences to find before dumping rest of the values into remainingValues.
 * @returns {FindConsecutiveIntegerSequencesResult | {sequences: Array<ConsecutiveIntegerSequence>, remainingValues: Array<string>}} .{@link FindConsecutiveIntegerSequencesResult} object containing the following properties:
 * - sequences: Array\<{@link ConsecutiveIntegerSequence}> of consecutive integer sequences result.sequences.length <= maxNumSequences
 * - remainingValues: Array\<string> of non-consecutive values (i.e. the zip code contains non-numeric characters)
 */
export function findConsecutiveIntegerSequences(valuesArr, maxNumSequences=MAX_NUM_SEQUENCES) {
    /**@type {FindConsecutiveIntegerSequencesResult}, see {@link FindConsecutiveIntegerSequencesResult} */
    let result = {
        sequences: [],
        remainingValues: []
    };
    
    // Create pairs of [originalValue, numericValue] for processing
    let valuePairs = valuesArr.map(val => [val, Number(val)]);
    
    // Sort based on numeric values, keeping non-numeric at the end
    valuePairs.sort((a, b) => {
        if (isNaN(a[1]) && isNaN(b[1])) return a[0].localeCompare(b[0]);
        if (isNaN(a[1])) return 1;
        if (isNaN(b[1])) return -1;
        return a[1] - b[1];
    });
    
    let currentSequence = null;
    for (let i = 0; i < valuePairs.length; i++) {
        let [originalValue, numericValue] = valuePairs[i];
        
        if (isNaN(numericValue)) {
            result.remainingValues.push(String(originalValue).padStart(5, '0'));
            continue;
        }
        
        if (!currentSequence) {
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        } else if (numericValue === currentSequence.end + 1) {
            currentSequence.end = numericValue;
        } else if (currentSequence.length > 2) {
            result.sequences.push(currentSequence);
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        } else {
            // Handle short sequences
            if (currentSequence.length === 1) {
                result.remainingValues.push(String(currentSequence.start).padStart(5, '0'));
            } else { // length === 2
                result.remainingValues.push(String(currentSequence.start).padStart(5, '0'), String(currentSequence.end).padStart(5, '0'));
            }
            currentSequence = new ConsecutiveIntegerSequence(numericValue, numericValue);
        }
    }
    
    // Handle the final sequence
    if (currentSequence) {
        if (currentSequence.length > 2) {
            result.sequences.push(currentSequence);
        } else if (currentSequence.length === 2) {
            result.remainingValues.push(String(currentSequence.start).padStart(5, '0'), String(currentSequence.end).padStart(5, '0'));
        } else { // length === 1
            result.remainingValues.push(String(currentSequence.start).padStart(5, '0'));
        }
    }

    // Validation code
    let reformedValueArr = [...result.remainingValues];
    for (let seq of result.sequences) {
        reformedValueArr.push(...seq.sequence.map(String));
    }
    
    console.log('Reformed Value Array length:', reformedValueArr.length);
    console.log('Reformed Value Array to Set size:', new Set(reformedValueArr).size);
    
    console.log('Validation of findConsecutiveIntegerSequences()',
        `\n\tNumber of Remaining Values: ${result.remainingValues.length}`,
        `\n\tNumber of Sequences: ${result.sequences.length}`,
        `\n\tCombined Length of Consecutive Sequences: ${result.sequences.reduce((acc, seq) => acc + seq.length, 0)}`,
    );
    
    if (maxNumSequences && result.sequences.length > maxNumSequences) {
        // Sort sequences by length (descending)
        result.sequences.sort((a, b) => b.length - a.length);

        // Keep only the top sequences
        const discardedSequences = result.sequences.slice(maxNumSequences);
        result.sequences = result.sequences.slice(0, maxNumSequences);

        // For all the remaining sequences, push seq.sequence.map(String) into result.remainingValues
        for (const seq of discardedSequences) {
            result.remainingValues.push(...seq.sequence.map(num => String(num).padStart(5, '0')));
        }
    }
    console.log('End result of findConsecutiveIntegerSequences()',
        `\n\tNumber of Remaining Values: ${result.remainingValues.length}`,
        `\n\tNumber of Sequences: ${result.sequences.length}`,
        `\n\tCombined Length of Consecutive Sequences: ${result.sequences.reduce((acc, seq) => acc + seq.length, 0)}`,
    );
    console.log('Top sequences:', result.sequences.map(seq => seq.sequence));
    return result;
}