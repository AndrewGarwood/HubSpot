/**
 * @file src/crm/objects/objects.ts
 */
import axios from "axios";
import { mainLogger as mlog, apiLogger as alog, 
    INDENT_LOG_LINE as TAB, NEW_LINE as NL 
} from "../../../config/setupLog";
import { 
    hubspotClient, STOP_RUNNING, PERSONAL_ACCESS_KEY as ACCESS_KEY, DELAY 
} from "../../../config/env";
import { 
    ApiObjectEnum, CrmAssociationObjectEnum, 
    CrmObjectTypeIdEnum, 
    SimplePublicObject, SimplePublicObjectWithAssociations 
} from "../types";
import { 
    SimplePublicObject as HS_SimplePublicObject, 
    SimplePublicObjectWithAssociations as HS_SimplePublicObjectWithAssociations, 
    CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HS_CollectionResponseSimplePublicObjectWithAssociationsForwardPaging 
} from "@hubspot/api-client/lib/codegen/crm/objects";
import { indentedStringify } from "../../../utils/io/writing";
import * as validate from "../../../utils/argumentValidation";
import { isEmptyArray, isNonEmptyString } from "../../../utils/typeValidation";
import { CrmObjectEndpoint } from "../types/Endpoints";
import { FieldValue, 
    UpsertObjectRequest, 
    CrmObjectOptions, CrmObjectAssociationEntry, 
    CrmObjectAssociationOptions, isUpsertObjectRequest 
} from "./types";
import { AxiosCallEnum as HTTP, AxiosContentTypeEnum, AxiosHeader } from "../../types";
/**
 * @param objectType see {@link ApiObjectEnum}
 * @param objectId `hs_object_id`
 * @param properties `string[]`
 * @param propertiesWithHistory `string[]` 
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived `boolean`
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` - The object with the specified ID, or undefined if not found.
 */
export async function getObjectById(
    objectType: ApiObjectEnum,
    objectId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: CrmAssociationObjectEnum[],
    archived?: boolean,
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    const source = `[objects.getObjectById()]`;
    try {
        validate.stringArgument(source, {objectType});
        validate.numericStringArgument(source, {objectId});
        if (properties) validate.arrayArgument(source, {properties}, 'string', isNonEmptyString);
        if (propertiesWithHistory) validate.arrayArgument(source, {propertiesWithHistory}, 'string', isNonEmptyString);
        if (associations) validate.arrayArgument(source, {associations}, 'string', isNonEmptyString);
    } catch (e) {
        mlog.error(`${source} Invalid arguments:`, JSON.stringify(e as any, null, 4));
        return;
    }
    if (Object.keys(ApiObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = ApiObjectEnum[objectType.toUpperCase() as keyof typeof ApiObjectEnum];
    } else if (Object.values(ApiObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`${source} Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(ApiObjectEnum));
        return;
    }
    // TODO make sure do not pass in empty objects or empty arrays to api... it throws fit...
    try {
        const api = hubspotClient.crm[objectType].basicApi;
        const response = await api.getById(
            String(objectId), properties, propertiesWithHistory, associations, archived
        ) as SimplePublicObject | SimplePublicObjectWithAssociations;
        return response;
    } catch (e) {
        mlog.error(`${source} Error calling api.getById()`,
            TAB + `objectType='${objectType}'`,
            TAB + `id='${objectId}'`,
            // TAB + `properties=${JSON.stringify(properties)}`,
            // TAB + `propertiesWithHistory=${JSON.stringify(propertiesWithHistory)}`,
            TAB + `associations=${JSON.stringify(associations)}`,
            TAB + `archived=${archived}`, 
            NL + `Error:`, indentedStringify(e as any)
        );
        return;
    }
}

function partitionArrayBySize(
    arr: Array<any>, 
    batchSize: number
): Array<Array<any>> {
    let batches = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}

function AxiosHeader(
    authorization: string, 
    contentType?: AxiosContentTypeEnum, 
    acceptType?: AxiosContentTypeEnum
): AxiosHeader {
    validate.stringArgument(`objects.AxiosHeader`, {authorization});
    const header: AxiosHeader = { 'Authorization': authorization };
    if (isNonEmptyString(contentType) 
        && Object.values(AxiosContentTypeEnum).includes(contentType)) {
        header['Content-Type'] = contentType
    }
    if (isNonEmptyString(acceptType) 
        && Object.values(AxiosContentTypeEnum).includes(acceptType)) {
        header['Accept'] = contentType
    }
    return header;    
}
const BATCH_SIZE = 100;
const TWO_SECONDS = 2000;
/**
 * @description
 * - batch create and update records at the same time 
 * using the upsert endpoint. For this endpoint, you can use a custom unique 
 * identifier property or email for contacts. Following the request, if the 
 * records already exist, they'll be updated and if the records don't exist, 
 * they'll be created. 
 * - To upsert records, make a `POST` request to `/crm/v3/objects/{objectTypeId}/batch/upsert`. 
 * - - In your request body, include the `idProperty` parameter to identify the unique 
 * identifier property you're using. 
 * - - Include that property's value as the `id` ​and 
 * add the other `properties` you want to set or update
 * 
 * @param request {@link UpsertObjectRequest} = `{ inputs:`{@link CrmObjectOptions}`[] }`
 * @param objectTypeId {@link CrmObjectTypeIdEnum} `string`
 */
export async function upsertObjectPayload(
    request: UpsertObjectRequest,
    objectTypeId: CrmObjectTypeIdEnum
): Promise<any> {
    const source = `objects.upsertObjectPayload`;
    validate.objectArgument(source, {request}, 'UpsertObjectRequest', isUpsertObjectRequest);
    validate.stringArgument(source, {objectTypeId});
    let endpoint = new CrmObjectEndpoint(objectTypeId);
    // let url = endpoint.batchUpsert;
    // try {
    //     let endpoint = new CrmObjectEndpoint(objectTypeId);
    //     url = endpoint.batchUpsert
    // } catch (error) {
    //     let message = [`[${source}()] Invalid param 'objectTypeId'`,
    //         `Expected: string, valid CrmObjectTypeIdEnum member`,
    //         `Received: ${typeof objectTypeId} '${objectTypeId}'`,
    //         `${indentedStringify(error as any)}`
    //     ].join(TAB);
    //     mlog.error(message);
    //     throw error;
    // }
    const upsertObjectArray: CrmObjectOptions[] = request.inputs || [];
    const batches: CrmObjectOptions[][] = partitionArrayBySize(upsertObjectArray, BATCH_SIZE);
    const headers = AxiosHeader(
        `Bearer ${ACCESS_KEY}`, 
        AxiosContentTypeEnum.JSON
    );
    const result: {
        responses: any[]; 
        rejects: CrmObjectOptions[]
    } = { responses: [], rejects: [] }
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        try {
            const res = await axios.post(endpoint.batchUpsert, batch, {headers});
            if (!res || !res.data) {
                mlog.warn(`[${source}()] ${endpoint.getType()} batchIndex=${i}`,
                    ` res.data is undefined.`
                );
                result.rejects.push(...batch)
                continue;
            }
            result.responses.push(res); 
            mlog.info(
                `[${source}()] finished ${endpoint.getType()} batch ${i+1} of ${batches.length};`,
            );
            await DELAY(TWO_SECONDS, null);
            continue;
        } catch (error) {
            mlog.error(`[${source}()] Error posting ${endpoint.getType()} payload (batchIndex=${i}):`, 
                (error as any)
            );
            continue;
        }
    }
    return result;
}
