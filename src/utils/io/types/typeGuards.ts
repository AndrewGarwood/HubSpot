/**
 * @file src/utils/io/types/typeGuards.ts
 */

import { 
    FileData, NodeLeaves, NodeStructure, 
    RowDictionary, RowSourceMetaData, WriteJsonOptions 
} from "..";
import { hasKeys, isIntegerArray, isNonEmptyString } from "../../typeValidation";


/**
 * 
 * @param value `any`
 * @returns **`isRowSourceMetaData`** `boolean`
 * - **`true`** `if` `value` is an object such that 
 * each of its keys is a string that maps to an integer array
 * - **`false`** `otherwise`
 */
export function isRowSourceMetaData(value: any): value is RowSourceMetaData {
    return (value && typeof value === 'object'
        && Object.keys(value).every(key => 
            isNonEmptyString(key) && isIntegerArray(value[key])
        )
    );
}


/**
 * - {@link RowDictionary} = `{ [rowIndex: number]: Record<string, any>; }`
 * @param value 
 * @returns 
 */
export function isRowDictionary(value: any): value is RowDictionary {
    return (value && typeof value === 'object'
        && !Array.isArray(value)
        && Object.keys(value).length > 0
        && Object.keys(value).every(key => 
            !isNaN(Number(key))
            && Boolean(value[key]) 
            // is Record<string, any>
            && typeof value[key] === 'object' && !Array.isArray(value[key])
        )
    )
}


export function isNodeStucture(value: any): value is NodeStructure {
    return (value && typeof value === 'object'
        && !Array.isArray(value)
        && Object.keys(value).length > 0
        && Object.entries(value).every(([key, value]) => 
            typeof key === 'string' 
            && (isNodeStucture(value) || isNodeLeaves(value))
        )
    );
}

export function isNodeLeaves(value: any): value is NodeLeaves | number[] | RowDictionary {
    return ((Array.isArray(value) && value.every(v => typeof v === 'number')) 
        || isRowDictionary(value)
    );
}

export function isWriteJsonOptions(value: any): value is WriteJsonOptions {
    return (value && typeof value === 'object'
        && !Array.isArray(value)
        && value.data !== undefined
        && (typeof value.data === 'object' || typeof value.data === 'string')
        && isNonEmptyString(value.filePath)
        && (value.indent === undefined 
            || (typeof value.indent === 'number' && value.indent >= 0)
        )
        && (value.enableOverwrite === undefined 
            || typeof value.enableOverwrite === 'boolean'
        )
    );
}

/**
 * @consideration `FILE_NAME_WITH_EXTENSION_PATTERN = /^[^/\\:*?"<>|]+(\.[^/\\:*?"<>|]+)$/`
 * @param value `any`
 * @returns **`isFileData`** `boolean`
 * - **`true`** if the `value` is a {@link FileData} object with keys `fileName` and `fileContent`,
 * where `fileName` is a string and `fileContent` is a base64 encoded string,
 * - && fileNamePattern.test(value.fileName)
 * - **`false`** `otherwise`.
 */
export function isFileData(value: any): value is FileData {
    return (value && typeof value === 'object'
        && hasKeys(value, ['fileName', 'fileContent'])
        && isNonEmptyString(value.fileName)
        // && fileNamePattern.test(value.fileName)
        && isNonEmptyString(value.fileContent)
    );
}