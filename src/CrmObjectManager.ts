/**
 * @file src/CrmObjectManager.ts
 * npx ts-node -r tsconfig-paths/register --project tsconfig.node.json .\src\CrmObjectManager.ts
 */
import { 
    parseExcelForOneToMany, 
    writeObjectToJson as write, 
    ParseOneToManyOptions, 
    StringCaseOptions, 
    StringPadOptions 
} from "./utils/io";
import { DATA_DIR, ONE_DRIVE_DIR, STOP_RUNNING, DELAY, OUTPUT_DIR } from "./config/env";
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from "./config/setupLog";
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
} from "./crm";
import { PublicObjectSearchRequest as HS_PublicObjectSearchRequest } from "@hubspot/api-client/lib/codegen/crm/objects";
import path from "node:path";
const COUPON_COLUMN = "Coupon Code";
const ORDER_NUMBER_COLUMN = "Order #";
const ORDER_STATUS_COLUMN = "Status";
const DEAL_COUPON_PROP = 'coupon_code_used_unific';
const DEAL_ORDER_NUM_PROP = 'unific_order_number';

const makeKeysUpperCase: StringCaseOptions = {
    toUpper: true
};
async function main() {
    const filePath = path.join(ONE_DRIVE_DIR, "Orders With Coupons This Year.xlsx");
    const sheetName = "Orders_With_Coupons_This_Year3";//"Sheet2", 
    STOP_RUNNING(0, 'CrmObjectManager.ts end of main()');
}

main().catch((err) => {
    console.error("Error in CrmObjectManager.ts main():", err);
    STOP_RUNNING(1);
});

/**
 * @param filePath `string` - path to Excel file
 * @param sheetName `string`
 * @param couponColumn `string` - default is {@link COUPON_COLUMN}
 * @param orderNumberColumn `string` - default is {@link ORDER_NUMBER_COLUMN}
 */
async function updateDealCouponCodes(
    filePath: string, 
    sheetName: string, 
    couponColumn: string=COUPON_COLUMN, 
    orderNumberColumn: string=ORDER_NUMBER_COLUMN
): Promise<void> {
    const couponToOrderNums = parseExcelForOneToMany(
        filePath, 
        sheetName,
        couponColumn, 
        orderNumberColumn, 
        { keyCaseOptions: makeKeysUpperCase } as ParseOneToManyOptions
    );
    const dealsMissingFromHubSpot: Record<string, any[]> = {};
    const totalNumberOfOrders = Object.values(couponToOrderNums)
        .reduce((acc, orderNumbers) => acc + orderNumbers.length, 0
    );
    mlog.info(`Total number of orders with coupons from sheet: ${totalNumberOfOrders}`);
    let entryIndex = 0;
    for (const [couponCode, orderNumbers] of Object.entries(couponToOrderNums)) {
        mlog.info(`Start of entryIndex: ${entryIndex+1}/${Object.entries(couponToOrderNums).length}`,
            TAB + `coupon: "${couponCode}", numOrders: ${orderNumbers.length}`
        );
        const dealIdsToUpdate: string[] = [];
        for (const orderNum of orderNumbers) {
            /**search for deal object in hubspot with DEAL_ORDER_NUM_PROP = orderNum */ 
            const filterGroups: FilterGroup[] = [{
                filters: [{
                    propertyName: DEAL_ORDER_NUM_PROP,
                    operator: FilterOperatorEnum.EQUAL_TO,
                    value: orderNum,
                } as Filter] as Filter[],
            } as FilterGroup]
            const searchResponse = await searchObjectByProperty(
                CrmObjectEnum.DEALS, 
                filterGroups, 
                undefined, 
                5,
            ) as PublicObjectSearchResponse;
            await DELAY(1000, 
                `finished searching for order number ${orderNum}`
            );
            const searchResponseIsInvalid = Boolean(
                !searchResponse
                || !searchResponse.objectIds
                || searchResponse.objectIds.length === 0
            );
            if (searchResponseIsInvalid) {
                mlog.warn(`searchResponse is undefined or No deal found for order number ${orderNum}.`);
                if (!dealsMissingFromHubSpot[couponCode]) {
                    dealsMissingFromHubSpot[couponCode] = [];
                }
                dealsMissingFromHubSpot[couponCode].push(orderNum);
                continue;
            } 
            if (searchResponse.objectIds.length > 1) {
                mlog.warn(`Multiple deals found for order number ${orderNum}.`);
                STOP_RUNNING(1);
            }
            dealIdsToUpdate.push(searchResponse.objectIds[0]);
        }
        if (dealIdsToUpdate.length > 0) {
            await batchSetPropertyByObjectId(
                CrmObjectEnum.DEALS, 
                dealIdsToUpdate, 
                { [DEAL_COUPON_PROP]: couponCode },
            );
            await DELAY(1000,
                `finished call to update ${dealIdsToUpdate.length} deals with coupon code "${couponCode}"`
            );
        } else {
            mlog.warn(`No deals found to update for coupon code "${couponCode}".`);
        }
        entryIndex++;
        continue;
    }
    write(dealsMissingFromHubSpot, `${OUTPUT_DIR}/dealsMissingFromHubSpot.json`)
}