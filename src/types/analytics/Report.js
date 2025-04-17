/** 
 * @file Report.js
 * @module Report
 * @export { Report, ReportChartTypeEnum, ReportDefinition, ReportDefinitionTypeEnum, ReportSourceEnum, ReportHydrationOptionEnum, ReportDashboardInfo, ReportDefinitionVisualTypeEnum }
 */

/**
 * @typedef {import('./Table.js').Table} Table
 * @typedef {import('./Column.js').Column} Column
 * @typedef {import('../HubSpot.js').HubSpotUser} HubSpotUser
 * @typedef {import('../HubSpot.js').BusinessUnit} BusinessUnit
 * @typedef {import('../HubSpot.js').PermissionSentence} PermissionSentence
 * @typedef {import('../HubSpot.js').AccessClassificationEnum} AccessClassificationEnum
 * @typedef {import('../HubSpot.js').ResolveTypeEnum} ResolveTypeEnum
 * @typedef {import('../HubSpot.js').PermissionLevelEnum} PermissionLevelEnum
 */

// Report ----------------
/**
 *- charType: {@link ReportChartTypeEnum}
 *- resolveType: {@link ResolveTypeEnum}
 *- insightParams: {@link InsightParams}
 *- source: {@link ReportSourceEnum} 
 *- permissionLevel: {@link PermissionLevelEnum}
 *- hydrationOptions: Array<{@link ReportHydrationOptionEnum}>
 *- businessUnit: {@link BusinessUnit}
 *- reportDashboardInfo: Array<{@link ReportDashboardInfo}>
 *- createdByUser,reportOwnerUser,updatedByUser,lastViewedUser: {@link HubSpotUser}
 * @typedef {Object} Report
 * @property {Object} displayParams
 * @property {Array<any>} editors
 * @property {ReportChartTypeEnum} chartType
 * @property {ResolveTypeEnum} resolveType
 * @property {InsightParams} insightParams
 * @property {ReportSourceEnum} source
 * @property {string} name
 * @property {PermissionLevelEnum} permissionLevel
 * @property {AccessClassificationEnum} accessClassification
 * @property {boolean} [legacyReport]
 * @property {number} reportOwnerId
 * @property {number} businessUnitId
 * @property {boolean} customized
 * @property {string} [description]
 * @property {boolean} [aiGeneratedDescription]
 * @property {boolean} active
 * @property {number | Date} createdAt
 * @property {number} createdBy
 * @property {number | Date} [updatedAt]
 * @property {number} [updatedBy]
 * @property {number | Date} [systemUpdatedAt]
 * @property {number | Date} [lastViewedAt]
 * @property {number} [lastViewedBy]
 * @property {boolean} [sunset]
 * @property {Array<ReportHydrationOptionEnum>} hydrationOptions
 * @property {BusinessUnit} businessUnit
 * @property {Array<ReportDashboardInfo>} reportDashboardInfo
 * @property {HubSpotUser} createdByUser
 * @property {HubSpotUser} reportOwnerUser
 * @property {HubSpotUser} updatedByUser
 * @property {HubSpotUser} lastViewUser
 * @property {boolean} favorite
 * @property {PermissionLevelEnum} userReportPermissionLevel
 * @property {PermissionSentence} permissionSentence
 * @property {Object} permissionConfig
 * @property {number} portalId
 * @property {ReportDefinition} reportDefinition
 * @property {number} id
 * @property {boolean} countsAsReport
 * @property {boolean} flpRestricted
 * @property {string} createdByName
 * @property {string} reportOwnerName
 * @property {number} dashboardId
 * @property {string} dashboardName
 * @property {PermissionLevelEnum} userDashboardPermissionLevel
 * @property {number} ownerId
 * @export
 */

// ReportDashboardInfo ----------------
/**
 *- id: string =  dashboardId 
 * @typedef {Object} ReportDashboardInfo
 * @property {number} ownerId
 * @property {number} id
 * @property {string} name
 * @property {PermissionLevelEnum} userPermissionLevel
 * @export
 */

 // ReportDefinition ----------------
/**
 * @typedef {Object} ReportDefinition
 * @property {Table} table
 * @property {Set<Column>} columns
 * @property {Array<Sort>} sorts
 * @property {Array<Limit>} limitsForQuery
 * @property {number | Date} maxEventsIngestionTimestamp
 * @property {ReportFiltering} filtering
 * @property {ReportAggregatedFiltering} aggregatedFiltering
 * @property {Array<string>} flags
 * @property {boolean} useWideJoin
 * @property {ReportDefinitionTypeEnum} type
 * @property {ReportVisual} visual
 * @property {Array<ReportStagedField>} stagedFields
 * @property {Array<ReportStagedColumn>} stagedColumns
 * @property {Array<ReportStagedEncoding>} stagedEncodings
 * @property {Array<ReportStagedFilter>} [stagedFilters]
 * @export
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