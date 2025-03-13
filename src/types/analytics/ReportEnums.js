/**
 * @file ReportEnums.js
 */

/**
 * @enum {string} ReportChartTypeEnum
 * @readonly
 * @export
 *- CUSTOM
 */
export const ReportChartTypeEnum = {
    CUSTOM: 'CUSTOM',
};


/**
 * @enum {string} ReportDefinitionTypeEnum
 * @readonly
 * @export
 *- RELATIONAL
 */
export const ReportDefinitionTypeEnum = {
    RELATIONAL: 'RELATIONAL',
};

/**
 * @enum {string} ReportDefinitionVisualTypeEnum
 * @readonly
 * @export
 *- PIVOT_TABLE
 *- VERTICAL_BAR
 *- HORIZONTAL_BAR
 */
export const ReportDefinitionVisualTypeEnum = {
    PIVOT_TABLE: 'PIVOT_TABLE',
    VERTICAL_BAR: 'VERTICAL_BAR',
    HORIZONTAL_BAR: 'HORIZONTAL_BAR',
};

/**
 * @enum {string} ReportSourceEnum
 * @readonly
 * @export
 *- REPORTING
 */
export const ReportSourceEnum = {
    REPORTING: 'REPORTING',
};

/**
 * @enum {string} ReportHydrationOptionEnum
 * @readonly
 * @export
 *- USER
 *- BUSINESS_UNIT
 *- DASHBOARD_INFO
 *- FAVORITE
 *- USER_PERMISSION_LEVEL
 *- FLP_VIEW
 */
export const ReportHydrationOptionEnum = {
    USER: 'USER',
    BUSINESS_UNIT: 'BUSINESS_UNIT',
    DASHBOARD_INFO: 'DASHBOARD_INFO',
    FAVORITE: 'FAVORITE',
    USER_PERMISSION_LEVEL: 'USER_PERMISSION_LEVEL',
    FLP_VIEW: 'FLP_VIEW',
};