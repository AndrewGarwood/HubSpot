/**
 * @file src/main.ts
 */
import * as WorkflowManager from './WorkflowManager';
import { 
    // dataLoader.ts
    initializeData,
    TEST_FLOW_ID,
    // env.ts
    STOP_RUNNING,
    // setupLog.ts
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, INFO_LOGS as INFO, 
    clearFile, trimFile, DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH,
} from './config';

const FLOW_ID_LIST = [
    TEST_FLOW_ID,
];
main().catch(error => {
    mlog.error('[ERROR main()] An unexpected error occurred:', error);
    STOP_RUNNING(1);
});

async function main() {
    clearFile(DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH);
    // Initialize all data first
    mlog.info('[START main()] Initializing application data...');
    try {
        await initializeData();
        mlog.info('✓ Application data initialized successfully');
    } catch (error) {
        mlog.error('✗ Failed to initialize application data:', error);
        STOP_RUNNING(1);
    }
    await WorkflowManager.updateTerritoryWorkflows(FLOW_ID_LIST);
    mlog.info('[END main()]');
    trimFile(undefined, DEFAULT_LOG_FILEPATH, API_LOG_FILEPATH);
    STOP_RUNNING(0);
}