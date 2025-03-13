/** 
 * @file hs_types.js
 * @import { PermissionLevelEnum, UserSetTypeEnum } from './hs_enums.js';
 * @import { AnalyticsObjectTypeEnum } from './analytics_enums.js';
 */


// HubSpotUser ----------------
/**
 * @export
 * @typedef {Object} HubSpotUser
 * @property {number} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName
 * @property {boolean} removed
 * @property {boolean} gdprDeleted
 * 
 */

// BusinessUnit ----------------
/**
 * @export
 * @typedef {Object} BusinessUnit
 * @property {number} hubId
 * @property {string} name
 * @property {boolean} allUsersHaveAccess
 * @property {number} id
 */

// PermissionSentence ----------------
/**
 * @export
 * @typedef {Object} PermissionSentence
 * @property {UserSetTypeEnum} userSetType
 * @property {number} userSetId
 * @property {number} dashboardId
 * @property {number} portalId
 * @property {number} objectId
 * @property {AnalyticsObjectTypeEnum} objectType
 * @property {PermissionLevelEnum} permissionLevel
 */
