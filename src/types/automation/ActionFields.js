/**
 * @file ActionFields.js
 * @module ActionFields
 * @export { ActionFields, ActionFieldsValue }
 */
/**
 * @typedef {import('./Action.js').Action} Action
 * @import { PublicSubscriptionChannelEnum, PublicSubscriptionStatusLegalBasisEnum } from '../hs_enums.js'
 */

import { ObjectTypeIdEnum } from '../hs_enums.js';
import { ActionTypeIdEnum } from './Action.js';

/**
 * properties of ActionFields depend on Action's {@link ActionTypeIdEnum}
 * @typedef {Object} ActionFields
 */

// EditRecordValue --------------------------------
/**
 * @extends ActionFields
 * 
 * @typedef {Object} EditRecordFields
 * @property {string} [property_name]
 * @property {EditRecordFieldsValue} [value]
 */
/**
 * @typedef {Object} EditRecordFieldsValue
 *  - if type is STATIC_VALUE, this is the value to be set.
 * @property {string} [staticValue]
 * @property {ActionFieldsValueTypeEnum} type
/**
 * @enum {string} ActionFieldsValueTypeEnum
 * @readonly
 * - STATIC_VALUE
 */
export const ActionFieldsValueTypeEnum = {
    STATIC_VALUE: 'STATIC_VALUE'
};

// CreateAssociationFields --------------------------------
/**
 * @extends ActionFields
 * 
 * @typedef {Object} CreateAssociationFields
 * @property {ObjectTypeIdEnum} [fromObjectType]
 * @property {ObjectTypeIdEnum} [toObjectType]
 * @property {boolean} [createAssociationOnly]
 * @property {AssociationMatchByEnum} [matchBy]
 * @property {string} [enrolledObjectPropertyNameToMatch]
 * @property {string} [associatedObjectPropertyNameToMatch]
 */

// TimeDelayFields --------------------------------
/** 
 * @extends ActionFields
 * 
 * @typedef {Object} TimeDelayFields
 * @property {number} [delta]
 * @property {string} [time_unit]
 */ 

// CreateNoteFields --------------------------------
/**
 * @extends ActionFields 
 * 
 * @typedef {Object} CreateNoteFields
 * @property {string} [note_body]
 * @property {boolean} [pin_note]
 */ 

// RotateRecordToOwnerFields --------------------------------
/**
 * @extends ActionFields 
 * 
 * @typedef {Object} RotateRecordToOwnerFields
 * @property {Array<string>} [user_ids]
 * @property {string} [target_property]
 * @property {boolean} [overwrite_current_owner]
 */ 

// SendAutomatedEmailFields --------------------------------
/** 
 * @extends ActionFields 
 * 
 * @typedef {Object} SendAutomatedEmailFields
 * @property {PublicSubscriptionChannelEnum} [channel]
 * @property {PublicSubscriptionOptStateEnum} [optState]
 * @property {string} [subscriptionId]
 * @property {PublicSubscriptionStatusLegalBasisEnum} [legalBasis]
 * @property {string} [legalBasisExplanation]
 */

/**
 * @enum {string} PublicSubscriptionOptStateEnum
 * @readonly
 * - OPT_IN
 * - OPT_OUT
 */
export const PublicSubscriptionOptStateEnum = {
    OPT_IN: "OPT_IN",
    OPT_OUT: "OPT_OUT",
    SUBSCRIBED: "SUBSCRIBED",
    UNSUBSCRIBED: "UNSUBSCRIBED",
    UNKNOWN: "UNKNOWN"
};




