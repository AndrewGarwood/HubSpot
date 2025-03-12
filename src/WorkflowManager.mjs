import { 
    getJsonFromFile, 
    readFileLinesIntoArray, 
    printJson, 
    printConsoleGroup, 
    writeToJsonFile,
    validateFileExtension 
} from './utils/io/io_utils.mjs';
import { 
    getFlowById, 
    setFlowById, 
    batchUpdateFlowByBranchName, 
    getBranchByName 
} from './utils/auotmation/flows.mjs';
import xlsx from 'xlsx';

const TEST_FLOW_ID = 'TEST_FLOW_ID';

async function main() {
    let flowId = TEST_FLOW_ID;
    let flow = await getFlowById({flowId: flowId});
    // code removed for privacy
    console.log('some logic goes here')
}



/**
 * @TODO use try catch block to handle errors
 * @param {OneToManyConfig} ParamObject OneToManyConfig
 * @param {string} filePath string
 * @param {string} sheetName string
 * @param {string} keyColumn string
 * @param {string} valueColumn string
 * @returns {Object.<string, Array<string>>}
 */
function parseExcelForOneToManyMap({filePath, sheetName, keyColumn, valueColumn}) {
    filePath = validateFileExtension({filePath: filePath, expectedExtension: 'xlsx'}).validatedFilePath;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const resultMap = {};
    jsonData.forEach(row => {
        let key = row[keyColumn];
        key = `${key}`.trim().replace(/\.$/, '');
        let val = row[valueColumn];
        val = `${val}`.trim().replace(/\.$/, '');

        if (!resultMap[key]) {
            resultMap[key] = [];
        }

        resultMap[key].push(val);
    });

    return resultMap;
}