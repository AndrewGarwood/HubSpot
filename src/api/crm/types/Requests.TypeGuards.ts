/**
 * @file src/api/crm/objects/types/typeGuards.ts
 */

import { hasKeys, isNonEmptyArray, isNonEmptyString, isObject } from "typeshi:utils/typeValidation";
import { CrmObjectOptions, UpsertObjectRequest } from "./Requests";

/**
 * @param value `any`
 * @returns **`isCrmObjectOptions`**  `boolean`
 * - **`true`** `if` `value` is a valid {@link CrmObjectOptions} object with the following properties:
 * - - `properties` `object`
 * - - `id` `string` | `number`
 * - - `idProperty` `string`
 * - **`false`** `otherwise`
 */
export function isCrmObjectOptions(value: any): value is CrmObjectOptions {
    return (isObject(value)
        && hasKeys(value, ['properties', 'id', 'idProperty'], true, false) 
        // hasKeys 'associations' // optional
        && isObject(value.properties)
        && isNonEmptyString(value.idProperty)
        && (typeof value.id === 'string' || typeof value.id === 'number')
    );
}

/**
 * @param value `any`
 * @returns **`isUpsertObjectRequest`** `boolean`
 * - **`true`** `if` `value` is a valid {@link UpsertObjectRequest} object with the following properties:
 * - - `inputs` `Array<`{@link CrmObjectOptions}`>` with inputs`.length > 0`
 * - **`false`** `otherwise`
 */
export function isUpsertObjectRequest(value: any): value is UpsertObjectRequest {
    return (isObject(value)
        // && hasKeys(value, 'inputs')
        && isNonEmptyArray(value.inputs)
        && (value.inputs as any[]).every(element => isCrmObjectOptions(element))
    );
}