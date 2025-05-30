/**
 * @file src/utils/crm/objects/objects.ts
 */

import { hubspotClient } from "../../config/env";
import { CrmObjectEnum, CrmAssociationObjectEnum } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging } from "@hubspot/api-client/lib/codegen/crm/objects";
/**
 * 
 * @param objectType see {@link CrmObjectEnum}
 * @param objectId `hs_object_id`
 * @param properties `string[]`
 * @param propertiesWithHistory `string[]` 
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived `boolean`
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` - The object with the specified ID, or undefined if not found.
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
        console.error(`getObjectById() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (!objectId || (typeof objectId !== 'string' && typeof objectId !== 'number')) {
        console.error(`getObjectById() Invalid objectId provided. Expected a string or number.`);
        return undefined;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`getObjectById() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum));
        return undefined;
    }
    try {
        const api = hubspotClient.crm[objectType].basicApi;
        const response = await api.getById(String(objectId), properties, propertiesWithHistory, associations, archived);
        return response;
    } catch (e) {
        console.error(`getObjectById() Error retrieving ${objectType} with ID ${objectId}:`, e);
        return undefined;
    }
}

/**
 * 
 * @param objectType see {@link CrmObjectEnum}
 * @param limit `number` = `10`
 * @param after `string | number` = `undefined`
 * @param properties `string[]` = `undefined`
 * @param propertiesWithHistory `string[]` = `undefined`
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived `boolean` = `false`
 * @returns `response` = `Promise<`{@link HS_CollectionResponseSimplePublicObjectWithAssociationsForwardPaging} | `undefined>` - The collection of objects, or undefined if not found.
 */
export async function getObjectByPage(
    objectType: CrmObjectEnum,
    limit: number = 10,
    after?: string | number,
    properties?: string[],
    propertiesWithHistory?: string[],
    associations?: string[],
    archived?: boolean,
): Promise<CollectionResponseSimplePublicObjectWithAssociationsForwardPaging | undefined> {
    if (!objectType || typeof objectType !== 'string') {
        console.error(`getObjectByPage() Invalid objectType provided. Expected a string.`);
        return undefined;
    }
    if (Object.keys(CrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = CrmObjectEnum[objectType.toUpperCase() as keyof typeof CrmObjectEnum];
    } else if (Object.values(CrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`getObjectByPage() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(CrmObjectEnum, null, 4));
        return undefined;
    }
    try {
        const api = hubspotClient.crm[objectType].basicApi;
        const response = await api.getPage(limit, String(after), properties, propertiesWithHistory, associations, archived);
        return response;
    } catch (e) {
        console.error(`getObjectByPage() Error retrieving page of objectType: ${objectType}:`, e);
        return undefined;
    }
}
