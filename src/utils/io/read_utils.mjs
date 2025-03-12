import fs from 'fs';


/**
 * 
 * @param {string} filePath string
 * @returns {Array<string>} jsonData — Array<string>
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
 * @returns {Object.<string, any>} jsonData — Object.<string, any>
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
 * 
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