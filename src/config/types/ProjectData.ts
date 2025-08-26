/**
 * @file src/config/types/ProjectData.ts
 */

import { ApiObjectEnum } from "src/api/crm";


/**
 * @enum {string} **`DataDomainEnum`** `string`
 * @property **`CRM`** = `'crm'`
 * @property **`AUTOMATION`** = `'automation'`
 */
export enum DataDomainEnum {
    CRM = 'crm',
    AUTOMATION = 'automation',
}

/**
 * @interface **`CrmData`**
 * @property **`CATEGORY_TO_SKU_DICT`** `string`
 * @property **`objectPropertyDictionary`** {@link ObjectPropertyDictionary}
 */
export interface CrmData {
    productCategoryDictionary: Record<string, Set<string>>;
    objectPropertyDictionary: ObjectPropertyDictionary;
    // netNewPropertyId: string;
}
/**
 * @interface **`ObjectPropertyDictionary`**
 * @property **`DEFAULT_CONTACT_PROPERTIES`** `string[]`
 * @property **`DEFAULT_DEAL_PROPERTIES`** `string[]`
 * @property **`DEFAULT_LINE_ITEM_PROPERTIES`** `string[]`
 * @property **`DEFAULT_ADDRESS_PROPERTIES`** `string[]`
 * @property **`SHIPPING_ADDRESS_PROPERTIES`** `string[]`
 * @property **`BILLING_ADDRESS_PROPERTIES`** `string[]`
 * @property **`[key: string]`** `string[]`
 */
export interface ObjectPropertyDictionary {
    DEFAULT_CONTACT_PROPERTIES: string[];
    DEFAULT_DEAL_PROPERTIES: string[];
    DEFAULT_LINE_ITEM_PROPERTIES: string[];
    DEFAULT_ADDRESS_PROPERTIES: string[];
    SHIPPING_ADDRESS_PROPERTIES: string[];
    BILLING_ADDRESS_PROPERTIES: string[];
    VALID_DEAL_STAGES: string[];
    INVALID_DEAL_STAGES: string[];
    [key: string]: string[];
}

export type DataSourceDictionary = Record<DataDomainEnum, { [fileLabel: string]: string }>;

// {
//     [keyof typeof DataDomainEnum]: { [fileLabel: string]: string }
// }
/*

 * @property **`regionZipProperties`** `string[]` = `['unific_shipping_postal_code']`
 * - zip code properties used in the East and West branches
 * @property **`territoryZipProperties`** `string[]` = `['zip', 'unific_shipping_postal_code']`
 * - zip code properties used in the territory branches.
 * - a territory is a subset of a region.
 * - The territory name is a key in the {@link branchDict} object.
    /** 
     * = `['unific_shipping_postal_code'] `
     * @description zip code properties used in the East and West branches 
    
    regionZipProperties: string[];
    /** 
     * = `['zip', 'unific_shipping_postal_code']`
     * @description zip code properties used in the territory branches. 
     * - a territory is a subset of a region.
     * - The territory name is a key in the {@link branchDict} object.
    
    territoryZipProperties: string[];
*/


/**
 * @TODO export key-value pairs for `dealFlowId` and `contactFlowId` from a separate object 
 * (have to make new one then add TerritoryData and the new obejct to an export object called AutomationData or something) 
 * @interface **`TerritoryData`**
 * @property **`filePath`** `string` complete path to an excel file assumed to include 2 sheets:
 * 1. `'East Territory Alignment - Zip'`
 * 2. `'West Territory Alignment - Zip'`
 * - Both sheets must include columnNames `['Territories', 'ZIP']`.
 * @property **`eastTerritoryDict`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file's `'East Territory Alignment - Zip'` sheet.
 * - values are zip code lists for that territory
 * @property **`eastZips`** `string[]`
 * - zip codes of all territories in the East Region
 * @property **`westTerritoryDict`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file's `'West Territory Alignment - Zip'` sheet.
 * - values are zip code lists for that territory
 * @property **`westZips`** `string[]`
 * - zip codes of all territories in the West Region
 * @property **`compositeTerritoryDict`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file.
 * - values are zip code lists
 * @property **`regionDict`** `Record<string, string[]>`
 * - keys are region names: `'East'` and `'West'`
 * - values are zip code lists for that region
 * @property **`branchDict`** `Record<string, string>`
 * - maps territory names from excel column to their actual branch names in the flow on HubSpot
 */
export interface TerritoryData {
    /**
     * @description complete path to an excel file assumed to include 2 sheets: 
     * 1. `'East Territory Alignment - Zip'` 
     * 2. `'West Territory Alignment - Zip'`
     * - Both sheets must include columnNames `['Territories', 'ZIP']`.
     */
    filePath: string;
    flows: TerritoryFlowConfig[];

    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file's `'East Territory Alignment - Zip'` sheet. 
     * - values are zip code lists for that territory
     * */
    eastTerritoryDict: Record<string, string[]>;
    /**
     * @description zip codes of all territories in the East Region 
     * */
    eastZips: string[];
    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file's `'West Territory Alignment - Zip'` sheet. 
     * - values are zip code lists for that territory
     * */
    westTerritoryDict: Record<string, string[]>;
    /**
     * @description zip codes of all territories in the West Region 
     * */
    westZips: string[];
    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file. 
     * - values are zip code lists 
     * */
    compositeTerritoryDict: Record<string, string[]>;
    /**
     * @description
     * - keys are region names: `'East'` and `'West'`
     * - values are zip code lists for that region
     */
    regionDict: { [regionBranchName: string]: string[] }
    /** 
     * @description maps territory names from excel column to their actual branch names in the flow on HubSpot 
     * - loaded from json file at {@link TERRITORY_BRANCH_NAME_DICT_FILEPATH} = `${DATA_DIR}territory/territory_to_branch_name.json`
     * */
    branchDict: { [territoryName: string]: string };
}

/**
 * @interface **`TerritorySourceFileConfig`**
 * @property **`fileNamePrefix`** `string`
 * @property **`territoryColumn`** `string`
 * @property **`zipColumn`** `string`
 * @property **`eastRegionSheetName`** `string`
 * @property **`westRegionSheetName`** `string`
 */
export interface TerritorySourceFileConfig {
    fileNamePrefix: string;
    territoryColumn: string;
    zipColumn: string;
    eastRegionSheetName: string;
    westRegionSheetName: string;
}

export interface TerritoryFlowConfig {
    objectType: string | ApiObjectEnum;
    flowId: string;
    name: string;
    regionZipProperties: string[];
    territoryZipProperties: string[];
}

export interface LoadTerritoryDataOptions {
    sourceOptions: TerritorySourceFileConfig;
    flows: TerritoryFlowConfig[];
}
