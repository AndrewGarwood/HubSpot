/**
 * @TODO put loading of territory data and SKU data into their own files.
 * @file src/config/loadData.ts
 */
import { STOP_RUNNING, ONE_DRIVE_DIR, DATA_DIR } from './env';
import { parseExcelForOneToMany, StringPadOptions, ParseOneToManyOptions } from '../utils/io';
import { readJsonFileAsObject as read, validatePath } from '../utils/io/reading';
import { isNonEmptyArray } from '../utils/typeValidation';
import path from 'node:path';
const TAB = '\n\t• ';
const NL = '\n > ';
/**
 * @description name of excel file assumed to include 2 sheets: 
 * 1. `'East Territory Alignment - Zip'` 
 * 2. `'West Territory Alignment - Zip'`
 * - Both sheets must include columnNames `['Territories', 'ZIP']`.
 */
export const territoryDataFileName = 'Letybo Sales Rep Contact - Zipcode Alignment 2025.06.12.xlsx';
/** `${ONE_DRIVE_DIR}/${territoryDataFileName}` */
const TERRITORY_FILE_PATH = path.join(ONE_DRIVE_DIR, territoryDataFileName);
validatePath(TERRITORY_FILE_PATH);

/** 
 * = `['unific_shipping_postal_code'] `
 * @description zip code properties used in the East and West branches 
 */
export const REGION_ZIP_PROPS = ['unific_shipping_postal_code']

/** 
 * = `['zip', 'unific_shipping_postal_code']`
 * @description zip code properties used in the territory branches. 
 * - a territory is a subset of a region.
 * - The territory name is a key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
 */
export const TERRITORY_ZIP_PROPS = ['zip', 'unific_shipping_postal_code'];
const zipParseOptions: ParseOneToManyOptions = {
    valuePadOptions: {
        padLength: 5,
        padChar: '0',
        padLeft: true,
    } as StringPadOptions,
}
export const EAST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
    TERRITORY_FILE_PATH, 
    'East Territory Alignment - Zip', 
    'Territories', 
    'ZIP',
    zipParseOptions
);

Object.keys(EAST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
    if (territory.length === 0) {
        console.warn(`The territory at index ${index} is empty.`);
    }
    EAST_TERRITORY_ZIPS_DICT[territory] = EAST_TERRITORY_ZIPS_DICT[territory].sort();
});

/**@description zip codes of all territories in the East Region */
export const EAST_ZIPS = Object.values(EAST_TERRITORY_ZIPS_DICT).flat().sort();

export const WEST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
    TERRITORY_FILE_PATH, 
    'West Territory Alignment - Zip', 
    'Territories', 
    'ZIP',
    zipParseOptions
);
Object.keys(WEST_TERRITORY_ZIPS_DICT).forEach((territory, index) => {
    if (territory.length === 0) {
        console.warn(`The territory at index ${index} is empty.`);
    }
    WEST_TERRITORY_ZIPS_DICT[territory] = WEST_TERRITORY_ZIPS_DICT[territory].sort();
});

/**@description zip codes of all territories in the West Region */
export const WEST_ZIPS = (Object.values(WEST_TERRITORY_ZIPS_DICT).flat()).sort();

/**keys are elements of the `'Territories'` column from the source excel file. values are zip code lists */
export const ALL_TERRITORIES_ZIP_DICT = { 
    ...EAST_TERRITORY_ZIPS_DICT, 
    ...WEST_TERRITORY_ZIPS_DICT 
};

export const ALL_REGIONS_ZIP_DICT = {
    'East': EAST_ZIPS,
    'West': WEST_ZIPS,
};


const TERRITORY_BRANCH_NAME_DICT_FILE_PATH = path.join(
    DATA_DIR, 'territory', 'territory_to_branch_name.json'
);
validatePath(TERRITORY_BRANCH_NAME_DICT_FILE_PATH);
/** 
 * @description map territory name from excel column to its actual branch name in the flow on HubSpot 
 * */
export const TERRITORY_BRANCH_NAME_DICT = read(
    TERRITORY_BRANCH_NAME_DICT_FILE_PATH
) as Record<string, string>;
if (!isNonEmptyArray(Object.keys(TERRITORY_BRANCH_NAME_DICT))) {
    throw new Error(`[loadData.ts] TERRITORY_BRANCH_NAME_DICT is empty or not an object.`);
}

const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
    key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
);
if (missingKeys.length > 0) {
    console.error(`Found Territory Name(s) not in TERRITORY_BRANCH_NAME_DICT`,
        TAB+`The following keys exist in TERRITORY_ZIPS_DICT but not in TERRITORY_BRANCH_NAME_DICT:`, 
        JSON.stringify(missingKeys),
    );
    STOP_RUNNING(1);
}

const SKU_DICT_PATH = path.join(DATA_DIR, 'inventory', 'category_to_sku_list.json');
validatePath(SKU_DICT_PATH);
const jsonData = read(SKU_DICT_PATH) as Record<string, Array<string>>;
export const CATEGORY_TO_SKU_DICT = Object.keys(jsonData).reduce((acc, key) => {
    if (!isNonEmptyArray(jsonData[key])) {
        throw new Error(`[loadData.ts] Category "${key}" has no SKUs or is not an array.`);
    }
    acc[key] = new Set(jsonData[key]);
    console.log(NL+`Loaded Category "${key}" with ${jsonData[key].length} SKU(s)`);
    return acc;
}, {} as Record<string, Set<string>>);


export const TEST_FLOW_ID = '1637307812';
export const ALT_TEST_FLOW_ID = '1645441838';

export const DEAL_LETYBO_OWNER_FLOW_ID = '1630134134';
export const CONTACT_LETYBO_OWNER_FLOW_ID = '1633823083';

export const CONTACT_ISR_OWNER_FLOW_ID = '566875187';