/**
 * src/config/loadData.ts
 */
import { STOP_RUNNING, ONE_DRIVE_DIR } from './env';
import { parseExcelForOneToMany, StringPadOptions, ParseOneToManyOptions } from '../utils/io';
import { CATEGORY_A_ITEMS, CATEGORY_B_ITEMS, CATEGORY_C_ITEMS, CATEGORY_D_ITEMS, CATEGORY_E_ITEMS, CATEGORY_F_ITEMS } from '../data/inventory';
/**
 * @description name of excel file assumed to include sheetNames ['East Territory Alignment - Zip', 'West Territory Alignment - Zip']
 * with these sheets including columnNames ['Territories', 'ZIP'].
 */
export const territoryDataFileName = 'Letybo Sales Rep Contact - Zipcode Alignment 2025.05.02.xlsx';

/** 
 * = `['unific_shipping_postal_code'] `
 * @description zip code properties used in the East and West branches 
 */
export const REGION_ZIP_PROPS = ['unific_shipping_postal_code']

/** 
 * = `['zip', 'unific_shipping_postal_code']`
 * @description zip code properties used in the territory branches. a territory branch is a subset of a region branch.
 * The territory branch name is the key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
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
    `${ONE_DRIVE_DIR}/${territoryDataFileName}`, 
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
    `${ONE_DRIVE_DIR}/${territoryDataFileName}`, 
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

export const ALL_TERRITORIES_ZIP_DICT = { 
    ...EAST_TERRITORY_ZIPS_DICT, 
    ...WEST_TERRITORY_ZIPS_DICT 
};

export const ALL_REGIONS_ZIP_DICT = {
    'East': EAST_ZIPS,
    'West': WEST_ZIPS,
};

/** map excel column value for a territory to its actual branch name in the flow on HubSpot */
export const TERRITORY_BRANCH_NAME_DICT: Record<string, string> = {
    'East': 'East',
    'West': 'West',
    'WA - Seattle': 'Seattle',
};

const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
    key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
);
const TAB = '\n\t';
const NL = '\n > ';
if (missingKeys.length > 0) {
    console.error(`Found Territory Name(s) not in TERRITORY_BRANCH_NAME_DICT`,
        TAB+`The following keys exist in TERRITORY_ZIPS_DICT but not in TERRITORY_BRANCH_NAME_DICT:`, 
        JSON.stringify(missingKeys),
    );
    STOP_RUNNING(1);
}


export const CATEGORY_TO_SKU_DICT: Record<string, Set<string>> = {
    'CategoryA': CATEGORY_A_ITEMS,
    'CategoryB': CATEGORY_B_ITEMS,
    'CategoryC': CATEGORY_C_ITEMS,
    'CategoryD': CATEGORY_D_ITEMS,
    'CategoryE': CATEGORY_E_ITEMS,
    'CategoryF': CATEGORY_F_ITEMS
}

export const TEST_FLOW_ID = '1637307812';
export const ALT_TEST_FLOW_ID = '1645441838';