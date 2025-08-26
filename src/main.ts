/**
 * @file src/main.ts
 */
import { 
    initializeEnvironment,
    initializeData,
    getTerritoryData,
    STOP_RUNNING,
    mainLogger as mlog, simpleLogger as slog,
    INDENT_LOG_LINE as TAB, NEW_LINE as NL, LOG_FILES
} from "./config";
import { clearFile, trimFile, indentedStringify } from "typeshi:utils/io";
import { extractFileName } from "@typeshi/regex";
import { CrmAssociationObjectEnum, getDealById, GetDealByIdParams } from "src/api/crm";
import * as WorkflowManager from "./services/WorkflowManager";
const F = extractFileName(__filename);

main().catch(error => {
    mlog.error(`[ERROR main()] An unexpected error occurred:`, error);
    STOP_RUNNING(1);
});

async function main() {
    const source = `[${F}.main()]`;
    await initializeEnvironment();
    await initializeData();
    await clearFile(...LOG_FILES);

    mlog.info(`${source} END`);
    await trimFile(undefined, ...LOG_FILES);
    STOP_RUNNING(0);
}

/**
 * @deprecated need to rewrite with new TerritoryData defn
 * */
async function executeFlowUpdate(): Promise<void> {
}

export { executeFlowUpdate }