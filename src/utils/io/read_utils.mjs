import fs from 'fs';
import xlsx from 'xlsx';

/**
 * 
 * @param {string} filePath string
 * @returns {Array<string>} jsonData — Array\<string>
 */
export function readFileLinesIntoArray(filePath) {
    const result = [];
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
 * @returns {Object.<string, any> | null} jsonData — Object.<string, any>
 */
export function getJsonFromFile(filePath) {
    filePath = validateFileExtension({filePath: filePath, expectedExtension: 'json'}).validatedFilePath;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading or parsing the JSON file:', err);
        return null;
    }
}


/**
 * 
 *- isValid: boolean, - true if the filePath has the expected extension, false otherwise
 *- validatedFilePath: string - the filePath with the expected extension if it was missing, otherwise the original filePath
 * @typedef {Object} FileExtensionResult
 * @property {boolean} isValid 
 * @property {string} validatedFilePath 
 */

/**
 * 
 * @param {FileExtensionConfig} ParamObject FileExtensionConfig = { filePath, expectedExtension }
 * @param {string} filePath string
 * @param {string} expectedExtension string
 * @returns {FileExtensionResult} FileExtensionResult = { isValid: boolean, validatedFilePath: string }
 */
export function validateFileExtension({filePath, expectedExtension}={}) {
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
 * @param {string} filePath string
 * @param {string} sheetName string
 * @param {string} keyColumn string
 * @param {string} valueColumn string
 * @returns {Object.<string, Array<string>>} dict: Object.<string, Array\<string>> — key-value pairs where key is from keyColumn and value is an array of values from valueColumn
 */
export function parseExcelForOneToMany(filePath, sheetName, keyColumn, valueColumn) {
    filePath = validateFileExtension({
        filePath: filePath, 
        expectedExtension: 'xlsx'
    }).validatedFilePath;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const dict = {};
    jsonData.forEach(row => {
        let key = row[keyColumn];
        key = `${key}`.trim().replace(/\.$/, '');
        let val = row[valueColumn];
        val = `${val}`.trim().replace(/\.$/, '');
        if (!dict[key]) {
            dict[key] = [];
        }
        dict[key].push(val);
    });
    return dict;
}

/**
 * @TODO if escape === true, escape all special characters in char (i.e. append \\ to them)
 * @param {string} s string
 * @param {string} char string
 * @param {boolean} escape boolean
 * @returns {string}
 */
export function stripChar(s, char, escape=false) {
    if (escape) {
        char = '\\' + char;
    }
    const regex = new RegExp(`^${char}+|${char}+$`, 'g');
    return s.replace(regex, '');
}