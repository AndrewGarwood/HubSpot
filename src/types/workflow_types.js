/** 
 * @file workflow_types.js
 * @import { AutomationTypeEnum, ObjectTypeIdEnum, FlowObjectTypeEnum, 
 * ActionTypeEnum, ActionTypeIdEnum, FilterBranchTypeEnum, FilterBranchOperatorEnum, 
 * FilterTypeEnum, OperatorEnum, OperationTypeEnum, EdgeTypeEnum, 
 * EnrollmentCriteriaTypeEnum, TimePointReferenceTypeEnum, 
 * PublicIndexedTimePointTimeTypeEnum } from './workflow_enums.js';
 */

// FlowBranchUpdate --------------------------------
/**
 * @typedef {Object} FlowBranchUpdate
 * @property {string} targetBranchName
 * @property {string} targetProperty
 * @property {Array<string>} valuesToRemove
 * @property {Array<string>} valuesToAdd
 */

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


// Action --------------------------------
/**
 *- type: {@link ActionTypeEnum}
 *- actionTypeId: {@link ActionTypeIdEnum}
 *- listBranches: Array<{@link ListBranch}>
 * @typedef {Object} Action
 * @property {string} actionId
 * @property {ActionTypeEnum} type
 * @property {number} [actionTypeVersion]
 * @property {ActionTypeIdEnum} [actionTypeId]
 * @property {Object.<string, any>} [fields]
 * @property {Array<ListBranch>} [listBranches]
 * @property {string} [defaultBranchName]
 * @property {Connection} [defaultBranch]
 */

// ListBranch --------------------------------
/**
 *- filterBranch: {@link FilterBranch}
 *- connection: {@link Connection}
 * @typedef {Object} ListBranch
 * @property {FilterBranch} filterBranch
 * @property {string} branchName
 * @property {Connection} [connection]
 */

// FilterBranch --------------------------------
// I don't like the fact that a property of FilterBranch is an array of itself called 'filterBranches',
// but that's how HubSpot's API is structured.
/**
 *- filters: Array<{@link FlowFilter}>
 *- filterBranchType: {@link FilterBranchTypeEnum}
 *- filterBranchOperator: {@link FilterBranchOperatorEnum}
 * @typedef {Object} FilterBranch
 * @property {Array<FilterBranch>} filterBranches
 * @property {Array<FlowFilter>} filters
 * @property {FilterBranchTypeEnum} filterBranchType
 * @property {FilterBranchOperatorEnum} filterBranchOperator
 */

// FlowFilter --------------------------------
/**
 *- operation: {@link Operation}
 * @typedef {Object} FlowFilter
 * @property {string} property
 * @property {Operation} operation
 * @property {FilterTypeEnum} filterType
 */

// Operation --------------------------------
/**
 *- operationType: {@link OperationTypeEnum}
 * @typedef {Object} Operation
 * @property {OperatorEnum} operator
 * @property {boolean} includeObjectsWithNoValueSet
 * @property {Array<string>} [values]
 * @property {OperationTypeEnum} operationType
 */



// Connection --------------------------------
/**
 *- edgeType: {@link EdgeTypeEnum}
 * @typedef {Object} Connection
 * @property {EdgeTypeEnum} edgeType
 * @property {string} nextActionId
 */

// EnrollmentCriteria --------------------------------
/**
 * @typedef {Object} EnrollmentCriteria
 * @property {boolean} shouldReEnroll
 * @property {FilterBranch} listFilterBranch
 * @property {boolean} unEnrollObjectsNotMeetingCriteria
 * @property {Array<FilterBranch>} reEnrollmentTriggersFilterBranches
 * @property {EnrollmentCriteriaTypeEnum} type
 */


// TODO: implement these:
// and work on converting/adopting into typescript
// TimePoint --------------------------------
/**
 * node_modules\@hubspot\api-client\lib\codegen\crm\lists\models\PublicIndexedTimePoint.d.ts
 * node_modules\@hubspot\api-client\lib\codegen\crm\lists\models\PublicIndexedTimePoint.d.ts
 * node_modules\@hubspot\api-client\lib\codegen\crm\lists\models\PublicIndexedTimePoint.js
 * @typedef {Object} PublicIndexedTimePoint
 * @property {PublicIndexedTimePointTimeTypeEnum} timeType
 * @property {string} timezoneSource
 * @property {string} zoneId
 * @property {PublicIndexedTimePointIndexReference} indexReference
 * @property {PublicIndexOffset} offset
 */
// import { PublicIndexOffset } from '../models/PublicIndexOffset';
// import { PublicIndexedTimePointIndexReference } from '../models/PublicIndexedTimePointIndexReference';
// export declare class PublicIndexedTimePoint {
//     'offset'?: PublicIndexOffset;
//     'timezoneSource'?: string;
//     'indexReference': PublicIndexedTimePointIndexReference;
//     'timeType': PublicIndexedTimePointTimeTypeEnum;
//     'zoneId': string;
//     static readonly discriminator: string | undefined;
//     static readonly attributeTypeMap: Array<{
//         name: string;
//         baseName: string;
//         type: string;
//         format: string;
//     }>;
//     static getAttributeTypeMap(): {
//         name: string;
//         baseName: string;
//         type: string;
//         format: string;
//     }[];
//     constructor();
// }
// export declare enum PublicIndexedTimePointTimeTypeEnum {
//     Indexed = "INDEXED"
// }

// excerpt from getFlowById()'s return: "enrollmentCriteria": {
//         "shouldReEnroll": false,
//         "listFilterBranch": {
//             "filterBranches": [
//                 {
//                     "filterBranches": [],
//                     "filters": [
//                         {
//                             "property": "BOOLEAN_PROPERTY_EXAMPLE",
//                             "operation": {
//                                 "operator": "IS_ANY_OF",
//                                 "includeObjectsWithNoValueSet": false,
//                                 "values": [
//                                     "true"
//                                 ],
//                                 "operationType": "ENUMERATION"
//                             },
//                             "filterType": "PROPERTY"
//                         },
//                         {
//                             "property": "lifecyclestage",
//                             "operation": {
//                                 "operator": "IS_NONE_OF",
//                                 "includeObjectsWithNoValueSet": false,
//                                 "values": [
//                                     "STAGE_ID_EXAMPLE"
//                                 ],
//                                 "operationType": "ENUMERATION"
//                             },
//                             "filterType": "PROPERTY"
//                         }
//                     ],
//                     "filterBranchType": "AND",
//                     "filterBranchOperator": "AND"
//                 },
//                 {
//                     "filterBranches": [],
//                     "filters": [
//                         {
//                             "property": "state",
//                             "operation": {
//                                 "operator": "IS_BETWEEN",
//                                 "includeObjectsWithNoValueSet": false,
//                                 "lowerBoundEndpointBehavior": "INCLUSIVE",
//                                 "upperBoundEndpointBehavior": "INCLUSIVE",
//                                 "propertyParser": "UPDATED_AT",
//                                 "lowerBoundTimePoint": {
//                                     "timeType": "INDEXED",
//                                     "timezoneSource": "CUSTOM",
//                                     "zoneId": "America/Los_Angeles",
//                                     "indexReference": {
//                                         "referenceType": "TODAY"
//                                     },
//                                     "offset": {
//                                         "days": -1
//                                     }
//                                 },
//                                 "upperBoundTimePoint": {
//                                     "timeType": "INDEXED",
//                                     "timezoneSource": "CUSTOM",
//                                     "zoneId": "America/Los_Angeles",
//                                     "indexReference": {
//                                         "referenceType": "NOW"
//                                     }
//                                 },
//                                 "type": "TIME_RANGED",
//                                 "operationType": "TIME_RANGED"
//                             },
//                             "filterType": "PROPERTY"
//                         },
//                         {
//                             "property": "lifecyclestage",
//                             "operation": {
//                                 "operator": "IS_NONE_OF",
//                                 "includeObjectsWithNoValueSet": false,
//                                 "values": [
//                                     "STAGE_ID_EXAMPLE"
//                                 ],
//                                 "operationType": "ENUMERATION"
//                             },
//                             "filterType": "PROPERTY"
//                         }
//                     ],
//                     "filterBranchType": "AND",
//                     "filterBranchOperator": "AND"
//                 }
//             ],
//             "filters": [],
//             "filterBranchType": "OR",
//             "filterBranchOperator": "OR"
//         },
//         "unEnrollObjectsNotMeetingCriteria": false,
//         "reEnrollmentTriggersFilterBranches": [],
//         "type": "LIST_BASED"
//     },