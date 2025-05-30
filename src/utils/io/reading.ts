/**
 * @file src/utils/io/reading.ts
 */
import fs from 'fs';
import xlsx from 'xlsx';
import { FileExtensionResult, ParseOneToManyOptions, StringPadOptions, StringCaseOptions } from './types/Reading';
import { DelimitedFileTypeEnum, DelimiterCharacterEnum as DelimiterCharacters } from './types/Csv';
import { stripChar, cleanString } from './regex';

/**
 * 
 * @param {string} filePath `string`
 * @returns {Array<string>} `jsonData` — `Array<string>`
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
        console.error('Error reading the file:', err);
    }
    return result;
}

/**
 * 
 * @param {string} filePath `string`
 * @returns {Record<string, any> | null} `jsonData` — `Record<string, any> | null` - JSON data as an object or null if an error occurs
 */
export function readJsonFileAsObject(filePath: string): Record<string, any> | null {
    filePath = validateFileExtension(filePath, 'json').validatedFilePath;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading or parsing the JSON file:', err, 
            '\n\t Given File Path:', '"' + filePath + '"');
        return null;
    }
}


/**
 * @param {string} filePath `string`
 * @param {string} expectedExtension `string`
 * @returns `result`: {@link FileExtensionResult} = `{ isValid`: `boolean`, `validatedFilePath`: `string }`
 */
export function validateFileExtension(filePath: string, expectedExtension: string): FileExtensionResult {
    let isValid = false;
    let validatedFilePath = filePath;
    if (filePath && filePath.endsWith(`.${expectedExtension}`)) {
        isValid = true;
    } else {
        validatedFilePath = `${filePath}.${stripChar(expectedExtension, '.', true)}`;
    }
    return { isValid, validatedFilePath };
}

/**
 * @param {string} filePath `string`
 * @param {string} sheetName `string`
 * @param {string} keyColumn `string`
 * @param {string} valueColumn `string`
 * @param {ParseOneToManyOptions} options - {@link ParseOneToManyOptions}
 * = `{ keyCaseOptions`?: {@link StringCaseOptions}, `valueCaseOptions`?: {@link StringCaseOptions}, `keyPadOptions`?: {@link StringPadOptions}, `valuePadOptions`?: {@link StringPadOptions} `}`
 * - {@link StringCaseOptions} = `{ toUpper`?: `boolean`, `toLower`?: `boolean`, `toTitle`?: `boolean }`
 * - {@link StringPadOptions} = `{ padLength`: `number`, `padChar`?: `string`, `padLeft`?: `boolean`, `padRight`?: `boolean }`
 * @returns {Record<string, Array<string>>} `dict`: `Record<string, Array<string>>` — key-value pairs where key is from `keyColumn` and value is an array of values from `valueColumn`
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
        const { keyCaseOptions, valueCaseOptions, keyPadOptions, valuePadOptions } = options;
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);
        const dict: Record<string, Array<string>> = {};
        jsonData.forEach(row => {
            let key: string = cleanString(
                String(row[keyColumn]), 
                keyCaseOptions, keyPadOptions
            ).trim().replace(/\.$/, '');
            let val: string = cleanString(
                String(row[valueColumn]), 
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
        console.error('Error reading or parsing the Excel file:', err, 
            '\n\t Given File Path:', '"' + filePath + '"');
        return {} as Record<string, Array<string>>;
    }
}

/**
 * 
 * @param filePath `string`
 * @param keyColumn `string`
 * @param valueColumn `string`
 * @param delimiter {@link DelimiterCharacters} | `string`
 * @param options {@link ParseOneToManyOptions}
 * = `{ keyCaseOptions`?: {@link StringCaseOptions}, `valueCaseOptions`?: {@link StringCaseOptions}, `keyPadOptions`?: {@link StringPadOptions}, `valuePadOptions`?: {@link StringPadOptions} `}`
 * - {@link StringCaseOptions} = `{ toUpper`?: `boolean`, `toLower`?: `boolean`, `toTitle`?: `boolean }`
 * - {@link StringPadOptions} = `{ padLength`: `number`, `padChar`?: `string`, `padLeft`?: `boolean`, `padRight`?: `boolean }`
 * @returns `Record<string, Array<string>>` - key-value pairs where key is from `keyColumn` and value is an array of values from `valueColumn`
 */
export function parseCsvForOneToMany(
    filePath: string,
    keyColumn: string,
    valueColumn: string,
    delimiter: DelimiterCharacters | string = DelimiterCharacters.COMMA,
    options: ParseOneToManyOptions = {},
): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        DelimitedFileTypeEnum.CSV
    ).validatedFilePath;
    try {
        const { keyCaseOptions, valueCaseOptions, keyPadOptions, valuePadOptions } = options;
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
                    keyCaseOptions, 
                    keyPadOptions
                );
                let val = cleanString(
                    line[valueIndex], 
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
        console.error('Error reading or parsing the CSV file:', err, 
            '\n\t Given File Path:', '"' + filePath + '"');
        return {} as Record<string, Array<string>>;
    }
}

/**
 * Determines the proper delimiter based on file type or extension
 * @param filePath Path to the file
 * @param fileType Explicit file type or `'auto'` for detection
 * @returns `extension` `{`{@link DelimiterCharacters}` | string}` The delimiter character
 */
export function getDelimiterFromFilePath(
    filePath: string, 
    fileType?: DelimitedFileTypeEnum
): DelimiterCharacters | string {
    if (fileType && fileType === DelimitedFileTypeEnum.CSV) return DelimiterCharacters.COMMA;
    if (fileType && fileType === DelimitedFileTypeEnum.TSV) return DelimiterCharacters.TAB;
    
    // Auto-detect based on file extension
    const extension = getExtensionFromFilePath(filePath).toLowerCase();
    if (extension === DelimitedFileTypeEnum.CSV) {
        return DelimiterCharacters.COMMA;
    } else if (extension === DelimitedFileTypeEnum.TSV) {
        return DelimiterCharacters.TAB;
    } else {
        throw new Error(`Unsupported file extension: ${extension}`);
    }
}

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



