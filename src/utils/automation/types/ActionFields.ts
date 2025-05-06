/**
 * @file src/utils/automation/types/ActionFields.ts
 */

import { ObjectTypeIdEnum, PublicSubscriptionChannelEnum, PublicSubscriptionOptStateEnum, PublicSubscriptionStatusLegalBasisEnum } from "../../../types/HubSpot";
import { ActionTypeIdEnum } from "./Action";

/**
 * properties of ActionFields depend on Action's {@link ActionTypeIdEnum}
 * @interface ActionFields
 * `{ [k: string]: any }`
 * @see
 * {@link EditRecordFields}
 */
export interface ActionFields {
    [k: string]: any;
}

// EditRecordValue --------------------------------
/**
 * @extends ActionFields {@link ActionFields}
 * 
 * @interface EditRecordFields
 * @property {string} [property_name]
 * @property {EditRecordFieldsValue} [value] see {@link EditRecordFieldsValue}
 */
export interface EditRecordFields extends ActionFields {
    property_name?: string;
    value?: EditRecordFieldsValue;
}

/**
 * @interface EditRecordFieldsValue
 *  - if type is STATIC_VALUE, this is the value to be set.
 * @property {string} [staticValue]
 * @property {ActionFieldsValueTypeEnum} type - see {@link ActionFieldsValueTypeEnum}
 * */
export interface EditRecordFieldsValue {
    staticValue?: string;
    type: ActionFieldsValueTypeEnum;
}
/**
 * @enum {string} ActionFieldsValueTypeEnum
 * @readonly
 * @property {string} STATIC_VALUE
 */
export enum ActionFieldsValueTypeEnum {
    STATIC_VALUE = 'STATIC_VALUE',
}

// CreateAssociationFields --------------------------------
/**
 * @extends ActionFields {@link ActionFields}
 * 
 * @interface CreateAssociationFields
 * @property {ObjectTypeIdEnum} [fromObjectType] see {@link ObjectTypeIdEnum}
 * @property {ObjectTypeIdEnum} [toObjectType] see {@link ObjectTypeIdEnum}
 * @property {boolean} [createAssociationOnly]
 * @property {string} [matchBy]
 * @property {string} [enrolledObjectPropertyNameToMatch]
 * @property {string} [associatedObjectPropertyNameToMatch]
 */
export interface CreateAssociationFields extends ActionFields {
    fromObjectType?: ObjectTypeIdEnum;
    toObjectType?: ObjectTypeIdEnum;
    createAssociationOnly?: boolean;
    matchBy?: string;
    enrolledObjectPropertyNameToMatch?: string;
    associatedObjectPropertyNameToMatch?: string;
}

// TimeDelayFields --------------------------------
/** 
 * @extends ActionFields {@link ActionFields}
 * 
 * @interface TimeDelayFields
 * @property {number} [delta]
 * @property {string} [time_unit]
 */ 
export interface TimeDelayFields extends ActionFields {
    delta?: number;
    time_unit?: string;
}

// CreateNoteFields --------------------------------
/**
 * @extends ActionFields {@link ActionFields}
 * 
 * @interface CreateNoteFields
 * @property {string} [note_body]
 * @property {boolean} [pin_note]
 */ 
export interface CreateNoteFields extends ActionFields {
    note_body?: string;
    pin_note?: boolean;
}

// RotateRecordToOwnerFields --------------------------------
/**
 * @extends ActionFields 
 * 
 * @interface RotateRecordToOwnerFields
 * @property {Array<string>} [user_ids] `Array<string>`
 * @property {string} [target_property]
 * @property {boolean} [overwrite_current_owner]
 */ 
export interface RotateRecordToOwnerFields extends ActionFields {
    user_ids?: Array<string>;
    target_property?: string;
    overwrite_current_owner?: boolean;
}

// SendAutomatedEmailFields --------------------------------
/** 
 * @extends ActionFields 
 * 
 * @interface SendAutomatedEmailFields
 * @property {PublicSubscriptionChannelEnum} [channel] see {@link PublicSubscriptionChannelEnum}
 * @property {PublicSubscriptionOptStateEnum} [optState] see {@link PublicSubscriptionOptStateEnum}
 * @property {string} [subscriptionId]
 * @property {PublicSubscriptionStatusLegalBasisEnum} [legalBasis] see {@link PublicSubscriptionStatusLegalBasisEnum}
 * @property {string} [legalBasisExplanation]
 */
export interface SendAutomatedEmailFields extends ActionFields {
    channel?: PublicSubscriptionChannelEnum;
    optState?: PublicSubscriptionOptStateEnum;
    subscriptionId?: string;
    legalBasis?: PublicSubscriptionStatusLegalBasisEnum;
    legalBasisExplanation?: string;
}
