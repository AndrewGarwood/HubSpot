/**
 * @file src/crm/objects/objects.ts
 */
import { mainLogger as mlog, apiLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL, indentedStringify } from "../../../config/setupLog";
import { hubspotClient, STOP_RUNNING } from "../../../config/env";
import { 
    CrmObjectEnum, CrmAssociationObjectEnum, 
    SimplePublicObject, SimplePublicObjectWithAssociations 
} from "../types/Crm";
import { 
    CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HS_CollectionResponseSimplePublicObjectWithAssociationsForwardPaging 
} from "@hubspot/api-client/lib/codegen/crm/objects";
/**
 * 
 * @param objectType see {@link CrmObjectEnum}
 * @param objectId `hs_object_id`
 * @param properties `string[]`
 * @param propertiesWithHistory `string[]` 
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived `boolean`
 * @returns **`response`** = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` - The object with the specified ID, or undefined if not found.
 */
export async function getObjectById(
    objectType: CrmObjectEnum,
    objectId: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: CrmAssociationObjectEnum[],
    archived?: boolean,
): Promise<SimplePublicObject | SimplePublicObjectWithAssociations | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`getObjectById() Invalid objectType provided. Expected a string.`);
        return;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        mlog.error(`getObjectById() Invalid objectId provided. Expected a string or number.`);
        return;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`getObjectById() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum));
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
        mlog.error(`getObjectById() Error calling api.getById()`,
            TAB + `objectType='${objectType}'`,
            TAB + `id='${objectId}'`,
            TAB + `properties=${JSON.stringify(properties)}`,
            TAB + `propertiesWithHistory=${JSON.stringify(propertiesWithHistory)}`,
            TAB + `associations=${JSON.stringify(associations)}`,
            TAB + `archived=${archived}`, 
            NL + `Error:`, indentedStringify(e as any)
        );
        return;
    }
}

/**
 * @param objectType see {@link CrmObjectEnum}
 * @param limit `number` = `10`
 * @param after `string | number` = `undefined`
 * @param properties `string[]` = `undefined`
 * @param propertiesWithHistory `string[]` = `undefined`
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived `boolean` = `false`
 * @returns **`response`** = `Promise<`{@link HS_CollectionResponseSimplePublicObjectWithAssociationsForwardPaging} | `undefined>` - The collection of objects, or undefined if not found.
 */
export async function getObjectByPage(
    objectType: CrmObjectEnum,
    limit: number = 10,
    after?: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: string[],
    archived?: boolean,
): Promise<HS_CollectionResponseSimplePublicObjectWithAssociationsForwardPaging | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        mlog.error(`getObjectByPage() Invalid objectType provided. Expected a string.`);
        return;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        mlog.error(`getObjectByPage() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum, null, 4));
        return;
    }
    try {
        const api = hubspotClient.crm[objectType].basicApi;
        const response = await api.getPage(limit, String(after), properties, propertiesWithHistory, associations, archived);
        return response;
    } catch (e) {
        mlog.error(`getObjectByPage() Error retrieving page of objectType '${objectType}':`, e);
        return;
    }
}
