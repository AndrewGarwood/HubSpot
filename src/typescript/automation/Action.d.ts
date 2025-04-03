/**
 * @file Action.d.ts
 * @module Action
 */

import { ListBranch } from './ListBranch';
import { Connection } from './Automation';
import { ObjectTypeIdEnum } from '../HubSpot';
/**
 * @typedefn Action
 * @property {string} actionId
 * @property {ActionTypeEnum} type {@link ActionTypeEnum}
 * @property {number} [actionTypeVersion]
 * @property {ActionTypeIdEnum} [actionTypeId] {@link ActionTypeIdEnum}
 * @property {ActionFields} [fields] {@link ActionFields}
 * @property {Array\<ListBranch>} [listBranches] {@link ListBranch}
 * @property {string} [defaultBranchName]
 * @property {Connection} [defaultBranch] {@link Connection}
 */
export type Action = {
    actionId: string;
    type: ActionTypeEnum;
    actionTypeVersion?: number;
    actionTypeId?: ActionTypeIdEnum;
    fields?: ActionFields;
    listBranches?: Array<ListBranch>;
    defaultBranchName?: string;
    defaultBranch?: Connection;
};


/**
 * properties of ActionFields depend on Action's {@link ActionTypeIdEnum}
 * @interface ActionFields
 */
export interface ActionFields {
    [key: string]: any;
}

// EditRecordValue --------------------------------
/**
 * @typedefn EditRecordFields @extends ActionFields
 * @property {string} [property_name]
 * @property {EditRecordFieldsValue} [value] {@link EditRecordFieldsValue}
 */
export type EditRecordFields = {
    property_name?: string;
    value?: EditRecordFieldsValue;
}


/**
 * @typedefn EditRecordFieldsValue
 *  - if type is STATIC_VALUE, this is the value to be set.
 * @property {string} [staticValue]
 * @property {ActionFieldsValueTypeEnum} type {@link ActionFieldsValueTypeEnum}
 */
export type EditRecordFieldsValue = {
    staticValue?: string;
    type: ActionFieldsValueTypeEnum;
}

/**
 * @enum {string} ActionFieldsValueTypeEnum
 * @readonly
 * @property {string} STATIC_VALUE
 */
export declare enum ActionFieldsValueTypeEnum {
    STATIC_VALUE = 'STATIC_VALUE'
}

// CreateAssociationFields --------------------------------
/**
 * @typedefn CreateAssociationFields @extends ActionFields
 * @property {ObjectTypeIdEnum} [fromObjectType]
 * @property {ObjectTypeIdEnum} [toObjectType]
 * @property {boolean} [createAssociationOnly]
 * @property {AssociationMatchByEnum} [matchBy]
 * @property {string} [enrolledObjectPropertyNameToMatch]
 * @property {string} [associatedObjectPropertyNameToMatch]
 */
export type CreateAssociationFields = {
    fromObjectType?: ObjectTypeIdEnum;
    toObjectType?: ObjectTypeIdEnum;
    createAssociationOnly?: boolean;
    matchBy?: AssociationMatchByEnum;
    enrolledObjectPropertyNameToMatch?: string;
    associatedObjectPropertyNameToMatch?: string;
}

// TimeDelayFields --------------------------------
/** 
 * @extends ActionFields
 * 
 * @typedefn TimeDelayFields
 * @property {number} [delta]
 * @property {string} [time_unit]
 */ 
export type TimeDelayFields = {
    delta?: number;
    time_unit?: string;
}

// CreateNoteFields --------------------------------
/**
 * @extends ActionFields 
 * 
 * @typedefn CreateNoteFields
 * @property {string} [note_body]
 * @property {boolean} [pin_note]
 */ 
export type CreateNoteFields = {
    note_body?: string;
    pin_note?: boolean;
}

// RotateRecordToOwnerFields --------------------------------
/**
 * @extends ActionFields 
 * 
 * @typedefn RotateRecordToOwnerFields
 * @property {Array\<string>} [user_ids]
 * @property {string} [target_property]
 * @property {boolean} [overwrite_current_owner]
 */ 
export type RotateRecordToOwnerFields = {
    user_ids?: Array<string>;
    target_property?: string;
    overwrite_current_owner?: boolean;
}

// SendAutomatedEmailFields --------------------------------
/** 
 * @extends ActionFields 
 * 
 * @typedefn SendAutomatedEmailFields
 * @property {PublicSubscriptionChannelEnum} [channel]
 * @property {PublicSubscriptionOptStateEnum} [optState]
 * @property {string} [subscriptionId]
 * @property {PublicSubscriptionStatusLegalBasisEnum} [legalBasis]
 * @property {string} [legalBasisExplanation]
 */
export type SendAutomatedEmailFields = {
    channel?: PublicSubscriptionChannelEnum;
    optState?: PublicSubscriptionOptStateEnum;
    subscriptionId?: string;
    legalBasis?: PublicSubscriptionStatusLegalBasisEnum;
    legalBasisExplanation?: string;
}

/**
 * @enum {string} PublicSubscriptionOptStateEnum
 * @readonly
 * @property {string} OPT_IN
 * @property {string} OPT_OUT
 */
export declare enum PublicSubscriptionOptStateEnum {
    OPT_IN = "OPT_IN",
    OPT_OUT = "OPT_OUT",
    SUBSCRIBED = "SUBSCRIBED",
    UNSUBSCRIBED = "UNSUBSCRIBED",
    UNKNOWN = "UNKNOWN"
}

/**
 * @enum {string} ActionTypeEnum
 * @readonly
 * @property {string} LIST_BRANCH
 * @property {string} SINGLE_CONNECTION
 */
export declare enum ActionTypeEnum {
    LIST_BRANCH= 'LIST_BRANCH',
    SINGLE_CONNECTION= 'SINGLE_CONNECTION',
}

/**
 * @enum {string} ActionTypeIdEnum
 * @readonly
 * @property {string} DELAY_UNTIL_DATE - 0-35 - Delay until a preconfigured calendar date or date property of the enrolled record.
 * @property {string} DELAY_TIME - 0-1 - Delay for a preconfigured amount of time (e.g., 3 hours, 5 days, etc.), until a specific day (e.g., Tuesday), or time of day (12:00 AM EST).
 * @property {string} ADD_TO_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 * @property {string} REMOVE_FROM_LIST - 0-13 - Add or remove an enrolled contact to/from a static list.
 * @property {string} SEND_AUTOMATED_EMAIL - 0-4 - {@link SendAutomatedEmailFields} Send an automated marketing email to the enrolled record.
 * @property {string} SEND_EMAIL_NOTIFICATION - 0-8 - Send an internal email notification to a user or team in your account.
 * @property {string} SEND_IN_APP_NOTIFICATION - 0-9 - Trigger an in-app notification to a user or team in your account.
 * @property {string} SET_PROPERTY - 0-5 - {@link EditRecordFields} Set a property on an enrolled object.
 * @property {string} CREATE_TASK - 0-3 - Create a new task.
 * @property {string} CREATE_RECORD - 0-14 - Create a new record (contact, company, deal, ticket, or lead).
 */
export declare enum ActionTypeIdEnum {
    DELAY_UNTIL_DATE= '0-35',
    DELAY_TIME= '0-1',
    ADD_TO_LIST= '0-13',
    REMOVE_FROM_LIST= '0-13',
    SEND_AUTOMATED_EMAIL= '0-4',
    SEND_EMAIL_NOTIFICATION= '0-8',
    SEND_IN_APP_NOTIFICATION= '0-9',
    SET_PROPERTY= '0-5',
    CREATE_TASK= '0-3',
    CREATE_RECORD= '0-14',
}
