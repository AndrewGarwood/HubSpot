/**
 * @file src/utils/crm/index.ts
 */

import {
    DEFAULT_CONTACT_PROPERTIES,
    DEFAULT_ADDRESS_PROPERTIES,
    DEFAULT_DEAL_PROPERTIES,
    DEFAULT_LINE_ITEM_PROPERTIES,
} from './constants';
import { 
    setPropertyByObjectId, 
    batchSetPropertyByObjectId, 
    searchObjectByProperty 
} from './properties';
import { 
    getObjectById, 
    getObjectByPage,
    getContactById, 
    getDealById, 
    getLineItemById, 
    getSkuFromLineItem, 
    isValidLineItem, 
} from './objects';
import { 
    CrmObjectWithBasicApiEndpointEnum, 
    CrmAssociationObjectEnum, 
    Filter, 
    FilterGroup, 
    FilterOperatorEnum 
} from './types/Crm';
export {
    // constants.ts
    DEFAULT_CONTACT_PROPERTIES,
    DEFAULT_ADDRESS_PROPERTIES,
    DEFAULT_DEAL_PROPERTIES,
    DEFAULT_LINE_ITEM_PROPERTIES,

    // properties.ts
    setPropertyByObjectId,
    batchSetPropertyByObjectId,
    searchObjectByProperty,

    // objects.ts
    getObjectById,
    getObjectByPage,
    getContactById,
    getDealById,
    getLineItemById,
    getSkuFromLineItem,
    isValidLineItem,

    // types/Crm.ts
    CrmObjectWithBasicApiEndpointEnum,
    CrmAssociationObjectEnum,
    // Filter,
    // FilterGroup,
    FilterOperatorEnum,
}