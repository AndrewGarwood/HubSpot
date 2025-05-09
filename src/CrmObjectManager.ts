/**
 * @file ts_src/CrmObjectManager.ts
 */
import { 
    parseExcelForOneToMany, 
    writeObjectToJson, 
    ParseOneToManyOptions, 
    StringCaseOptions, 
    StringPadOptions 
} from "./utils/io";
import { DATA_DIR, ONE_DRIVE_DIR, STOP_RUNNING, DELAY, OUTPUT_DIR } from "./config/env";
import { mainLogger as log } from "./config/setupLog";
import { searchObjectByProperty,
    updatePropertyByObjectId,
    batchUpdatePropertyByObjectId,
    setPropertyByObjectId,
    batchSetPropertyByObjectId, 
    FilterOperatorEnum, 
    Filter, 
    FilterGroup, 
    PublicObjectSearchRequest, 
    PublicObjectSearchResponse, 
    CrmAssociationObjectEnum, 
    CrmObjectEnum,
    getDealByOrderNumber,
} from "./utils/crm";
import { PublicObjectSearchRequest as HS_PublicObjectSearchRequest } from "@hubspot/api-client/lib/codegen/crm/objects";
import path from "node:path";

async function main() {
    log.silly("Hello from CrmObjectManager.ts main()");
    STOP_RUNNING(0, 'end of main()');
}

main().catch((err) => {
    log.error("Error in CrmObjectManager.ts main():", err);
    STOP_RUNNING(1);
});