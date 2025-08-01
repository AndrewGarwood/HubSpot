/**
 * @file src/config/dataLoader.ts
 * @description Centralized data loading to avoid circular dependencies 
 * and ensure proper initialization order
 */
import { STOP_RUNNING, ONE_DRIVE_DIR, DATA_DIR } from "./env";
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, INFO_LOGS as INFO } from "./setupLog";
import { parseExcelForOneToMany, isFile, isDirectory } from "../utils/io/reading";
import { readJsonFileAsObject as read, validatePath } from "../utils/io/reading";
import { isNonEmptyArray, hasKeys, isNonEmptyString, isNullLike as isNull, isStringArray } from "../utils/typeValidation";
import type { StringPadOptions } from "../utils/regex/types/StringOptions";
import path from "node:path";
import * as validate from "../utils/argumentValidation";

let dataInitialized = false;

const CRM_DIR = path.join(DATA_DIR, 'crm');
const TERRITORY_DIR = path.join(DATA_DIR, 'territory');
const CONSTANTS_DIR = path.join(DATA_DIR, '.constants');
validatePath(CRM_DIR, TERRITORY_DIR, CONSTANTS_DIR);

let config: DataLoaderConfig | null = null;
/** 
 * required keys of {@link DataLoaderConfig} 
 * - `['regexFile', 'productCategoryFile', 'objectPropertiesFile', 'territoryConfigFile']` */
const configKeys = [
    'regexFile', 'productCategoryFile', 'objectPropertiesFile', 'territoryConfigFile',
];

/**
 * @enum {string} **`DataDomainEnum`** `string`
 * @property **`CRM`** = `'CRM'`
 * @property **`AUTOMATION`** = `'AUTOMATION'`
 * @property **`REGEX`** = `'REGEX'`
 */
export enum DataDomainEnum {
    CRM = 'CRM',
    AUTOMATION = 'AUTOMATION',
    REGEX = 'REGEX'
}

/* -------------------------- LOAD CRM CONFIG ------------------------------ */
/** required keys of {@link ObjectPropertyDictionary} */
const OBJECT_PROPERTY_FILE_KEYS = [
    'DEFAULT_CONTACT_PROPERTIES',
    'DEFAULT_DEAL_PROPERTIES',
    'DEFAULT_LINE_ITEM_PROPERTIES',
    'VALID_DEAL_STAGES',
    'INVALID_DEAL_STAGES',
    'DEFAULT_ADDRESS_PROPERTIES',
    'SHIPPING_ADDRESS_PROPERTIES',
    'BILLING_ADDRESS_PROPERTIES',
];

let crmData: CrmData | null = null;

/* ---------------------- LOAD AUTOMATION CONFIG -------------------------- */
let territoryData: TerritoryData | null = null;

/* ---------------------- LOAD REGEX CONFIG -------------------------- */
/** `DATA_DIR/.constants/regex_constants.json` */
let regexConstants: RegexConstants | null = null;


/* ------------------------- MAIN FUNCTION ----------------------------- */
const DEFAULT_DOMAINS_TO_LOAD = [
    DataDomainEnum.REGEX, 
    DataDomainEnum.CRM,
    DataDomainEnum.AUTOMATION,
];
/**
 * Initialize all data required by the application.
 * This should be called once at the start of the application.
 */
export async function initializeData(...domains: DataDomainEnum[]): Promise<void> {
    const source = `[dataLoader.initializeData()]`;
    if (dataInitialized) {
        mlog.info(`${source} Data already initialized, skipping...`);
        return;
    }
    const DATA_LOADER_CONFIG_FILE = path.join(DATA_DIR, `dataLoader_config.json`);
    validate.existingFileArgument(source, '.json', {DATA_LOADER_CONFIG_FILE});
    config = await loadConfig(DATA_LOADER_CONFIG_FILE) as DataLoaderConfig;

    const regexPath = path.join(CONSTANTS_DIR, config.regexFile);
    const territoryConfigPath = path.join(TERRITORY_DIR, config.territoryConfigFile);
    const categoryPath = path.join(CRM_DIR, config.productCategoryFile);
    const crmDictionaryPath = path.join(CRM_DIR, config.objectPropertiesFile);

    if (!domains || domains.length === 0) {
        domains.push(...DEFAULT_DOMAINS_TO_LOAD)
    }
    INFO.push((INFO.length === 0 ? '' : NL) 
    + `${source} Starting data initialization...`);
    try {
        for (const d of domains) {
            switch (d) {
                case DataDomainEnum.REGEX:
                    regexConstants = await loadRegexConstants(regexPath);
                    break;
                case DataDomainEnum.CRM:
                    crmData = await loadCrmData(categoryPath, crmDictionaryPath)
                    break;
                case DataDomainEnum.AUTOMATION:
                    territoryData = await loadTerritoryData(territoryConfigPath);
                    break;
                default:
                    mlog.warn(
                        `${source} Unrecognized data domain: '${d}'. Skipping...`
                    );
                    continue;
            }
        }
        dataInitialized = true;
        INFO.push(NL+`${source} ✓ All data initialized successfully`);
        mlog.info(...INFO);
        INFO.length = 0;
    } catch (error) {
        mlog.error(`${source} ✗ Failed to initialize data:`, error);
        STOP_RUNNING(1, `Data initialization failed`);
    }
}


/**
 * `synchronous` function to get territory data
 * @returns **`territoryData`** {@link TerritoryData}
 */
export function getTerritoryData(): TerritoryData {
    if (!dataInitialized || !territoryData) {
        throw new Error('[dataLoader.getTerritoryData()] Territory data not initialized. Call initializeData() first.');
    }
    return territoryData;
}

export function getRegexConstants(): RegexConstants {
    if (!dataInitialized || !regexConstants) {
        throw new Error('[dataLoader.getRegexConstants()] Regex constants not initialized. Call initializeData() first.');
    }
    return regexConstants;
}

/**
 * @returns **`CATEGORY_TO_SKU_DICT`** = `Record<string, Set<string>>` 
 * = `{ [category: string]: Set<string> }`
 */
export function getCategoryToSkuDict(): Record<string, Set<string>> {
    if (!dataInitialized || !crmData || !crmData.CATEGORY_TO_SKU_DICT) {
        throw new Error('[dataLoader.getCategoryToSkuDict()] Category to SKU dictionary not initialized. Call initializeData() first.');
    }
    return crmData.CATEGORY_TO_SKU_DICT;
}

/**
 * @returns **`ObjectPropertyDictionary`** {@link ObjectPropertyDictionary} 
 */
export function getObjectPropertyDictionary(): ObjectPropertyDictionary {
    if (!dataInitialized || !crmData || !crmData.objectPropertyDictionary) {
        throw new Error('[dataLoader.getObjectPropertyDictionary()] Object property dictionary not initialized. Call initializeData() first.');
    }
    return crmData.objectPropertyDictionary;
}

export function getCrmData(): CrmData {
    if (!dataInitialized || !crmData) {
        throw new Error('[dataLoader.getCrmData()] CRM data not initialized. Call initializeData() first.');
    }
    return crmData;
}


export function isDataInitialized(): boolean {
    return dataInitialized;
}



async function loadConfig(
    jsonPath: string
): Promise<DataLoaderConfig> {
    validatePath(jsonPath);
    let configData = read(jsonPath);
    if (!isDataLoaderConfig(configData)) {
        throw new Error([`[dataLoader.getConfig()] Invalid DataLoaderConfig json file`,
            `config filePath: '${jsonPath}'`,
            `  required keys: ${JSON.stringify(configKeys)}`
        ].join(TAB));
    }
    return configData;
}

async function loadCrmData(
    categoryPath: string,
    crmDictionaryPath: string,
): Promise<CrmData> {
    const source = `[dataLoader.loadCrmData()]`;
    validate.multipleExistingFileArguments(source, '.json',
        {categoryPath, crmDictionaryPath}
    );
    let crmDictionary = read(crmDictionaryPath);
    if (isNull(crmDictionary)) {
        throw new Error(`${source} Invalid default object properties data. Unable to read json from '${categoryPath}'`);
    }
    if (!hasKeys(crmDictionary, OBJECT_PROPERTY_FILE_KEYS, true)) {
        let message = [`${source} ERROR: json file is missing required properties`,
            `Expected: ${JSON.stringify(OBJECT_PROPERTY_FILE_KEYS)} (each mapped to array of strings)`,
            `Received: ${JSON.stringify(Object.keys(crmDictionary))}`,
        ].join(TAB);
        mlog.error(message);
        throw new Error(message);
    }
    for (const objectType of OBJECT_PROPERTY_FILE_KEYS) {
        if (!isStringArray(crmDictionary[objectType])) {
            throw new Error(`${source} Invalid key '${objectType}' in default properties file at '${crmDictionaryPath}'`);
        }
    }
    
    let categoryData = read(categoryPath) as Record<string, string[]>;
    if (isNull(categoryData)) {
        throw new Error([`${source} Invalid category data at '${categoryPath}'`,
            `Expected json object of form { "category1": ["sku1", "sku2"], ... }`
        ].join(TAB));
    }
    const categorySetData: Record<string, Set<string>> = {};
    for (const [category, skus] of Object.entries(categoryData)) {
        if (!isNonEmptyArray(skus)) {
            mlog.warn(`${source} Category "${category}" has no SKUs or is not an array.`);
            continue;
        }
        categorySetData[category] = new Set(skus);
        INFO.push(TAB+`${source} Loaded Category "${category}" with ${skus.length} SKU(s)`);
    }
    return {
        CATEGORY_TO_SKU_DICT: categorySetData,
        objectPropertyDictionary: crmDictionary as ObjectPropertyDictionary
    } as CrmData;
}



/**
 * Load regex constants
 */
async function loadRegexConstants(
    filePath: string
): Promise<RegexConstants> {
    const source = `[dataLoader.loadRegexConstants()]`;
    INFO.push(NL+`${source} Loading regex constants...`);
    validate.existingFileArgument(source, '.json', {filePath});
    const REGEX_CONSTANTS = read(filePath) as Record<string, any>;
    if (!REGEX_CONSTANTS || !hasKeys(REGEX_CONSTANTS, 
        ['COMPANY_KEYWORD_LIST', 'JOB_TITLE_SUFFIX_LIST'])) {
        throw new Error(`${source} Invalid REGEX_CONSTANTS file at '${filePath}'. Expected json object to have 'COMPANY_KEYWORD_LIST' and 'JOB_TITLE_SUFFIX_LIST' keys.`);
    }
    const COMPANY_KEYWORD_LIST: string[] = REGEX_CONSTANTS.COMPANY_KEYWORD_LIST || [];
    if (!isNonEmptyArray(COMPANY_KEYWORD_LIST)) {
        throw new Error(`${source} Invalid COMPANY_KEYWORD_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }
    const JOB_TITLE_SUFFIX_LIST: string[] = REGEX_CONSTANTS.JOB_TITLE_SUFFIX_LIST || [];
    if (!isNonEmptyArray(JOB_TITLE_SUFFIX_LIST)) {
        throw new Error(`${source} Invalid JOB_TITLE_SUFFIX_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }
    INFO.push(NL+`${source} ✓ Regex constants loaded successfully`);
    return {
        COMPANY_KEYWORD_LIST,
        JOB_TITLE_SUFFIX_LIST,
    } as RegexConstants;
}

/**
 * Load territory data
 */
async function loadTerritoryData(
    configPath: string
): Promise<TerritoryData> {
    const source = `[dataLoader.loadTerritoryData()]`
    INFO.push(NL+`${source} Loading territory data...`);
    const options = read(configPath) as TerritorySourceFileConfig;
    const {
        dealFlowId,
        contactFlowId,
        territoryFileName,
        territoryFilenamePrefix,
        branchDictionaryFileName: TERRITORY_BRANCH_NAME_DICT_FILEPATH,
        east: EAST_SHEET_NAME,
        west: WEST_SHEET_NAME,
        territoryColumn: TERRITORY_COLUMN_NAME,
        zipColumn: ZIP_COLUMN_NAME,
        regionZipProperties: REGION_ZIP_PROPS,
        territoryZipProperties: TERRITORY_ZIP_PROPS
    } = options;
    if (Object.values(options).some(v => isNull(v))) {
        throw new Error([
            `${source} Invalid TerritorySourceFileConfig json file`,
            `path received: '${configPath}'`
        ].join(TAB))
    }
    const territoryDataPath = path.join(ONE_DRIVE_DIR, territoryFileName);
    validate.existingFileArgument(source, '.xlsx', {territoryDataPath});
    
    const zipParseOptions = {
        valuePadOptions: {
            padLength: 5,
            padChar: '0',
            padLeft: true,
        } as StringPadOptions,
    };
    // Load East territory data
    const EAST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
        territoryDataPath, 
        EAST_SHEET_NAME, 
        TERRITORY_COLUMN_NAME,
        ZIP_COLUMN_NAME,
        zipParseOptions
    );
    Object.keys(EAST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
        if (territory.length === 0) {
            mlog.warn(`${source} The territory at index ${index} is empty.`);
        }
        EAST_TERRITORY_ZIPS_DICT[territory] = EAST_TERRITORY_ZIPS_DICT[territory].sort();
    });
    const EAST_ZIPS = Object.values(EAST_TERRITORY_ZIPS_DICT).flat().sort();

    // Load West territory data
    const WEST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
        territoryDataPath, 
        WEST_SHEET_NAME, 
        TERRITORY_COLUMN_NAME,
        ZIP_COLUMN_NAME,
        zipParseOptions
    );
    
    Object.keys(WEST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
        if (territory.length === 0) {
            mlog.warn(`${source} The territory at index ${index} is empty.`);
        }
        WEST_TERRITORY_ZIPS_DICT[territory] = WEST_TERRITORY_ZIPS_DICT[territory].sort();
    });
    const WEST_ZIPS = Object.values(WEST_TERRITORY_ZIPS_DICT).flat().sort();

    const ALL_TERRITORIES_ZIP_DICT = { 
        ...EAST_TERRITORY_ZIPS_DICT, 
        ...WEST_TERRITORY_ZIPS_DICT 
    };
    const ALL_REGIONS_ZIP_DICT = {
        'East': EAST_ZIPS,
        'West': WEST_ZIPS,
    };

    const TERRITORY_BRANCH_NAME_DICT = read(
        TERRITORY_BRANCH_NAME_DICT_FILEPATH
    ) as Record<string, string>;
    if (!isNonEmptyArray(Object.keys(TERRITORY_BRANCH_NAME_DICT))) {
        throw new Error(`${source} TERRITORY_BRANCH_NAME_DICT is empty or not an object.`);
    }

    const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
        key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
    );
    if (missingKeys.length > 0) {
        mlog.error(`${source} Found Territory Name(s) not in TERRITORY_BRANCH_NAME_DICT`,
            TAB+`The following keys exist in TERRITORY_ZIPS_DICT but not in TERRITORY_BRANCH_NAME_DICT:`, 
            JSON.stringify(missingKeys),
        );
        STOP_RUNNING(1);
    }

    INFO.push(NL+`${source} ✓ Territory data loaded successfully`);

    return {
        filePath: territoryDataPath,
        territoryFilenamePrefix,
        REGION_ZIP_PROPS,
        TERRITORY_ZIP_PROPS,
        EAST_TERRITORY_ZIPS_DICT,
        EAST_ZIPS,
        WEST_TERRITORY_ZIPS_DICT,
        WEST_ZIPS,
        ALL_TERRITORIES_ZIP_DICT,
        ALL_REGIONS_ZIP_DICT,
        TERRITORY_BRANCH_NAME_DICT,
        dealFlowId,
        contactFlowId,
    } as TerritoryData;
}


/**
 * @TODO export key-value pairs for `dealFlowId` and `contactFlowId` from a separate object 
 * (have to make new one then add TerritoryData and the new obejct to an export object called AutomationData or something) 
 * @interface **`TerritoryData`**
 * @property **`filePath`** `string` complete path to an excel file assumed to include 2 sheets:
 * 1. `'East Territory Alignment - Zip'`
 * 2. `'West Territory Alignment - Zip'`
 * - Both sheets must include columnNames `['Territories', 'ZIP']`.
 * @property **`REGION_ZIP_PROPS`** `string[]` = `['unific_shipping_postal_code']`
 * - zip code properties used in the East and West branches
 * @property **`TERRITORY_ZIP_PROPS`** `string[]` = `['zip', 'unific_shipping_postal_code']`
 * - zip code properties used in the territory branches.
 * - a territory is a subset of a region.
 * - The territory name is a key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
 * @property **`EAST_TERRITORY_ZIPS_DICT`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file's `'East Territory Alignment - Zip'` sheet.
 * - values are zip code lists for that territory
 * @property **`EAST_ZIPS`** `string[]`
 * - zip codes of all territories in the East Region
 * @property **`WEST_TERRITORY_ZIPS_DICT`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file's `'West Territory Alignment - Zip'` sheet.
 * - values are zip code lists for that territory
 * @property **`WEST_ZIPS`** `string[]`
 * - zip codes of all territories in the West Region
 * @property **`ALL_TERRITORIES_ZIP_DICT`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file.
 * - values are zip code lists
 * @property **`ALL_REGIONS_ZIP_DICT`** `Record<string, string[]>`
 * - keys are region names: `'East'` and `'West'`
 * - values are zip code lists for that region
 * @property **`TERRITORY_BRANCH_NAME_DICT`** `Record<string, string>`
 * - maps territory names from excel column to their actual branch names in the flow on HubSpot
 * - loaded from json file at {@link TERRITORY_BRANCH_NAME_DICT_FILEPATH} = `${DATA_DIR}territory/territory_to_branch_name.json`
 */
export interface TerritoryData {
    /**
     * @description complete path to an excel file assumed to include 2 sheets: 
     * 1. `'East Territory Alignment - Zip'` 
     * 2. `'West Territory Alignment - Zip'`
     * - Both sheets must include columnNames `['Territories', 'ZIP']`.
     */
    filePath: string;
    /** 
     * = `['unific_shipping_postal_code'] `
     * @description zip code properties used in the East and West branches 
     */
    REGION_ZIP_PROPS: string[];
    /** 
     * = `['zip', 'unific_shipping_postal_code']`
     * @description zip code properties used in the territory branches. 
     * - a territory is a subset of a region.
     * - The territory name is a key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
     */
    TERRITORY_ZIP_PROPS: string[];
    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file's `'East Territory Alignment - Zip'` sheet. 
     * - values are zip code lists for that territory
     * */
    EAST_TERRITORY_ZIPS_DICT: Record<string, string[]>;
    /**
     * @description zip codes of all territories in the East Region 
     * */
    EAST_ZIPS: string[];
    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file's `'West Territory Alignment - Zip'` sheet. 
     * - values are zip code lists for that territory
     * */
    WEST_TERRITORY_ZIPS_DICT: Record<string, string[]>;
    /**
     * @description zip codes of all territories in the West Region 
     * */
    WEST_ZIPS: string[];
    /**
     * @description
     * - keys are elements of the `'Territories'` column from the source excel file. 
     * - values are zip code lists 
     * */
    ALL_TERRITORIES_ZIP_DICT: Record<string, string[]>;
    /**
     * @description
     * - keys are region names: `'East'` and `'West'`
     * - values are zip code lists for that region
     */
    ALL_REGIONS_ZIP_DICT: Record<string, string[]>;
    /** 
     * @description maps territory names from excel column to their actual branch names in the flow on HubSpot 
     * - loaded from json file at {@link TERRITORY_BRANCH_NAME_DICT_FILEPATH} = `${DATA_DIR}territory/territory_to_branch_name.json`
     * */
    TERRITORY_BRANCH_NAME_DICT: Record<string, string>;

    dealFlowId: string;
    contactFlowId: string;
    [key: string]: any;
}

/**
 * @interface **`TerritorySourceFileConfig`**
 * @property **`territoryFileName`** `string`
 * @property **`territoryFilenamePrefix`** `string`
 * @property **`branchDictionaryFileName`** `string`
 * @property **`east`** `string`
 * @property **`west`** `string`
 * @property **`territoryColumn`** `string`
 * @property **`zipColumn`** `string`
 * @property **`regionZipProperties`** `string`
 * @property **`territoryZipProperties`** `string`
 * @property **`dealFlowId`** `string`
 * @property **`contactFlowId`** `string`
 */
export interface TerritorySourceFileConfig {
    territoryFileName: string;
    territoryFilenamePrefix: string;
    branchDictionaryFileName: string;
    east: string;
    west: string;
    territoryColumn: string;
    zipColumn: string;
    regionZipProperties: string[];
    territoryZipProperties: string[];
    dealFlowId: string;
    contactFlowId: string;
}


function isDataLoaderConfig(value: any): value is DataLoaderConfig {
    return (value && typeof value === 'object'
        && hasKeys(value, configKeys)
        && Object.values(value).every(v => isNonEmptyString(v))
    );
}


/**
 * @interface **`RegexConstants`**
 * @property **`COMPANY_KEYWORD_LIST`** `string[]`
 * @property **`JOB_TITLE_SUFFIX_LIST`** `string[]`
 */
export interface RegexConstants {
    COMPANY_KEYWORD_LIST: string[];
    JOB_TITLE_SUFFIX_LIST: string[];
}

/**
 * @interface **`CrmData`**
 * @property **`CATEGORY_TO_SKU_DICT`** `string`
 * @property **`objectPropertyDictionary`** {@link ObjectPropertyDictionary}
 */
export interface CrmData {
    CATEGORY_TO_SKU_DICT: Record<string, Set<string>>
    objectPropertyDictionary: ObjectPropertyDictionary
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
    [key: string]: string[];
}


export type DataLoaderConfig = {
    regexFile: string;
    productCategoryFile: string;
    objectPropertiesFile: string;
    territoryConfigFile: string;
    [key: string]: string
}