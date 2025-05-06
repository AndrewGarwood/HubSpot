/**
 * @file src/utils/crm/objects/index.ts
 */
import {
    getObjectById,
    getObjectByPage
} from "./objects";
import { getContactById } from "./contacts";
import { getDealById } from "./deals";
import { getLineItemById, getSkuFromLineItem, isValidLineItem } from "./lineItems";

export {
    getObjectById,
    getObjectByPage,
    
    getContactById,
    
    getDealById,
    
    getLineItemById,
    getSkuFromLineItem,
    isValidLineItem,
}