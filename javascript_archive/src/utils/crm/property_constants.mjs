const coreContactProperties = [
    'hs_object_id', 'firstname', 'lastname', 'company', 
    'total_revenue','num_associated_deals'
];

const coreDealProperties = [
    'hs_object_id', 'hubspot_owner_id', 'dealname','dealstage', 
    'createdate', 'closedate', 'amount'
];
const coreProductProperties = [
    'hs_object_id', 'hs_sku', 'name', 'price'
];

const coreLineItemProperties = [
    'hs_object_id', 'hs_sku', 'name', 'price', 'quantity',
    'hs_pre_discount_amount', 'hs_total_discount', 'discount', 'amount',
    'currency', 'is_net_new'
];

export const VALID_DEAL_STAGES = [
    'closedwon', 'shipped', 'checkout_completed', 
    'processed', 'checkout_processed'
];
export const INVALID_DEAL_STAGES = [
    'canceled', 'checkout_canceled', 'cancelled', 'checkout_cancelled', 
    'checkout_pending', 'checkout_abandoned'
];

export const DEFAULT_ADDRESS_PROPERTIES = [
    'address', 'street_address_2', 'city', 'state', 'zip', 'country', 'phone', 'email'
];

export const DEFAULT_PRODUCT_PROPERTIES = coreProductProperties;

export const DEFAULT_LINE_ITEM_PROPERTIES = coreLineItemProperties;

export const DEFAULT_DEAL_PROPERTIES = coreDealProperties
    .concat(DEFAULT_ADDRESS_PROPERTIES);

export const DEFAULT_CONTACT_PROPERTIES = coreContactProperties
    .concat(DEFAULT_ADDRESS_PROPERTIES);
