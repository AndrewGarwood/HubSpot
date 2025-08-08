/**
 * @file src/main.ts
 */
import * as WorkflowManager from './WorkflowManager';
import { 
    initializeData,
    getTerritoryData,
    STOP_RUNNING,
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, INFO_LOGS as INFO, 
    DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH,
} from './config';
import { clearFile, trimFile, indentedStringify } from './utils/io';
import { parseAddress, cities } from "addresser";

main().catch(error => {
    mlog.error('[ERROR main()] An unexpected error occurred:', error);
    STOP_RUNNING(1);
});

async function main() {
    clearFile(DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH);
    const a1 = `4060 George Washington Ln. Room 326 Seattle WA 98105`;
    const a2 = `4060 George Washington Ln., Room 326, Seattle, WA 98105`;
    mlog.info([`[main.main()] Test addresser library parse output:`,
        `  a1 (no commas): '${a1}'`,
        `parseAddress(a1): '${indentedStringify(parseAddress(a1))}'`,
        `a2 (with commas): '${a2}'`,
        `parseAddress(a1): '${indentedStringify(parseAddress(a2))}'`,
    ].join(NL));
    STOP_RUNNING(0);
    mlog.info('[START main()] calling initializeData()...');
    try {
        await initializeData();
        mlog.info('✓ Application data initialized successfully');
    } catch (error) {
        mlog.error('✗ Failed to initialize application data:', error);
        STOP_RUNNING(1);
    }


    mlog.info('[END main()]');
    trimFile(undefined, DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH);
    STOP_RUNNING(0);
}

async function executeFlowUpdate(): Promise<void> {
    const { dealFlowId, contactFlowId } = getTerritoryData();
    const flowIds = [dealFlowId, contactFlowId]
    await WorkflowManager.updateTerritoryWorkflows(flowIds);

}