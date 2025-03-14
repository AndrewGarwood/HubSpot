/**
 * @file Flow.js
 * @module Flow
 * @export { Flow }
 */

// Referenced Type Imports:
/**
 * @import { AutomationTypeEnum } from './AutomationEnums.js';
 * @import { FlowObjectTypeEnum } from './FlowEnums.js';
 * @import { ObjectTypeIdEnum } from '../hs_enums.js';
 * @typedef {import('./Action.js').Action} Action
 * @typedef {import('./Automation.js').EnrollmentCriteria} EnrollmentCriteria
 */

// Flow --------------------------------
/**
 *- type: {@link FlowObjectTypeEnum}
 *- objectTypeId: {@link ObjectTypeIdEnum} 
 *- actions: Array\<{@link Action}> 
 * 
 * @typedef {Object} Flow
 * 
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
 * @property {ObjectTypeIdEnum} [objectTypeId]
 * @export
 */
