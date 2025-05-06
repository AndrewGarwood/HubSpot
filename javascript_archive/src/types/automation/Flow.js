/**
 * @file Flow.js
 * @module Flow
 * @export { Flow }
 */

// Referenced Type Imports:
/**
 * @import { ObjectTypeIdEnum } from '../HubSpotEnums.js';
 * @import { AutomationTypeEnum } from './Automation.js';
 * @typedef {import('./Action.js').Action} Action
 * @typedef {import('./Automation.js').EnrollmentCriteria} EnrollmentCriteria
 */


/**
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
 * @property {ObjectTypeIdEnum} objectTypeId
 * @export
 */

/** 
 * @param {string} id - string - The unique identifier for the flow.
 * @param {FlowObjectTypeEnum} type - {@link FlowObjectTypeEnum} - The type of the flow (e.g., CONTACT_FLOW, DEAL_FLOW).
 * @param {ObjectTypeIdEnum} objectTypeId - {@link ObjectTypeIdEnum} - The object type ID associated with the flow
 * @param {string} revisionId - string - The revision identifier for the flow.
 * @param {Array<Action>} actions - Array\<{@link Action}> - An array of actions associated with the flow.
 * @param {string} [nextAvailableActionId] - string - The ID of the next available action in the flow.
 * @param {boolean} [isEnabled] - boolean - Indicates whether the flow is enabled (default: false).
 * @param {AutomationTypeEnum} [flowType] - {@link AutomationTypeEnum} - The type of automation for the flow (default: null).
 * @param {string} [name] - string - The name of the flow (default: null).
 * @param {string} [description] - string - A description of the flow (default: null).
 * @param {Date | string} [createdAt] - Date | string - The creation date of the flow (default: null).
 * @param {Date | string} [updatedAt] - Date | string - The last updated date of the flow (default: null).
 * @param {string} [startActionId] - string - The ID of the starting action in the flow (default: null).
 * @param {EnrollmentCriteria} [enrollmentCriteria] - {@link EnrollmentCriteria} - The criteria for enrolling objects in the flow (default: null).
 * @param {Array<TimeWindow>} [timeWindows] - Array\<TimeWindow> - An array of time windows for the flow (default: empty array).
 * @param {Array<string>} [blockedDates] - Array\<string> - An array of blocked dates for the flow (default: empty array).
 * @param {Object.<string, any>} [customProperties] - Object\<string, any> - Custom properties associated with the flow (default: empty object).
 * @param {Array<string>} [suppressionListIds] - Array\<string> - An array of suppression list IDs for the flow (default: empty array).
 * @param {boolean} [canEnrollFromSalesforce] - boolean - Indicates whether the flow can enroll from Salesforce (default: false).
 * @returns {Flow} - .{@link Flow} Returns a Flow object with the specified properties.
*/
export function Flow(
    id,
    type,
    objectTypeId,
    revisionId,
    actions = [],
    nextAvailableActionId = null,
    isEnabled = false,
    flowType = null,
    name = null,
    description = null,
    createdAt = null,
    updatedAt = null,
    startActionId = null,
    enrollmentCriteria = null,
    timeWindows = [],
    blockedDates = [],
    customProperties = {},
    suppressionListIds = [],
    canEnrollFromSalesforce = false,
) {
    return {
        id: id,
        type: type,
        revisionId: revisionId,
        actions: actions,
        nextAvailableActionId: nextAvailableActionId,
        isEnabled: isEnabled,
        flowType: flowType,
        name: name,
        description: description,
        createdAt: createdAt,
        updatedAt: updatedAt,
        startActionId: startActionId,
        enrollmentCriteria: enrollmentCriteria,
        timeWindows: timeWindows,
        blockedDates: blockedDates,
        customProperties: customProperties,
        suppressionListIds: suppressionListIds,
        canEnrollFromSalesforce: canEnrollFromSalesforce,
        objectTypeId: objectTypeId
    }
}


/**
 * @enum {string} FlowObjectTypeEnum
 * @readonly
 * @property {string} CONTACT_FLOW
 * @property {string} DEAL_FLOW
 * @property {string} TICKET_FLOW
 */
export const FlowObjectTypeEnum = {
    CONTACT_FLOW: 'CONTACT_FLOW',
    DEAL_FLOW: 'DEAL_FLOW',
    TICKET_FLOW: 'TICKET_FLOW',
};
