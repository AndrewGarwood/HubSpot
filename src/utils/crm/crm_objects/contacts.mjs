/**
 * @file contacts.mjs
 */
import { DEFAULT_CONTACT_PROPERTIES } from '../property_constants.mjs';
import { hubspotClient } from '../../config/env.mjs';

/**
 * @param {GetContactConfig} ParamObject GetContactConfig = {contactId, properties, propertiesWithHistory, associations, archived}
 * @param {string | number} contactId string | number
 * @param {Array<string>} properties Array\<string>
 * @param {Array<string>} propertiesWithHistory Array\<string>
 * @param {Array<string>} associations Array\<string> - default=['deals']
 * @param {boolean} archived boolean
 * 
 * @returns {Promise<SimplePublicObjectWithAssociations>} 
*/
export async function getContactById({
    contactId = '', 
    properties = DEFAULT_CONTACT_PROPERTIES, 
    propertiesWithHistory = undefined, 
    associations = ['deals'], 
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.contacts.basicApi.getById(
            contactId, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2)) 
            : console.error(e);
        return null;
    }
}

/**
 * @param {GetContactPageConfig} ParamObject GetContactPageConfig = {limit, after, properties, propertiesWithHistory, associations, archived}
 * @param {number} limit number
 * @param {number} after number
 * @param {Array<string>} properties Array\<string>
 * @param {Array<string>} propertiesWithHistory Array\<string>
 * @param {Array<string>} associations Array\<string>
 * @param {boolean} archived boolean
 * 
 * @returns {Promise<SimplePublicObjectWithAssociations | undefined>} 
*/
export async function getContactByPage({
    limit = 5,
    after, 
    properties = DEFAULT_CONTACT_PROPERTIES, 
    propertiesWithHistory = [''], 
    associations = ['deals'], 
    archived = false
} = {}) {
    try {
        const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
            limit, after, properties, propertiesWithHistory, associations, archived
        );
        return apiResponse
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2)) 
            : console.error(e);
        return null;
    }
}


