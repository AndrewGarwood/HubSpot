
import { getJsonFromFile, printJSON, printConsoleGroup } from './utils/io/io_utils.mjs';
import { getContactById, getDealById, getLineItemById } from './utils/crm/crm_object_utils.mjs';
import { setPropertyByObjectId, searchObjectByProperty, batchSetPropertyByObjectId } from './utils/crm/properties.mjs';
import {DEFAULT_CONTACT_PROPERTIES, DEFAULT_ADDRESS_PROPERTIES } from './utils/property_constants.mjs'
import { CATEGORY_TO_SKU_DICT } from './data/item_lists.mjs';
import './types/types.js';
import './types/hubspot_types.js';
import './types/enums.js';
import { hubspotClient, SEARCH_LIMIT, delay } from './config/env.mjs';

async function main() {
    try {
        // code removed for privacy
        console.log('some logic goes here')
    } catch (e) {
        console.error('<< Error in main():', e)
    }
}

