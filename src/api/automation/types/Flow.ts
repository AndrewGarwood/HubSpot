/**
 * @file src/utils/automation/types/Flow.ts
 */
import { ObjectTypeIdEnum } from "../../../types/HubSpot";
import { AutomationTypeEnum, EnrollmentCriteria } from "./Automation";
import { Action } from "./Action";
/**
 * @interface Flow
 * @property {string} id - `string` - The unique identifier for the flow.
 * @property {FlowObjectTypeEnum} type - {@link FlowObjectTypeEnum} - The type of the flow (e.g., CONTACT_FLOW, DEAL_FLOW).
 * @property {ObjectTypeIdEnum} objectTypeId - {@link ObjectTypeIdEnum} - The object type ID associated with the flow
 * @property {string} revisionId - `string` - The revision identifier for the flow.
 * @property {Array<Action>} actions - `Array<`{@link Action}`>` - An array of actions associated with the flow.
 * @property {string} [nextAvailableActionId] - `string` - The ID of the next available action in the flow.
 * @property {boolean} [isEnabled] - `boolean` - Indicates whether the flow is enabled (default: false).
 * @property {AutomationTypeEnum} [flowType] - {@link AutomationTypeEnum} - The type of automation for the flow (default: null).
 * @property {string} [name] - `string` - The name of the flow (default: `null`).
 * @property {string} [description] - `string` - A description of the flow (default: `null`).
 * @property {Date | string} [createdAt] - {@link Date}` | string` - The creation date of the flow (default: null).
 * @property {Date | string} [updatedAt] - {@link Date}` | string` - The last updated date of the flow (default: null).
 * @property {string} [startActionId] - `string` - The ID of the starting action in the flow (default: null).
 * @property {EnrollmentCriteria} [enrollmentCriteria] - {@link EnrollmentCriteria} - The criteria for enrolling objects in the flow (default: null).
 * @property {Array<TimeWindow>} [timeWindows] - `Array<TimeWindow>` - An array of time windows for the flow (default: empty array).
 * @property {Array<string>} [blockedDates] - `Array<string>` - An array of blocked dates for the flow (default: empty array).
 * @property {Record<string, any>} [customProperties] - `Record<string, any>` - Custom properties associated with the flow (default: empty object).
 * @property {Array<string>} [suppressionListIds] - `Array<string>` - An array of suppression list IDs for the flow (default: empty array).
 * @property {boolean} [canEnrollFromSalesforce] - `boolean` - Indicates whether the flow can enroll from Salesforce (default: false).
 */
export interface Flow {
    id: string;
    type: FlowObjectTypeEnum;
    objectTypeId: ObjectTypeIdEnum;
    revisionId: string;
    actions: Array<Action>;
    nextAvailableActionId?: string;
    isEnabled?: boolean;
    flowType?: AutomationTypeEnum;
    name?: string;
    description?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    startActionId?: string;
    enrollmentCriteria?: EnrollmentCriteria;
    timeWindows?: Array<object>; //TODO implement TimeWindow
    blockedDates?: Array<string>;
    customProperties?: Record<string, any>;
    suppressionListIds?: Array<string>;
    canEnrollFromSalesforce?: boolean;
}

/**
 * @enum {string} FlowObjectTypeEnum
 * @readonly
 * @property {string} CONTACT_FLOW
 * @property {string} DEAL_FLOW
 * @property {string} TICKET_FLOW
 */
export enum FlowObjectTypeEnum {
    CONTACT_FLOW = 'CONTACT_FLOW',
    DEAL_FLOW = 'DEAL_FLOW',
    TICKET_FLOW = 'TICKET_FLOW',
}