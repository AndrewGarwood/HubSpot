/**
 * @file constants.mjs
 */

import { STOP_RUNNING } from "./env.mjs";
import { parseExcelForOneToMany } from "../utils/io/read_utils.mjs";

/** For http request headers 'Content-Type' and 'accept' */
export const APPLICATION_JSON = 'application/json';

export const TEST_FLOW_ID = 'TEST_FLOW_ID';

/**
 * @description object that maps territories/regions (keys) to their corresponding branch name (values).
 * it is assumed that all branchName values of a ListBranch that exists in a HubSpot workflow.
 * a territory is a subset of a region.
 * @type {Object<string, string>} territory-branchName key value pairs.
 */
export const TERRITORY_BRANCH_NAME_DICT = {
    'East': 'East',
    'West': 'West',
    'WA - Seattle': 'Seattle',
}


/** 
 * = ['unific_shipping_postal_code'] 
 * @description zip code properties used when updating the East and West Region branches' filters
 */
export const REGION_ZIP_PROPS = ['unific_shipping_postal_code']

/** 
 * = ['zip', 'unific_shipping_postal_code']
 * @description zip code properties used when updating the territory branches.
 * The territory branch name is the key in the {@link TERRITORY_BRANCH_NAME_DICT} object.
 */
export const TERRITORY_ZIP_PROPS = ['zip', 'unific_shipping_postal_code'];

/**
 * @description name of excel file assumed to include sheetNames ['East Region Sheet Name', 'West Region Sheet Name']
 * with these sheets including columnNames ['Territories', 'ZIP'].
 */
export const territoryDataFilePath = '~/path/to/territoryDataFile.xlsx';

/**
 * @description dictionary of East region's territories mapped to their respective zip codes.
 * The dictionary is created by parsing the excel file {@link parseExcelForOneToMany}
 * @type {Object<string, Array<string>>}
 * @property {string} key - territory name.
 * @property {Array<string>} value - array of zip codes.
 */
export const EAST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
    territoryDataFilePath, 
    'East Region Sheet Name', 
    'Territories', 
    'ZIP'
);

/**@description zip codes of all territories in the East Region */
export const EAST_ZIPS = Object.values(EAST_TERRITORY_ZIPS_DICT).flat();

/**
 * @description dictionary of West region's territories mapped to their respective zip codes.
 * The dictionary is created by parsing the excel file {@link parseExcelForOneToMany}
 * @type {Object<string, Array<string>>}
 * @property {string} key - territory name.
 * @property {Array<string>} value - array of zip codes.
 */
export const WEST_TERRITORY_ZIPS_DICT = parseExcelForOneToMany(
    territoryDataFilePath, 
    'West Region Sheet Name', 
    'Territories', 
    'ZIP'
);

/**@description zip codes of all territories in the West Region */
export const WEST_ZIPS = Object.values(WEST_TERRITORY_ZIPS_DICT).flat();

export const ALL_TERRITORIES_ZIP_DICT = { 
    ...EAST_TERRITORY_ZIPS_DICT, 
    ...WEST_TERRITORY_ZIPS_DICT 
};

export const ALL_REGIONS_ZIP_DICT = {
    'East': EAST_ZIPS,
    'West': WEST_ZIPS,
};

/**
 * @description non-empty if parsed key does not exist among known territory-branchName key value pairs
 * @type {Array<string>} missingKeys - array of keys that exist in ALL_TERRITORIES_ZIP_DICT but not in TERRITORY_BRANCH_NAME_DICT. 
 */
const missingKeys = Object.keys(ALL_TERRITORIES_ZIP_DICT).filter(
    key => !TERRITORY_BRANCH_NAME_DICT.hasOwnProperty(key)
);
if (missingKeys.length > 0) {
    console.warn(`The following keys exist in TERRITORY_ZIPS_DICT but not in \
        TERRITORY_BRANCH_NAME_DICT: ${missingKeys.join(', ')}`);
    STOP_RUNNING();
}
