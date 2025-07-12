/**
 * @file src/config/dataLoader.ts
 * @description Centralized data loading to avoid circular dependencies 
 * and ensure proper initialization order
 */
import { STOP_RUNNING, ONE_DRIVE_DIR, DATA_DIR } from './env';
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from './setupLog';
import { parseExcelForOneToMany } from '../utils/io/reading';
import { readJsonFileAsObject as read, validatePath } from '../utils/io/reading';
import { isNonEmptyArray } from '../utils/typeValidation';
import type { ParseOneToManyOptions } from '../utils/io/types/Reading';
import type { StringPadOptions } from '../utils/io/regex/types/StringOptions';
import path from 'node:path';

export const TEST_FLOW_ID = '1637307812';
export const ALT_TEST_FLOW_ID = '1645441838';
/**
 * @description name of excel file assumed to include 2 sheets: 
 * 1. `'East Territory Alignment - Zip'` 
 * 2. `'West Territory Alignment - Zip'`
 * - Both sheets must include columnNames `['Territories', 'ZIP']`.
 */
const territoryFileName = `Letybo Sales Rep Contact - Zipcode Alignment 2025.07.09.xlsx`;
const territoryFilePath = path.join(ONE_DRIVE_DIR, territoryFileName);
const EAST_SHEET_NAME = 'East Territory Alignment - Zip';
const WEST_SHEET_NAME = 'West Territory Alignment - Zip';
const TERRITORY_COLUMN_NAME = 'Territories';
const ZIP_COLUMN_NAME = 'ZIP';

/** = `${DATA_DIR}territory/territory_to_branch_name.json` */
const TERRITORY_BRANCH_NAME_DICT_FILE_PATH = path.join(
    DATA_DIR, 'territory', 'territory_to_branch_name.json'
);
/** 
 * = `['unific_shipping_postal_code'] `
 * @description zip code properties used in the East and West branches 
 */
const REGION_ZIP_PROPS = ['unific_shipping_postal_code'];
/** 
 * = `['zip', 'unific_shipping_postal_code']`
 * @description zip code properties used in the territory branches. 
 * - a territory is a subset of a region.
 * - The territory name is a key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
 */
const TERRITORY_ZIP_PROPS = ['zip', 'unific_shipping_postal_code'];
// Global state to track if data has been loaded
let dataInitialized = false;
let territoryData: TerritoryData | null = null;
let regexConstants: RegexConstants | null = null;
let CATEGORY_TO_SKU_DICT: Record<string, Set<string>> = {};

const regexFileName = `regex_constants.json`;
const regexFilePath = path.join(DATA_DIR, '.constants', regexFileName);

export interface RegexConstants {
    COMPANY_KEYWORD_LIST: string[];
    JOB_TITLE_SUFFIX_LIST: string[];
}

const inventoryFileName = `category_to_sku_list.json`;
const inventoryFilePath = path.join(DATA_DIR, 'inventory', inventoryFileName);
/**
 * Initialize all data required by the application.
 * This should be called once at the start of the application.
 * 
 * Calls the following functions in the listed order:
 * - {@link loadTerritoryData}`(territoryFilePath)`
 * - {@link loadRegexConstants}`(regexFilePath)`
 * - {@link loadInventoryData}`(inventoryFilePath)`
 */
export async function initializeData(): Promise<void> {
    if (dataInitialized) {
        mlog.info('[dataLoader.initializeData()] Data already initialized, skipping...');
        return;
    }
    mlog.info('[dataLoader.initializeData()] Initializing application data...');

    try {
        territoryData = await loadTerritoryData(territoryFilePath);
        // Load regex constants
        regexConstants = await loadRegexConstants(regexFilePath);
        // Load inventory data
        CATEGORY_TO_SKU_DICT = await loadInventoryData(inventoryFilePath);
        dataInitialized = true;
        mlog.info('[dataLoader.initializeData()] ✓ All data initialized successfully');
    } catch (error) {
        mlog.error('[dataLoader.initializeData()] ✗ Failed to initialize data:', error);
        STOP_RUNNING(1, 'Data initialization failed');
    }
}

/**
 * Load territory data
 */
async function loadTerritoryData(filePath: string): Promise<TerritoryData> {
    mlog.info('[dataLoader.loadTerritoryData()] Loading territory data...');
    validatePath(filePath);
    const zipParseOptions: ParseOneToManyOptions = {
        valuePadOptions: {
            padLength: 5,
            padChar: '0',
            padLeft: true,
        } as StringPadOptions,
    };
    // Load East territory data
    const EAST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
        filePath, 
        EAST_SHEET_NAME, 
        TERRITORY_COLUMN_NAME,
        ZIP_COLUMN_NAME,
        zipParseOptions
    );
    Object.keys(EAST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
        if (territory.length === 0) {
            mlog.warn(`The territory at index ${index} is empty.`);
        }
        EAST_TERRITORY_ZIPS_DICT[territory] = EAST_TERRITORY_ZIPS_DICT[territory].sort();
    });
    const EAST_ZIPS = Object.values(EAST_TERRITORY_ZIPS_DICT).flat().sort();

    // Load West territory data
    const WEST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
        filePath, 
        WEST_SHEET_NAME, 
        TERRITORY_COLUMN_NAME,
        ZIP_COLUMN_NAME,
        zipParseOptions
    );
    
    Object.keys(WEST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
        if (territory.length === 0) {
            mlog.warn(`The territory at index ${index} is empty.`);
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
    validatePath(TERRITORY_BRANCH_NAME_DICT_FILE_PATH);

    const TERRITORY_BRANCH_NAME_DICT = read(
        TERRITORY_BRANCH_NAME_DICT_FILE_PATH
    ) as Record<string, string>;
    if (!isNonEmptyArray(Object.keys(TERRITORY_BRANCH_NAME_DICT))) {
        throw new Error(`[dataLoader.loadTerritoryData()] TERRITORY_BRANCH_NAME_DICT is empty or not an object.`);
    }

    const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
        key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
    );
    if (missingKeys.length > 0) {
        mlog.error(`[dataLoader.loadTerritoryData()] Found Territory Name(s) not in TERRITORY_BRANCH_NAME_DICT`,
            TAB+`The following keys exist in TERRITORY_ZIPS_DICT but not in TERRITORY_BRANCH_NAME_DICT:`, 
            JSON.stringify(missingKeys),
        );
        STOP_RUNNING(1);
    }

    mlog.info('[dataLoader.loadTerritoryData()] ✓ Territory data loaded successfully');

    return {
        filePath,
        REGION_ZIP_PROPS,
        TERRITORY_ZIP_PROPS,
        EAST_TERRITORY_ZIPS_DICT,
        EAST_ZIPS,
        WEST_TERRITORY_ZIPS_DICT,
        WEST_ZIPS,
        ALL_TERRITORIES_ZIP_DICT,
        ALL_REGIONS_ZIP_DICT,
        TERRITORY_BRANCH_NAME_DICT,
    };
}

async function loadInventoryData(filePath: string): Promise<Record<string, Set<string>>> {
    mlog.info('[dataLoader.loadInventoryData()] Loading inventory data...');
    validatePath(filePath);
    const jsonData = read(filePath) as Record<string, any>;
    if (!jsonData || typeof jsonData !== 'object') {
        throw new Error(`[dataLoader.loadInventoryData()] Invalid inventory data at '${filePath}'. Expected json object.`);
    }
    const CATEGORY_TO_SKU_DICT: Record<string, Set<string>> = {};
    Object.keys(jsonData).forEach(key => {
        const skus = jsonData[key];
        if (!isNonEmptyArray(skus)) {
            throw new Error(`[dataLoader.loadInventoryData()] Invalid SKU list for category "${key}" at '${filePath}'.`);
        }
        CATEGORY_TO_SKU_DICT[key] = new Set(skus);
        mlog.info(`[dataLoader.loadInventoryData()] Loaded Category "${key}" with ${skus.length} SKU(s)`);
    });

    mlog.info('[dataLoader.loadInventoryData()] ✓ Inventory data loaded successfully');
    return CATEGORY_TO_SKU_DICT;
}


/**
 * Load regex constants
 */
async function loadRegexConstants(filePath: string): Promise<RegexConstants> {
    mlog.info('[dataLoader.loadRegexConstants()] Loading regex constants...');
    validatePath(filePath);

    const REGEX_CONSTANTS = read(filePath) as Record<string, any>;
    
    if (!REGEX_CONSTANTS || !REGEX_CONSTANTS.hasOwnProperty('COMPANY_KEYWORD_LIST') || !REGEX_CONSTANTS.hasOwnProperty('JOB_TITLE_SUFFIX_LIST')) {
        throw new Error(`[dataLoader.loadRegexConstants()] Invalid REGEX_CONSTANTS file at '${filePath}'. Expected json object to have 'COMPANY_KEYWORD_LIST' and 'JOB_TITLE_SUFFIX_LIST' keys.`);
    }

    const COMPANY_KEYWORD_LIST: string[] = REGEX_CONSTANTS.COMPANY_KEYWORD_LIST || [];
    if (!isNonEmptyArray(COMPANY_KEYWORD_LIST)) {
        throw new Error(`[dataLoader.loadRegexConstants()] Invalid COMPANY_KEYWORD_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }

    const JOB_TITLE_SUFFIX_LIST: string[] = REGEX_CONSTANTS.JOB_TITLE_SUFFIX_LIST || [];
    if (!isNonEmptyArray(JOB_TITLE_SUFFIX_LIST)) {
        throw new Error(`[dataLoader.loadRegexConstants()] Invalid JOB_TITLE_SUFFIX_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }

    mlog.info('[dataLoader.loadRegexConstants()] ✓ Regex constants loaded successfully');

    return {
        COMPANY_KEYWORD_LIST,
        JOB_TITLE_SUFFIX_LIST,
    };
}

/**
 * synchronous function to get territory data
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

export function getCategoryToSkuDict(): Record<string, Set<string>> {
    if (!dataInitialized) {
        throw new Error('[dataLoader.getCategoryToSkuDict()] Category to SKU dictionary not initialized. Call initializeData() first.');
    }
    return CATEGORY_TO_SKU_DICT;
}

export function isDataInitialized(): boolean {
    return dataInitialized;
}

/**
 * @interface TerritoryData
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
 * * @property **`EAST_ZIPS`** `string[]`
 * - zip codes of all territories in the East Region
 * * @property **`WEST_TERRITORY_ZIPS_DICT`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file's `'West Territory Alignment - Zip'` sheet.
 * - values are zip code lists for that territory
 * * @property **`WEST_ZIPS`** `string[]`
 * - zip codes of all territories in the West Region
 * @property **`ALL_TERRITORIES_ZIP_DICT`** `Record<string, string[]>`
 * - keys are elements of the `'Territories'` column from the source excel file.
 * - values are zip code lists
 * @property **`ALL_REGIONS_ZIP_DICT`** `Record<string, string[]>`
 * - keys are region names: `'East'` and `'West'`
 * - values are zip code lists for that region
 * @property **`TERRITORY_BRANCH_NAME_DICT`** `Record<string, string>`
 * - maps territory names from excel column to their actual branch names in the flow on HubSpot
 * - loaded from json file at {@link TERRITORY_BRANCH_NAME_DICT_FILE_PATH} = `${DATA_DIR}territory/territory_to_branch_name.json`
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
     * - loaded from json file at {@link TERRITORY_BRANCH_NAME_DICT_FILE_PATH} = `${DATA_DIR}territory/territory_to_branch_name.json`
     * */
    TERRITORY_BRANCH_NAME_DICT: Record<string, string>;
}

