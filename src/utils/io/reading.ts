/**
 * @file src/utils/io/reading.ts
 */
import fs from 'fs';
import xlsx from 'xlsx';
import { FileExtensionResult } from './types/Reading';
import { DelimitedFileTypeEnum, DelimiterCharacterEnum as DelimiterCharacters } from './types/Csv';
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
export function readJsonFileAsObject(filePath: string): Record<string, any> | null {
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
 * @param {boolean} padValue `boolean` - whether to pad the value with leading zeros (when dealing with zip codes)
 * @returns {Record<string, Array<string>>} `dict`: `Record<string, Array<string>>` — key-value pairs where key is from `keyColumn` and value is an array of values from `valueColumn`
 */
export function parseExcelForOneToMany(
    filePath: string, 
    sheetName: string, 
    keyColumn: string, 
    valueColumn: string,
    padValue: boolean = true
): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        'xlsx'
    ).validatedFilePath;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);
    const dict: Record<string, Array<string>> = {};
    jsonData.forEach(row => {
        let key = row[keyColumn];
        key = `${key}`.trim().replace(/\.$/, '');
        let val = row[valueColumn];
        val = `${val}`.trim().replace(/\.$/, '');// .padStart(5, '0');
        if (padValue) {
            val = val.padStart(5, '0');
        }
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
 * 
 * @param {string} filePath `string`
 * @param {string} keyColumn `string`
 * @param {string} valueColumn `string`
 * @param {string} delimiter {@link DelimiterCharacters} | `string` defaults to {@link DelimiterCharacters.COMMA} = `","`
 * @param {boolean} padValue `boolean` - whether to pad the value with leading zeros (when dealing with zip codes)
 * @returns `dict` =  `Record<string, Array<string>>`
 */
export function parseCsvForOneToMany(
    filePath: string,
    keyColumn: string,
    valueColumn: string,
    delimiter: DelimiterCharacters | string = DelimiterCharacters.COMMA,
    padValue: boolean = true
): Record<string, Array<string>> {
    filePath = validateFileExtension(
        filePath, 
        'csv'
    ).validatedFilePath;
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
            let key = line[keyIndex];
            key = `${key}`.trim().replace(/\.$/, '');
            let val = line[valueIndex];
            val = `${val}`.trim().replace(/\.$/, '');
            if (padValue) {
                val = val.padStart(5, '0');
            }
            if (!dict[key]) {
                dict[key] = [];
            }
            if (!dict[key].includes(val)) {
                dict[key].push(val);
            }
        }
    }
    return dict;
}


/**
 * Determines the proper delimiter based on file type or extension
 * @param filePath Path to the file
 * @param fileType Explicit file type or `'auto'` for detection
 * @returns `extension` `{`{@link DelimiterCharacters}` | string}` The delimiter character
 */
export function getDelimiterFromFilePath(filePath: string, fileType?: DelimitedFileTypeEnum): DelimiterCharacters | string {
    if (fileType && fileType === DelimitedFileTypeEnum.CSV) return DelimiterCharacters.COMMA;
    if (fileType && fileType === DelimitedFileTypeEnum.TSV) return DelimiterCharacters.TAB;
    
    // Auto-detect based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (extension === DelimitedFileTypeEnum.CSV) {
        return DelimiterCharacters.COMMA;
    } else if (extension === DelimitedFileTypeEnum.TSV) {
        return DelimiterCharacters.TAB;
    } else {
        throw new Error(`Unsupported file extension: ${extension}`);
    }
}



