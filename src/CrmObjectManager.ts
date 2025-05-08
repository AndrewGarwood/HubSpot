/**
 * @file ts_src/CrmObjectManager.ts
 */
import { parseExcelForOneToMany, parseCsvForOneToMany, writeObjectToJson } from "./utils/io";
import { DATA_DIR, ONE_DRIVE_DIR, STOP_RUNNING, DELAY, OUTPUT_DIR } from "./config/env";
import { searchObjectByProperty,
    setPropertyByObjectId,
    batchSetPropertyByObjectId, 
    FilterOperatorEnum, 
    Filter, 
    FilterGroup, 
    PublicObjectSearchRequest, 
    PublicObjectSearchResponse, CrmAssociationObjectEnum, 
    CrmObjectWithBasicApiEndpointEnum
} from "./utils/crm";
import { PublicObjectSearchRequest as HS_PublicObjectSearchRequest } from "@hubspot/api-client/lib/codegen/crm/objects";
import path from "node:path";
async function main() {
    console.log("Hello, World!");
}