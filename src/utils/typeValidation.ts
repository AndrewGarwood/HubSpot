/**
 * @file src/utils/typeValidation.ts
 */
import { mainLogger as log } from "../config/setupLog";

/**
 * @param value the value to check
 * @returns **`isNullLike`** `{boolean}` 
 * - `true` if the value is null, undefined, empty object, empty array, or empty string
 * - `false` otherwise (zero returns false)
 */
export function isNullLike(value: any): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
        return false;
    }
    // Check for empty object or array
    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
    }
    if (typeof value === 'string' && (value.trim() === '' || value.toLowerCase() === 'undefined' || value.toLowerCase() === 'null') ) {
        return true;
    }
    return false;
}

/**
 * @param {any} arr 
 * @returns {boolean} `true` if arr is an array and has at least one element, `false` otherwise.
 */
export function isNonEmptyArray(arr: any): boolean {
    return Array.isArray(arr) && arr.length > 0;
}
/**
 * @description Check if an object has any non-empty keys (not `undefined`, `null`, or empty string). 
 * - passing in an array will return `false`.
 * @param {Object} obj - The object to check.
 * @returns {boolean} `true` if the object has any non-empty keys, `false` otherwise.
 */
export function hasNonTrivialKeys(obj: any): boolean {
    if (typeof obj !== 'object' || !obj || Array.isArray(obj)) {
        return false;
    }
    for (const key in obj) { // return true if any key is non-empty
        let value = obj[key];
        let valueIsNonTrivial = (obj.hasOwnProperty(key) 
            && value !== undefined 
            && value !== null 
            && (value !== '' 
                || isNonEmptyArray(value) 
                || (typeof value === 'object' && isNonEmptyArray(Object.entries(value)))
            )
        );
        if (valueIsNonTrivial) {
            return true;
        }
    }
    return false;
}

/**
 * @note maybe redundant with the syntax `key in obj` ? but able to check more than one
 * @param obj the object to check
 * @param keys the list of keys that obj must have
 * @returns {boolean} `true` if the object has all the keys, `false` otherwise
 * @throws {TypeError} if `keys` is not an array
 */
export function hasKeys<T extends Object>(obj: T, keys: Array<keyof T>): boolean {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    if (typeof keys === 'string') {
        keys = [keys] as Array<keyof T>; // Convert string (assumed to be single key) to array of keys
    }
    if (!keys || !Array.isArray(keys)) {
        throw new TypeError('hasKeys() param `keys` must be an array');
    }
    if (keys.length === 0) {
        return false; // No keys to check
    }
    for (const key of keys) {
        if (!obj.hasOwnProperty(key)) {
            // log.warn(`hasKeys() key "${String(key)}" not found in the object`);
            return false; // Key not found in the object
        }
    }
    return true; // All keys found in the object
}