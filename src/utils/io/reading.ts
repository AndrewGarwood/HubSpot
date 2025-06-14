/**
 * @file src/utils/io/reading.ts
 */
import fs from 'fs';
import xlsx from 'xlsx';
import { FileExtensionResult, ParseOneToManyOptions, StringPadOptions, StringCaseOptions, StringStripOptions } from './types/Reading';
import { DelimitedFileTypeEnum, DelimiterCharacterEnum } from './types/Csv';
import { stripCharFromString, cleanString, UNCONDITIONAL_STRIP_DOT_OPTIONS } from './regex';
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from '../../config/setupLog';


/**
 * @param filePath `string`
 * @param sheetName `string`
 * @param keyColumn `string`
 * @param valueColumn `string`
 * @param options - {@link ParseOneToManyOptions}
 * = `{ keyStripOptions`?: {@link StringStripOptions}, `valueStripOptions`?: {@link StringStripOptions}, keyCaseOptions`?: {@link StringCaseOptions}, `valueCaseOptions`?: {@link StringCaseOptions}, `keyPadOptions`?: {@link StringPadOptions}, `valuePadOptions`?: {@link StringPadOptions} `}`
 * - {@link StringStripOptions} = `{ char`: `string`, `escape`?: `boolean`, `stripLeftCondition`?: `(s: string, ...args: any[]) => boolean`, `leftArgs`?: `any[]`, `stripRightCondition`?: `(s: string, ...args: any[]) => boolean`, `rightArgs`?: `any[] }`
 * - {@link StringCaseOptions} = `{ toUpper`?: `boolean`, `toLower`?: `boolean`, `toTitle`?: `boolean }`
 * - {@link StringPadOptions} = `{ padLength`: `number`, `padChar`?: `string`, `padLeft`?: `boolean`, `padRight`?: `boolean }`
 * @returns **`dict`** = `Record<string, Array<string>>` - key-value pairs where key is from `keyColumn` and value is an array of values from `valueColumn`
 */
export function parseExcelForOneToMany(
    filePath: string, 
    sheetName: string, 
    keyColumn: string, 
    valueColumn: string,
    options: ParseOneToManyOptions = {},
): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        'xlsx'
    ).validatedFilePath;
    try {
        const { 
            keyStripOptions, valueStripOptions, 
            keyCaseOptions, valueCaseOptions, 
            keyPadOptions, valuePadOptions 
        } = options;
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);
        const dict: Record<string, Array<string>> = {};
        jsonData.forEach(row => {
            let key: string = cleanString(
                String(row[keyColumn]), 
                keyStripOptions, 
                keyCaseOptions, 
                keyPadOptions
            ).trim().replace(/\.$/, '');
            let val: string = cleanString(
                String(row[valueColumn]),
                valueStripOptions, 
                valueCaseOptions, 
                valuePadOptions
            ).trim().replace(/\.$/, '');
            if (!dict[key]) {
                dict[key] = [];
            }
            if (!dict[key].includes(val)) {
                dict[key].push(val);
            }
        });
        return dict;
    } catch (err) {
        mlog.error('Error reading or parsing the Excel file:', err, 
            TAB + `Given File Path: "${filePath}"`
        );
        return {} as Record<string, Array<string>>;
    }
}

/**
 * @param filePath `string`
 * @param keyColumn `string`
 * @param valueColumn `string`
 * @param delimiter {@link DelimiterCharacterEnum} | `string`
 * @param options {@link ParseOneToManyOptions}
 * = `{ keyCaseOptions`?: {@link StringCaseOptions}, `valueCaseOptions`?: {@link StringCaseOptions}, `keyPadOptions`?: {@link StringPadOptions}, `valuePadOptions`?: {@link StringPadOptions} `}`
 * - {@link StringCaseOptions} = `{ toUpper`?: `boolean`, `toLower`?: `boolean`, `toTitle`?: `boolean }`
 * - {@link StringPadOptions} = `{ padLength`: `number`, `padChar`?: `string`, `padLeft`?: `boolean`, `padRight`?: `boolean }`
 * @returns **`dict`** = `Record<string, Array<string>>` - key-value pairs where key is from `keyColumn` and value is an array of values from `valueColumn`
 */
export function parseCsvForOneToMany(
    filePath: string,
    keyColumn: string,
    valueColumn: string,
    delimiter: DelimiterCharacterEnum | string = DelimiterCharacterEnum.COMMA,
    options: ParseOneToManyOptions = {},
): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        DelimitedFileTypeEnum.CSV
    ).validatedFilePath;
    try {
        const { keyStripOptions, valueStripOptions, 
            keyCaseOptions, valueCaseOptions, 
            keyPadOptions, valuePadOptions 
        } = options;
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        const dict: Record<string, Array<string>> = {};
        const header = lines[0].split(delimiter).map(col => col.trim());
        const keyIndex = header.indexOf(keyColumn);
        const valueIndex = header.indexOf(valueColumn);
        if (keyIndex === -1 || valueIndex === -1) {
            throw new Error(`Key or value column not found in CSV file.`);
        }
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(delimiter).map(col => col.trim());
            if (line.length > 1) {
                let key = cleanString(
                    line[keyIndex],
                    keyStripOptions, 
                    keyCaseOptions, 
                    keyPadOptions
                );
                let val = cleanString(
                    line[valueIndex],
                    valueStripOptions,
                    valueCaseOptions, 
                    valuePadOptions
                );
                if (!dict[key]) {
                    dict[key] = [];
                }
                if (!dict[key].includes(val)) {
                    dict[key].push(val);
                }
            }
        }
        return dict;
    } catch (err) {
        mlog.error('Error reading or parsing the CSV file:', err, 
            TAB + `Given File Path: "${filePath}"`
        );
        return {} as Record<string, Array<string>>;
    }
}

/**
 * Determines the proper delimiter based on file type or extension
 * @param filePath Path to the file
 * @param fileType Explicit file type or `'auto'` for detection
 * @returns **`extension`** `{`{@link DelimiterCharacterEnum}` | string}` The delimiter character
 */
export function getDelimiterFromFilePath(
    filePath: string, 
    fileType?: DelimitedFileTypeEnum
): DelimiterCharacterEnum | string {
    if (fileType && fileType === DelimitedFileTypeEnum.CSV) return DelimiterCharacterEnum.COMMA;
    if (fileType && fileType === DelimitedFileTypeEnum.TSV) return DelimiterCharacterEnum.TAB;
    
    // Auto-detect based on file extension
    const extension = getExtensionFromFilePath(filePath).toLowerCase();
    if (extension === DelimitedFileTypeEnum.CSV) {
        return DelimiterCharacterEnum.COMMA;
    } else if (extension === DelimitedFileTypeEnum.TSV) {
        return DelimiterCharacterEnum.TAB;
    } else {
        throw new Error(`Unsupported file extension: ${extension}`);
    }
}

/**
 * 
 * @param filePath `string`
 * @param toLowerCase `boolean` - Whether to convert the extension to lowercase
 * @returns **`extension`** `string` - The file extension = last element of `filePath.split('.')`
 */
export function getExtensionFromFilePath(filePath: string, toLowerCase: boolean=true): string {
    const parts = filePath.split('.');
    if (parts.length === 0) {
        return '';
    }
    let extension = parts[parts.length - 1];
    if (toLowerCase) {
        extension = extension.toLowerCase();
    }
    return extension;
}


/**
 * @param filePath `string`
 * @returns **`jsonData`** — `Array<string>`
 */
export function readFileLinesIntoArray(filePath: string): Array<string> {
    const result: string[] = [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                result.push(line.trim());
            }
        }
    } catch (err) {
        mlog.error('Error reading the file:', err);
    }
    return result;
}

/**
 * @param filePath `string`
 * @returns **`jsonData`** — `Record<string, any> | null` - JSON data as an object or null if an error occurs
 */
export function readJsonFileAsObject(filePath: string): Record<string, any> | null {
    filePath = validateFileExtension(filePath, 'json').validatedFilePath;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        mlog.error('Error reading or parsing the JSON file:', err, 
            '\n\t Given File Path:', '"' + filePath + '"');
        return null;
    }
}


/**
 * @param filePath `string`
 * @param expectedExtension `string`
 * @returns **`result`**: {@link FileExtensionResult} = `{ isValid`: `boolean`, `validatedFilePath`: `string }`
 */
export function validateFileExtension(filePath: string, expectedExtension: string): FileExtensionResult {
    let isValid = false;
    let validatedFilePath = filePath;
    if (filePath && filePath.endsWith(`.${expectedExtension}`)) {
        isValid = true;
    } else {
        validatedFilePath = `${filePath}.${stripCharFromString(expectedExtension, UNCONDITIONAL_STRIP_DOT_OPTIONS)}`;
    }
    return { isValid, validatedFilePath };
}