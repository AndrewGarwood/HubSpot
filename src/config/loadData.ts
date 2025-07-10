/**
 * @TODO put loading of territory data and SKU data into their own files.
 * @file src/config/loadData.ts
 * @deprecated This file has been replaced by dataLoader.ts to fix circular dependency issues
 * These exports are kept for backward compatibility but will be removed in the future
 */

// Re-export everything from the new dataLoader for backward compatibility
export * from './dataLoader';

// For any code that still uses the old direct exports, provide compatibility functions
import { getTerritoryData, getRegexConstants, getCategoryToSkuDict } from './dataLoader';

/** @deprecated Use getTerritoryData().filePath instead */
export const territoryDataFileName = () => getTerritoryData().filePath;

/** @deprecated Use getTerritoryData().REGION_ZIP_PROPS instead */
export const REGION_ZIP_PROPS = () => getTerritoryData().REGION_ZIP_PROPS;

/** @deprecated Use getTerritoryData().TERRITORY_ZIP_PROPS instead */
export const TERRITORY_ZIP_PROPS = () => getTerritoryData().TERRITORY_ZIP_PROPS;

/** @deprecated Use getTerritoryData().EAST_TERRITORY_ZIPS_DICT instead */
export const EAST_TERRITORY_ZIPS_DICT = () => getTerritoryData().EAST_TERRITORY_ZIPS_DICT;

/** @deprecated Use getTerritoryData().EAST_ZIPS instead */
export const EAST_ZIPS = () => getTerritoryData().EAST_ZIPS;

/** @deprecated Use getTerritoryData().WEST_TERRITORY_ZIPS_DICT instead */
export const WEST_TERRITORY_ZIPS_DICT = () => getTerritoryData().WEST_TERRITORY_ZIPS_DICT;

/** @deprecated Use getTerritoryData().WEST_ZIPS instead */
export const WEST_ZIPS = () => getTerritoryData().WEST_ZIPS;

/** @deprecated Use getTerritoryData().ALL_TERRITORIES_ZIP_DICT instead */
export const ALL_TERRITORIES_ZIP_DICT = () => getTerritoryData().ALL_TERRITORIES_ZIP_DICT;

/** @deprecated Use getTerritoryData().ALL_REGIONS_ZIP_DICT instead */
export const ALL_REGIONS_ZIP_DICT = () => getTerritoryData().ALL_REGIONS_ZIP_DICT;

/** @deprecated Use getTerritoryData().TERRITORY_BRANCH_NAME_DICT instead */
export const TERRITORY_BRANCH_NAME_DICT = () => getTerritoryData().TERRITORY_BRANCH_NAME_DICT;

/** @deprecated Use getCategoryToSkuDict() instead */
export const CATEGORY_TO_SKU_DICT = () => getCategoryToSkuDict();