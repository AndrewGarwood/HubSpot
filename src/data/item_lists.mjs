/**
 * @file item_lists.mjs
 */

const CATEGORY_A_ITEMS = new Set([
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'
]);
const CATEGORY_B_ITEMS = new Set([
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'
]);
const CATEGORY_C_ITEMS = new Set([
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'
]);
const CATEGORY_D_ITEMS = new Set([
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'
]);
const CATEGORY_E_ITEMS = new Set([
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10'
]);
const CATEGORY_F_ITEMS = new Set([
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'
]);

/**@type {Object.<string, Set<string>>} */
export const CATEGORY_TO_SKU_DICT = {
    'CategoryA': CATEGORY_A_ITEMS,
    'CategoryB': CATEGORY_B_ITEMS,
    'CategoryC': CATEGORY_C_ITEMS,
    'CategoryD': CATEGORY_D_ITEMS,
    'CategoryE': CATEGORY_E_ITEMS,
    'CategoryF': CATEGORY_F_ITEMS
}

/**other consideration:: Map<string, Set<string>>*/
// export const CATEGORY_TO_SKU_MAP = new Map([
//     ['CategoryA', CATEGORY_A_ITEMS],
//     ['CategoryB', CATEGORY_B_ITEMS],
//     ['CategoryC', CATEGORY_C_ITEMS],
//     ['CategoryD', CATEGORY_D_ITEMS],
//     ['CategoryE', CATEGORY_E_ITEMS],
//     ['CategoryF', CATEGORY_F_ITEMS]
// ]);
