/**
 * @file src/utils/io/Reading.ts
 */
import {
    StringCaseOptions, StringPadOptions, StringStripOptions
} from "../regex/index"
import { parseExcelForOneToMany } from "../reading"


/**
 * @typedefn **`ParseOneToManyOptions`**
 * @property {StringStripOptions} [keyStripOptions] - options for stripping characters from the key
 * @property {StringStripOptions} [valueStripOptions] - options for stripping characters from the value
 * @property {StringCaseOptions} [keyCaseOptions] - options for changing the case of the key
 * @property {StringCaseOptions} [valueCaseOptions] - options for changing the case of the value
 * @property {StringPadOptions} [keyPadOptions] - options for padding values read from the `keyColumn`
 * @property {StringPadOptions} [valuePadOptions] - options for padding values read from the `valueColumn`
 * 
 * - {@link StringStripOptions} = `{ char: string, escape?: boolean, stripLeftCondition?: (s: string, ...args: any[]) => boolean, leftArgs?: any[], stripRightCondition?: (s: string, ...args: any[]) => boolean, rightArgs?: any[] }`
 * - {@link StringCaseOptions}  = `{ toUpper: boolean, toLower: boolean, toTitle: boolean }`
 * - {@link StringPadOptions} = `{ padLength: number, padChar: string, padLeft: boolean, padRight: boolean }`
 * @see {@link parseExcelForOneToMany}
 */
export type ParseOneToManyOptions = {
    keyStripOptions?: StringStripOptions,
    valueStripOptions?: StringStripOptions,
    keyCaseOptions?: StringCaseOptions,
    valueCaseOptions?: StringCaseOptions,
    keyPadOptions?: StringPadOptions,
    valuePadOptions?: StringPadOptions
}


export type NodeStructure = {
    [key: string]: NodeStructure | NodeLeaves
}

export type NodeLeaves = number[] | RowDictionary;

export type RowDictionary = { 
    [rowIndex: number]: Record<string, any> 
}


/**
 * only set oldValue to newValue if the column name is in validColumns
 * @property {FieldValue} newValue - The new value to set for the column.
 * @property {string | string[]} validColumns - The column names that this mapping applies to. Can be a single string or an array of strings.
 */
export type ValueMappingEntry = {
    newValue: FieldValue;
    validColumns: string | string[];
};

/**
 * @description
 * - `keys` - an explicit value that you want to override
 * - `value` can be: 
 * - - a {@link FieldValue} -> override occurrences of `key` in any column it's found in with the `FieldValue`
 * - - a {@link ValueMappingEntry} -> override occurences of `key` only in specified columns (see {@link ValueMappingEntry.validColumns}) with {@link ValueMappingEntry.newValue}.
 */
export type ValueMapping = Record<string, FieldValue | ValueMappingEntry>;

export type FieldValue = Date | number | number[] | string | string[] | boolean | null;