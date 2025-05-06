/**
 * @file src/utils/crm/objects/objects.ts
 */

import { hubspotClient } from "../../../config/env";
import { CrmObjectWithBasicApiEndpointEnum as BasicCrmObjectEnum, CrmAssociationObjectEnum } from "../types/Crm";
import { SimplePublicObject, SimplePublicObjectWithAssociations } from "@hubspot/api-client/lib/codegen/crm/objects";
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging } from "@hubspot/api-client/lib/codegen/crm/objects";
/**
 * 
 * @param objectType see {@link BasicCrmObjectEnum}
 * @param objectId `hs_object_id`
 * @param properties 
 * @param propertiesWithHistory 
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived 
 * @returns `response` = `Promise<`{@link SimplePublicObject} | {@link SimplePublicObjectWithAssociations} | `undefined>` - The object with the specified ID, or undefined if not found.
 */
export async function getObjectById(
    objectType: BasicCrmObjectEnum,
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
    if (Object.keys(BasicCrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = BasicCrmObjectEnum[objectType.toUpperCase() as keyof typeof BasicCrmObjectEnum];
    } else if (Object.values(BasicCrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`getObjectById() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(BasicCrmObjectEnum));
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
 * @param objectType see {@link BasicCrmObjectEnum}
 * @param limit 
 * @param after 
 * @param properties 
 * @param propertiesWithHistory 
 * @param associations see {@link CrmAssociationObjectEnum}
 * @param archived 
 * @returns `response` = `Promise<`{@link CollectionResponseSimplePublicObjectWithAssociationsForwardPaging} | `undefined>` - The collection of objects, or undefined if not found.
 */
export async function getObjectByPage(
    objectType: BasicCrmObjectEnum,
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
    if (Object.keys(BasicCrmObjectEnum).indexOf(objectType.toUpperCase()) !== -1) {
        objectType = BasicCrmObjectEnum[objectType.toUpperCase() as keyof typeof BasicCrmObjectEnum];
    } else if (Object.values(BasicCrmObjectEnum).indexOf(objectType) === -1) {
        console.error(`getObjectByPage() Invalid objectType provided. objectType must be a key or value of CrmObjectWithBasicApiEndpointEnum.`, JSON.stringify(BasicCrmObjectEnum, null, 4));
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
