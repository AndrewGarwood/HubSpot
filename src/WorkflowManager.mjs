
import { 
    getJsonFromFile, 
    readFileLinesIntoArray, 
    printJson, 
    printConsoleGroup, 
    writeToJsonFile,
    validateFileExtension
} from './utils/io/io_utils.mjs';
import { 
    getFlowById, 
    setFlowById,
    updateFlowByBranchName, 
    batchUpdateFlowByBranchName, 
    getListBranchByName,
    hasUniqueBranchNames,
} from './utils/auotmation/flows.mjs';
import { TEST_FLOW_ID } from './config/constants.mjs';
import './types/automation/Flow.js';
import './types/automation/FilterBranch.js';
import './types/automation/ListBranch.js';


async function main() {
    let flowId = TEST_FLOW_ID;

    /**@type {Flow} {@link Flow}*/
    let flow = await getFlowById(flowId);
    console.log('hasUniqueBranchNames(flow): ', hasUniqueBranchNames(flow));
    // code goes here
}