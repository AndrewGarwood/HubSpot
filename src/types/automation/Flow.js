/**
 * @file Flow.js
 * @module Flow
 * @import { Action } from './Action.js';
 * @import { FlowObjectTypeEnum 
 * } from './FlowEnums.js';
 * @import { ObjectTypeIdEnum 
 * } from '../hs_enums.js';
*/

// Flow --------------------------------
/**
 *- type: {@link FlowObjectTypeEnum}
 *- objectTypeId: {@link ObjectTypeIdEnum} 
 *- actions: Array<{@link Action}> 
 * @typedef {Object} Flow
 * @property {string} id
 * @property {FlowObjectTypeEnum} type
 * @property {string} revisionId
 * @property {Array<Action>} actions
 * @property {string} [nextAvailableActionId]
 * @property {boolean} [isEnabled]
 * @property {AutomationTypeEnum} [flowType]
 * @property {string} [name]
 * @property {string} [description]
 * @property {Date | string} [createdAt]
 * @property {Date | string} [updatedAt]
 * @property {string} [startActionId]
 * @property {EnrollmentCriteria} [enrollmentCriteria]
 * @property {Array<TimeWindow>} [timeWindows]
 * @property {Array<string>} [blockedDates]
 * @property {Object.<string, any>} [customProperties]
 * @property {Array<string>} [suppressionListIds]
 * @property {boolean} [canEnrollFromSalesforce]
 * @property {ObjectTypeIdEnum | string} [objectTypeId]
 */
