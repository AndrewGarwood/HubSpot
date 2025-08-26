/**
 * @file src/api/crm/objects/types/Requests.ts
 * @reference https://developers.hubspot.com/docs/guides/api/crm/using-object-apis#upsert-records
 */
import { RowSourceMetaData } from "typeshi:utils/io";
import { 
    AssociationCategoryEnum, 
    ContactAssociationTypeIdEnum, 
    DealAssociationTypeIdEnum, 
    CompanyAssociationTypeIdEnum, 
} from ".";



/**
 * @interface **`UpsertObjectRequest`**
 * @property **`inputs`** {@link CrmObjectOptions}`[]`
 * = `{ id: string, idProperty: string,`
 * `properties?: { [propId: string]: FieldValue },`
 * `associations?:`{@link CrmObjectAssociationOptions}`[] }[]`
 */
export interface UpsertObjectRequest {
    inputs: CrmObjectOptions[]
}

/**
 * @interface **`CrmObjectOptions`**
 * @property **`id`** `string`
 * @property **`idProperty`** `string` - e.g. for contacts, `idProperty = 'email'`
 * @property **`properties`** `{ [propId: string]: any }`
 * @property **`associations`** {@link CrmObjectAssociationOptions}`[]`
 */
export interface CrmObjectOptions {
    /** idValue */
    id: string;
    /** e.g. for contacts, `idProperty = 'email'` */
    idProperty: string;
    properties?: { [propId: string]: FieldValue };
    associations: CrmObjectAssociationOptions[];
    meta?: {
        /** 
         * info about what generated this RecordOptions object
         * e.g. {@link RowSourceMetaData} 
         * */
        dataSource: RowSourceMetaData | any;
        sourceType: string;
        [key: string]: any
    }
}
export type FieldValue = Date | number | number[] | string | string[] | boolean | null;
// export type PropertyDictionary = {
//     [propId: string]: FieldValue
// }


// I don't think these definitions for CrmObjectAssociationOptions and CrmObjectAssociation
// are compatible with the Assocations API i.e. the object api requires a different shape

/**
 * @interface **`CrmObjectAssociationOptions`**
 * @property **`to`** `{ id: number }` - The record Id to associate with.
 * @property **`types`** {@link CrmObjectAssociationEntry}`[]`
 */
export interface CrmObjectAssociationOptions {
    to: {
        /** record Id */ 
        id: number 
    },
    types: CrmObjectAssociationEntry[]
}

/**
 * @interface **`CrmObjectAssociation`**
 * @property **`category`** {@link AssociationCategoryEnum}
 * @property **`typeId`** {@link ContactAssociationTypeIdEnum} 
 * | {@link DealAssociationTypeIdEnum} | {@link CompanyAssociationTypeIdEnum}
 * @property **`label`** `string` optional
 */
export interface CrmObjectAssociationEntry {
    category: AssociationCategoryEnum;
    typeId: ContactAssociationTypeIdEnum | DealAssociationTypeIdEnum | CompanyAssociationTypeIdEnum;
}