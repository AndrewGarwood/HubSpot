import fs from 'fs';
import dotenv from 'dotenv';
import { getCurrentPacificTime } from './date_utils.mjs';
import { validateFileExtension } from './read_utils.mjs';

dotenv.config();

/**
 * @param {ListToCSVConfig} ParamObject ListToCSVConfig = { listData, additionalDelimiter, fileName, filePath }
 * @param {Object.<string, Array<string>>} listData Object.<string, Array\<string>> map col names to col values
 * @param {string} additionalDelimiter string
 * @param {string} fileName string
 * @param {string} filePath string
 */
export function writeListsToCsv({
    listData,
    fileName='csv_output',
    filePath=process.env.DEFAULT_OUTPUT_DIR,
    delimiter=',',
    delimiterColumn='',  
} = {}) {
    const fileExtension = '';
    if (delimiter === ',') {
        fileExtension = 'csv';
    } else if (delimiter === '\t') {
        fileExtension = 'tsv';
    }
    const outputAddress = `${filePath}/${fileName}.${fileExtension}`;
    const listNames = Object.keys(listData);
    const listValues = Object.values(listData);

    // Get the maximum length of the lists
    const maxLength = Math.max(...listValues.map(list => list.length));
    let csvContent = listNames.join(delimiter) + '\n'; // Header row
    
    if (delimiterColumn && delimiterColumn.length > 0) {
        delimiter = delimiter + delimiterColumn + delimiter;
    }
    for (let i = 0; i < maxLength; i++) {
        const row = listValues.map(list => list[i] || '').join(delimiter);
        csvContent += row + '\n';
    }
    
    fs.writeFile(outputAddress, csvContent, (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
        } else {
            console.log(`CSV file has been saved to ${outputAddress}`);
        }
    });
}

/**
 * Output JSON data to a file
 * @param {WriteJsonConfig} ParamObject WriteJsonConfig = { data, filePath, indent, enableOverwrite }
 * @param {Object.<string, any>} data Object.<string, any> 
 * @param {string} filePath string - optional, default=process.env.DEFAULT_OUTPUT_DIR/output.json
 * @param {number} indent number - optional, default=4
 * @param {boolean} enableOverwrite boolean - optional, default=false
 */
export function writeToJsonFile({
    data, 
    filePath=`${process.env.DEFAULT_OUTPUT_DIR}/output.json`,
    indent=4,
    enableOverwrite=false
} = {}) {
    filePath = validateFileExtension({filePath: filePath, expectedExtension: 'json'}).validatedFilePath;
    const jsonData = JSON.stringify(data, null, indent);
    if (enableOverwrite) {
        fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
                console.error('Error writing to JSON file', err);
            }
        });
    } else {
        fs.appendFile(filePath, jsonData, (err) => {
            if (err) {
                console.error('Error appending to JSON file', err);
            }
        });
    };

}

/**
 * Output JSON data to the console
 * @param {JsonPrintConfig} ParamObject JsonPrintConfig = { data, indent }
 * @param {Object.<string, any>} data Object.<string, any>
 * @param {number} indent number - optional, default=4 
 */
export function printJson({data, indent=4}={}) {
    try {
        console.log(JSON.stringify(data, null, indent));
    } catch (e) {
        console.error(e);
    }
}

/**
 * 
 * @param {ConsoleGroup} ParamObject ConsoleGroup = { label, logStatements, collapse, printToConsole, printToFile, filePath }
 * @param {string} label string
 * @param {Array<string>} logStatements string[] - log each string in arr on new line
 * @param {boolean} collapse boolean - optional, default=false
 * @param {number} numTabs number - optional, default=1
 * @param {boolean} printToConsole boolean - optional, default=true
 * @param {boolean} printToFile boolean - optional, default=true
 * @param {string} filePath string - optional, default=process.env.DEFAULT_OUTPUT_PATH
 */
export function printConsoleGroup({
    label = 'Group Name', 
    logStatements = [],
    collapse = false,
    numTabs = 0,
    printToConsole = true,
    printToFile = true,
    filePath = `${process.env.DEFAULT_OUTPUT_DIR}/DEFAULT_LOG.txt`,
    enableOverwrite = false
} = {}) {
    let labelOffset = '\t'.repeat(numTabs);
    let bodyOffset = '\t'.repeat(numTabs + 1);
    label = labelOffset + `[${getCurrentPacificTime()}] ` + label
    if (printToConsole) {
        if (collapse) {
            console.groupCollapsed(label);
        } else {
            console.group(label);
        }
        logStatements.forEach(statement => console.log(statement));
        console.groupEnd();
    }
    if (printToFile) {
        filePath = validateFileExtension({filePath: filePath, expectedExtension: 'txt'}).validatedFilePath;
        if (enableOverwrite) {
            fs.writeFile(
                filePath, 
                '\n' + labelOffset + label + '\n' + bodyOffset + logStatements.join('\n' + bodyOffset), 
                (err) => {
                    if (err) {
                        console.error('Error writing to file', err);
                    }
                }
            );
        } else {
            fs.appendFile(
                filePath, 
                '\n' + labelOffset + label + '\n' + bodyOffset + logStatements.join('\n' + bodyOffset), 
                (err) => {
                    if (err) {
                        console.error('Error appending to file', err);
                    }
                }
            );
        }
    }
}