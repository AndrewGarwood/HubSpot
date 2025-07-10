/**
 * @file src/config/dataLoader.ts
 * @description Centralized data loading to avoid circular dependencies and ensure proper initialization order
 */
import { STOP_RUNNING, ONE_DRIVE_DIR, DATA_DIR } from './env';
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from './setupLog';
import { parseExcelForOneToMany } from '../utils/io/reading';
import { readJsonFileAsObject as read, validatePath } from '../utils/io/reading';
import { isNonEmptyArray } from '../utils/typeValidation';
import type { ParseOneToManyOptions } from '../utils/io/types/Reading';
import type { StringPadOptions } from '../utils/io/regex/types/StringOptions';
import path from 'node:path';

// Load territory branch name mapping
const TERRITORY_BRANCH_NAME_DICT_FILE_PATH = path.join(
    DATA_DIR, 'territory', 'territory_to_branch_name.json'
);

// Global state to track if data has been loaded
let dataInitialized = false;
let territoryData: TerritoryData | null = null;
let regexConstants: RegexConstants | null = null;
let CATEGORY_TO_SKU_DICT: Record<string, Set<string>> = {};

export interface TerritoryData {
    filePath: string;
    REGION_ZIP_PROPS: string[];
    TERRITORY_ZIP_PROPS: string[];
    EAST_TERRITORY_ZIPS_DICT: Record<string, string[]>;
    EAST_ZIPS: string[];
    WEST_TERRITORY_ZIPS_DICT: Record<string, string[]>;
    WEST_ZIPS: string[];
    ALL_TERRITORIES_ZIP_DICT: Record<string, string[]>;
    ALL_REGIONS_ZIP_DICT: Record<string, string[]>;
    TERRITORY_BRANCH_NAME_DICT: Record<string, string>;
}

export interface RegexConstants {
    COMPANY_KEYWORD_LIST: string[];
    JOB_TITLE_SUFFIX_LIST: string[];
}

/**
 * Initialize all data required by the application
 * This should be called once at the start of the application
 */
export async function initializeData(): Promise<void> {
    if (dataInitialized) {
        mlog.info('[dataLoader.ts] Data already initialized, skipping...');
        return;
    }

    mlog.info('[dataLoader.ts] Initializing application data...');
    
    try {
        const territoryFileName = `Letybo Sales Rep Contact - Zipcode Alignment 2025.07.09.xlsx`
        const territoryFilePath = path.join(ONE_DRIVE_DIR, territoryFileName);
        // Load territory data
        territoryData = await loadTerritoryData(territoryFilePath);
        const regexFileName = `regex_constants.json`;
        const regexFilePath = path.join(DATA_DIR, '.constants', regexFileName);
        // Load regex constants
        regexConstants = await loadRegexConstants(regexFilePath);

        const inventoryFileName = `category_to_sku_list.json`;
        const inventoryFilePath = path.join(DATA_DIR, 'inventory', inventoryFileName);
        // Load inventory data
        CATEGORY_TO_SKU_DICT = await loadInventoryData(inventoryFilePath);

        dataInitialized = true;
        mlog.info('[dataLoader.ts] ✓ All data initialized successfully');
    } catch (error) {
        mlog.error('[dataLoader.ts] ✗ Failed to initialize data:', error);
        STOP_RUNNING(1, 'Data initialization failed');
    }
}

/**
 * Load territory and SKU data
 */
async function loadTerritoryData(filePath: string): Promise<TerritoryData> {
    mlog.info('[dataLoader.ts] Loading territory data...');

    validatePath(filePath);

    const REGION_ZIP_PROPS = ['unific_shipping_postal_code'];
    const TERRITORY_ZIP_PROPS = ['zip', 'unific_shipping_postal_code'];

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
        'East Territory Alignment - Zip', 
        'Territories', 
        'ZIP',
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
        'West Territory Alignment - Zip', 
        'Territories', 
        'ZIP',
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
        throw new Error(`[dataLoader.ts] TERRITORY_BRANCH_NAME_DICT is empty or not an object.`);
    }

    const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
        key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
    );
    if (missingKeys.length > 0) {
        mlog.error(`Found Territory Name(s) not in TERRITORY_BRANCH_NAME_DICT`,
            TAB+`The following keys exist in TERRITORY_ZIPS_DICT but not in TERRITORY_BRANCH_NAME_DICT:`, 
            JSON.stringify(missingKeys),
        );
        STOP_RUNNING(1);
    }

    mlog.info('[dataLoader.ts] ✓ Territory data loaded successfully');

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
    mlog.info('[dataLoader.ts] Loading inventory data...');
    validatePath(filePath);

    const jsonData = read(filePath) as Record<string, any>;
    if (!jsonData || typeof jsonData !== 'object') {
        throw new Error(`[dataLoader.ts] Invalid inventory data at '${filePath}'. Expected json object.`);
    }

    const CATEGORY_TO_SKU_DICT: Record<string, Set<string>> = {};
    Object.keys(jsonData).forEach(key => {
        const skus = jsonData[key];
        if (!isNonEmptyArray(skus)) {
            throw new Error(`[dataLoader.ts] Invalid SKU list for category "${key}" at '${filePath}'.`);
        }
        CATEGORY_TO_SKU_DICT[key] = new Set(skus);
        mlog.info(`[dataLoader.ts] Loaded Category "${key}" with ${skus.length} SKU(s)`);
    });

    mlog.info('[dataLoader.ts] ✓ Inventory data loaded successfully');
    return CATEGORY_TO_SKU_DICT;
}


/**
 * Load regex constants
 */
async function loadRegexConstants(filePath: string): Promise<RegexConstants> {
    mlog.info('[dataLoader.ts] Loading regex constants...');
    validatePath(filePath);

    const REGEX_CONSTANTS = read(filePath) as Record<string, any>;
    
    if (!REGEX_CONSTANTS || !REGEX_CONSTANTS.hasOwnProperty('COMPANY_KEYWORD_LIST') || !REGEX_CONSTANTS.hasOwnProperty('JOB_TITLE_SUFFIX_LIST')) {
        throw new Error(`[dataLoader.ts] Invalid REGEX_CONSTANTS file at '${filePath}'. Expected json object to have 'COMPANY_KEYWORD_LIST' and 'JOB_TITLE_SUFFIX_LIST' keys.`);
    }

    const COMPANY_KEYWORD_LIST: string[] = REGEX_CONSTANTS.COMPANY_KEYWORD_LIST || [];
    if (!isNonEmptyArray(COMPANY_KEYWORD_LIST)) {
        throw new Error(`[dataLoader.ts] Invalid COMPANY_KEYWORD_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }

    const JOB_TITLE_SUFFIX_LIST: string[] = REGEX_CONSTANTS.JOB_TITLE_SUFFIX_LIST || [];
    if (!isNonEmptyArray(JOB_TITLE_SUFFIX_LIST)) {
        throw new Error(`[dataLoader.ts] Invalid JOB_TITLE_SUFFIX_LIST in REGEX_CONSTANTS file at '${filePath}'`);
    }

    mlog.info('[dataLoader.ts] ✓ Regex constants loaded successfully');

    return {
        COMPANY_KEYWORD_LIST,
        JOB_TITLE_SUFFIX_LIST,
    };
}

// Getter functions to access loaded data
export function getTerritoryData(): TerritoryData {
    if (!dataInitialized || !territoryData) {
        throw new Error('[dataLoader.ts] Territory data not initialized. Call initializeData() first.');
    }
    return territoryData;
}

export function getRegexConstants(): RegexConstants {
    if (!dataInitialized || !regexConstants) {
        throw new Error('[dataLoader.ts] Regex constants not initialized. Call initializeData() first.');
    }
    return regexConstants;
}

export function getCategoryToSkuDict(): Record<string, Set<string>> {
    if (!dataInitialized) {
        throw new Error('[dataLoader.ts] Category to SKU dictionary not initialized. Call initializeData() first.');
    }
    return CATEGORY_TO_SKU_DICT;
}

export function isDataInitialized(): boolean {
    return dataInitialized;
}

// Export flow IDs (these don't need initialization)
export const TEST_FLOW_ID = '1637307812';
export const ALT_TEST_FLOW_ID = '1645441838';
export const DEAL_LETYBO_OWNER_FLOW_ID = '1630134134';
export const CONTACT_LETYBO_OWNER_FLOW_ID = '1633823083';
export const CONTACT_ISR_OWNER_FLOW_ID = '566875187';
