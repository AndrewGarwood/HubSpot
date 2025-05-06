/**
 * @file src/utils/io/reading.ts
 */
import fs from 'fs';
import xlsx from 'xlsx';
import { FileExtensionResult } from './types/Reading';
import { DelimitedFileTypeEnum, DelimiterCharacterEnum as DELIMITERS } from './types/Csv';
import { stripChar } from './regex';

/**
 * 
 * @param {string} filePath string
 * @returns {Array<string>} jsonData — Array\<string>
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
 * @param {string} filePath string
 * @returns {Record<string, any> | null} `jsonData` — `Record<string, any> | null` - JSON data as an object or null if an error occurs
 */
export function readJsonFileAsObject(filePath: string): { [s: string]: any; } | null {
    filePath = validateFileExtension(filePath, 'json').validatedFilePath;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading or parsing the JSON file:', err);
        console.error('\tGiven File Path:', '"' + filePath + '"');
        return null;
    }
}


/**
 * @param {string} filePath `string`
 * @param {string} expectedExtension `string`
 * @returns {FileExtensionResult} .{@link FileExtensionResult} = { `isValid`: boolean, `validatedFilePath`: string }
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
 * @returns {Record<string, Array<string>>} `dict`: `Record<string, Array<string>>` — key-value pairs where key is from keyColumn and value is an array of values from valueColumn
 */
export function parseExcelForOneToMany(filePath: string, sheetName: string, keyColumn: string, valueColumn: string): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        'xlsx'
    ).validatedFilePath;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);
    const dict: { [s: string]: Array<string>; } = {};
    jsonData.forEach(row => {
        let key = row[keyColumn];
        key = `${key}`.trim().replace(/\.$/, '');
        let val = row[valueColumn];
        val = `${val}`.trim().replace(/\.$/, '').padStart(5, '0');
        if (!dict[key]) {
            dict[key] = [];
        }
        if (!dict[key].includes(val)) {
            dict[key].push(val);
        }
    });
    return dict;
}


/**
 * Determines the proper delimiter based on file type or extension
 * @param filePath Path to the file
 * @param fileType Explicit file type or `'auto'` for detection
 * @returns `extension` `{`{@link DELIMITERS}` | string}` The delimiter character
 */
export function getDelimiterFromFilePath(filePath: string, fileType?: DelimitedFileTypeEnum): DELIMITERS | string {
    if (fileType && fileType === DelimitedFileTypeEnum.CSV) return DELIMITERS.COMMA;
    if (fileType && fileType === DelimitedFileTypeEnum.TSV) return DELIMITERS.TAB;
    
    // Auto-detect based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === DelimitedFileTypeEnum.CSV) {
        return DELIMITERS.COMMA;
    } else if (extension === DelimitedFileTypeEnum.TSV) {
        return DELIMITERS.TAB;
    } else {
        throw new Error(`Unsupported file extension: ${extension}`);
    }
}



