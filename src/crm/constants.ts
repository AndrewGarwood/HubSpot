/**
 * @file src/crm/constants.ts
 */

/** 
 * `'hs_object_id', 'firstname', 'lastname', 'company', 'hubspot_owner_id'`,
 * `'miracu_product_manager', 'regional_manager_owner', 'letybo_owner'`,
 * `'num_associated_deals'` 
 * */
export const CONTACT_CORE_PROPS = [
    'hs_object_id', 'firstname', 'lastname', 'company', 
    'hubspot_owner_id','miracu_product_manager', 'regional_manager_owner', 
    'letybo_owner','num_associated_deals'
];
/**
 * `'unific_last_order_date', 'unific_customer_group',
 * 'unific_total_number_of_orders', 'unific_total_value_of_orders',
 * 'unific_skus_bought_text'`
 */
export const CONTACT_UNIFIC_PROPS = [
    'unific_last_order_date', 'unific_customer_group', 
    'unific_total_number_of_orders', 'unific_total_value_of_orders', 
    'unific_skus_bought_text'
];

/** 
 * `'hs_object_id', 'hubspot_owner_id', 'dealname','dealstage'`, 
 * `'createdate', 'closedate', 'amount'`
 * */
export const DEAL_CORE_PROPS = [
    'hs_object_id', 'hubspot_owner_id', 'dealname','dealstage', 'createdate', 'closedate', 'amount'
];
/** 
 * `'unific_order_number', 'unific_last_skus_bought', 'unific_last_products_bought'`
 * `'unific_order_status', 'coupon_code_used_unific'`
 * */
export const DEAL_UNIFIC_PROPS = [
    'unific_order_number', 'unific_last_skus_bought', 'unific_last_products_bought',
    'unific_order_status', 'coupon_code_used_unific',//'unific_coupon_code_used_text'
];

/**
 * `'hs_object_id', 'hs_sku', 'name', 'price', 'quantity'`,
 * `'hs_pre_discount_amount', 'hs_total_discount', 'discount', 'amount'`,
 * `'currency', 'miracu_product_category', 'miracu_product_subcategory'`,
 * `'commissionable_categories', 'is_net_new'`
 */
export const LINE_ITEM_CORE_PROPS = [
    'hs_object_id', 'hs_sku', 'name', 'price', 'quantity',
    'hs_pre_discount_amount', 'hs_total_discount', 'discount', 'amount',
    'currency', 'miracu_product_category', 'miracu_product_subcategory', 
    'commissionable_categories', 'is_net_new'
];

/**
 * `'closedwon', 'shipped', 'checkout_completed'`,
 * `'processed', 'checkout_processed'`
 */
export const VALID_DEAL_STAGES = [
    'closedwon', 'shipped', 'checkout_completed', 
    'processed', 'checkout_processed'
];
/**
 * `'canceled', 'checkout_canceled', 'cancelled'`,
 * `'checkout_cancelled', 'checkout_pending', 'checkout_abandoned'`
 */
export const INVALID_DEAL_STAGES = [
    'canceled', 'checkout_canceled', 'cancelled', 'checkout_cancelled', 
    'checkout_pending', 'checkout_abandoned'
];
/**
 * `'address', 'street_address_2', 'city', 'state', 'zip', 'country', 'phone', 'email'`
 */
export const DEFAULT_ADDRESS_PROPERTIES = [
    'address', 'street_address_2', 'city', 'state', 'zip', 'country', 'phone', 'email'
];

/**
 * `'unific_shipping_address_line_1', 'unific_shipping_address_line_2', 
 * 'unific_shipping_city', 'unific_shipping_state','unific_shipping_postal_code',
 * 'unific_shipping_country', 'unific_shipping_phone'`
 */
export const SHIPPING_ADDRESS_PROPERTIES = [
    'unific_shipping_address_line_1', 'unific_shipping_address_line_2', 
    'unific_shipping_city', 'unific_shipping_state','unific_shipping_postal_code',
    'unific_shipping_country', 'unific_shipping_phone'
];
export const DEFAULT_LINE_ITEM_PROPERTIES = LINE_ITEM_CORE_PROPS;

/** = {@link DEAL_CORE_PROPS} + {@link DEAL_UNIFIC_PROPS} + {@link DEFAULT_ADDRESS_PROPERTIES} + {@link SHIPPING_ADDRESS_PROPERTIES} */
export const DEFAULT_DEAL_PROPERTIES = DEAL_CORE_PROPS
    .concat(DEAL_UNIFIC_PROPS)
    .concat(DEFAULT_ADDRESS_PROPERTIES)
    .concat(SHIPPING_ADDRESS_PROPERTIES);

/** = {@link CONTACT_CORE_PROPS} + {@link DEFAULT_ADDRESS_PROPERTIES} + {@link SHIPPING_ADDRESS_PROPERTIES} */
export const DEFAULT_CONTACT_PROPERTIES = CONTACT_CORE_PROPS
    // .concat(CONTACT_UNIFIC_PROPS)
    .concat(DEFAULT_ADDRESS_PROPERTIES)
    .concat(SHIPPING_ADDRESS_PROPERTIES);