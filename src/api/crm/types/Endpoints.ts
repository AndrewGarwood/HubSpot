/**
 * @file src/api/crm/objects/types/CrmObjectEndpoint.ts
 * @reference https://developers.hubspot.com/docs/guides/api/crm/using-object-apis#upsert-records
 * @excerpt `The object APIs enable you to create and manage records 
 * and activities within HubSpot. The object APIs have the same basic 
 * functionality for all supported objects, which allows you to substitute 
 * the objectTypeId of an object in the endpoints. For example, to create 
 * contacts, you'd make a POST request to crm/v3/objects/0-1 and to create 
 * courses, the request would be to crm/v3/objects/0-410.`
 */
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, CRM_OBJECTS_URL } from "../../../config";
import { CrmObjectTypeIdEnum, ObjectTypeIdEnumReverseMap } from ".";
import * as validate from "../../../utils/argumentValidation";


/**
 * @class **`CrmObjectEndpoint`**
 * @property **`typeId`** {@link CrmObjectTypeIdEnum}
 * @property **`type`** `string` - e.g. `contact`, `company`, `deal`, etc.
 * @property **`batchUpsert`** `string` - URL for batch upsert endpoint
 */
export class CrmObjectEndpoint {
    private typeId: CrmObjectTypeIdEnum;
    private type: string;
    /**
     * - To create a record for an object, make a `POST` request to 
     * `crm/v3/objects/{objectTypeId}`
     */
    // private readonly create: string;
    /**
     * - To create multiple records, make a `POST` request to 
     * `/crm/v3/objects/{objectTypeId}/batch/create`
     */
    // private readonly batchCreate: string;
    // private readonly batchUpsert: string;
    /**
     * - To update an individual record, make a `PATCH` request to 
     * `/crm/v3/objects/{objectTypeId}/{recordId}`
     */
    // private readonly update: string;
    /**
     * - To update multiple records, make a `POST` request to 
     * `/crm/v3/objects/{objectTypeId}/batch/update`.
     */
    // private readonly batchUpdate: string;

    /**
     * - To retrieve an individual record, make a `GET` request to 
     * `/crm/v3/objects/{objectTypeId}/{recordId}`
     * */
    // private readonly read: string;            
    /** 
     * - To request a list of all records for an object, make a `GET` request to 
     * `/crm/v3/objects/{objectTypeId}`
     * */
    // private readonly readAll: string;     
    /**
     * - To retrieve a batch of specific records by record ID or 
     * a custom unique identifier property, make a `POST` request to 
     * `/crm/v3/objects/{objectTypeId}/batch/read` and include the 
     * id values of the records in the request body. 
     * - The batch endpoint cannot retrieve associations
     *  */             
    // private readonly batchRead: string;         
    /** 
     * - To `delete` an individual record by its record ID, make a `DELETE` request to 
     * `/crm/v3/objects/{objectTypeId}/{recordId}`
     * */
    // private readonly archive: string;
    /**
     * - To `delete` multiple records, make a `POST` request to 
     * `/crm/v3/objects/{objectTypeId}/batch/archive` and include the record ID 
     * values as the id inputs in your request body
     *  */             
    // private readonly batchArchive: string;                    
    /**
     * 
     * @param typeId {@link CrmObjectTypeIdEnum} `string`
     */
    constructor(typeId: CrmObjectTypeIdEnum) {
        validate.stringArgument(`CrmObjectEndpoint.constructor`, {typeId});
        if (!Object.values(CrmObjectTypeIdEnum).includes(typeId as CrmObjectTypeIdEnum)) {
            throw new Error(`Invalid ObjectTypeIdEnum: ${typeId}`);
        }
        this.typeId = typeId;
        this.type = ObjectTypeIdEnumReverseMap[typeId];
        // this.create = `${CRM_OBJECTS_URL}/${this.typeId}`;
        // this.batchCreate = `${CRM_OBJECTS_URL}/${this.typeId}/batch/create`;
        // this.batchUpsert = `${CRM_OBJECTS_URL}/${this.typeId}/batch/upsert`;
        // this.update = `${CRM_OBJECTS_URL}/${this.typeId}/{recordId}`;
        // this.batchUpdate = `${CRM_OBJECTS_URL}/${this.typeId}/batch/update`;
        // this.read = `${CRM_OBJECTS_URL}/${this.typeId}/{recordId}`;
        // this.readAll = `${CRM_OBJECTS_URL}/${this.typeId}`;
        // this.batchRead = `${CRM_OBJECTS_URL}/${this.typeId}/batch/read`;
        // this.archive = `${CRM_OBJECTS_URL}/${this.typeId}/{recordId}`;
        // this.batchArchive = `${CRM_OBJECTS_URL}/${this.typeId}/batch/archive`;
    }
    /**
     * @returns **`objectBatchUpsertUrl`** `string`
     * = `'{CRM_OBJECTS_URL}/{this.typeId}/batch/upsert'`
     */
    get batchUpsert(): string {
        return `${CRM_OBJECTS_URL}/${this.typeId}/batch/upsert`
    }
    /**
     * @returns **`objectBatchUpsertUrl`** `string`
     * = `'{CRM_OBJECTS_URL}/{this.typeId}/batch/upsert'`
     */
    get readAll(): string {
        return `${CRM_OBJECTS_URL}/${this.typeId}`
    }
    /**
     * @returns **`objectBatchUpsertUrl`** `string`
     * = `'{CRM_OBJECTS_URL}/{this.typeId}/batch/upsert'`
     */
    get batchRead(): string {
        return `${CRM_OBJECTS_URL}/${this.typeId}/batch/read`
    }
    public getReadUrl(recordId: string | number): string {
        validate.numericStringArgument(`CrmObjectEndpoint.getReadUrl`, {recordId})
        return `${CRM_OBJECTS_URL}/${this.typeId}/${recordId}`
    }

    public getTypeId(): CrmObjectTypeIdEnum {
        return this.typeId;
    }
    public getType(): string {
        return this.type;
    }

    public toString(): string {
        return [
            `CrmObjectEndpoint: ${this.typeId} (${this.type})`,
            // `Create: ${this.create}`,
            // `Batch Create: ${this.batchCreate}`,
            // `Batch Upsert: ${this.batchUpsert}`,
            // `Update: ${this.update}`,
            // `Batch Update: ${this.batchUpdate}`,
            // `Read: ${this.read}`,
            // `Read All: ${this.readAll}`,
            // `Batch Read: ${this.batchRead}`,
            // `Archive: ${this.archive}`,
            // `Batch Archive: ${this.batchArchive}`
        ].join(TAB);
    }
}
