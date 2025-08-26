/**
 * @file src/config/dataLoader.ts
 */
import { STOP_RUNNING, isEnvironmentInitialized, 
    getDataLoaderConfigurationFile, 
    getResourceFolderConfiguration
} from "./env";
import { mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL,
    simpleLogger as slog 
} from "./setupLog";
import { 
    getDirectoryFiles,
    getOneToManyDictionary,
    isDirectory,
    readJsonFileAsObject as read 
} from "typeshi:utils/io/reading";
import { 
    isNonEmptyArray, hasKeys, isNonEmptyString, isNullLike, 
    isStringArray 
} from "typeshi:utils/typeValidation";
import type { CleanStringOptions, StringPadOptions } from "typeshi:utils/regex/types/StringOptions";
import path from "node:path";
import * as validate from "typeshi:utils/argumentValidation";
import { extractFileName } from "@typeshi/regex";
import inquirer from "inquirer";
import { existsSync } from "node:fs";
import { CrmData, 
    DataDomainEnum, 
    DataSourceDictionary, isDataSourceDictionary,
    ObjectPropertyDictionary, 
    TerritoryData, 
    TerritorySourceFileConfig, isTerritorySourceFileConfig,
    LoadTerritoryDataOptions, TerritoryFlowConfig, isTerritoryFlowConfig, 
    isLoadTerritoryDataOptions
} from "src/config/types";

const F = extractFileName(__filename);
let dataDir: string | null = null;
let dataInitialized = false;

let dataSources: DataSourceDictionary | null = null;



/* -------------------------- LOAD CRM CONFIG ------------------------------ */
/** required keys of {@link ObjectPropertyDictionary} */
const OBJECT_PROPERTY_FILE_KEYS = [
    'DEFAULT_CONTACT_PROPERTIES',
    'DEFAULT_DEAL_PROPERTIES',
    'DEFAULT_LINE_ITEM_PROPERTIES',
    'VALID_DEAL_STAGES',
    'INVALID_DEAL_STAGES',
    'DEFAULT_ADDRESS_PROPERTIES',
    'SHIPPING_ADDRESS_PROPERTIES',
    'BILLING_ADDRESS_PROPERTIES',
];

let crmData: CrmData | null = null;

/* ---------------------- LOAD AUTOMATION CONFIG -------------------------- */
let territoryData: TerritoryData | null = null;
let branchDictionary: Record<string, string> | null = null;

/* ------------------------- MAIN FUNCTION ----------------------------- */
const DEFAULT_DOMAINS = [
    DataDomainEnum.CRM,
    DataDomainEnum.AUTOMATION,
];
/**
 * Initialize all data required by the application.
 * This should be called once at the start of the application.
 */
export async function initializeData(...domains: DataDomainEnum[]): Promise<void> {
    const source = `[${F}.${initializeData.name}()]`;
    if (!isEnvironmentInitialized()) {
        mlog.error(`${source} called before environment initialization!`)
        throw new Error(`Please call initializeEnvironment() before initializeData()`)
    }
    if (dataInitialized) {
        mlog.info(`${source} Data already initialized, skipping...`);
        return;
    }
    dataDir = (await getResourceFolderConfiguration()).dataDir;
    validate.existingDirectoryArgument(source, {dataDir});
    const dataSourceDictionaryFile = await getDataLoaderConfigurationFile();
    validate.existingFileArgument(source, '.json', {dataSourceDictionaryFile});
    dataSources = read(dataSourceDictionaryFile) as DataSourceDictionary;
    validate.objectArgument(source, {dataSources, isDataSourceDictionary});
    // validate that keys of dataSources are child folders of dataDir
    for (let domain in dataSources) {
        let expectedDirPath = path.join(dataDir, domain);
        validate.existingDirectoryArgument(source, {[`dataDir/${domain}`]: expectedDirPath});
    }
    const crmSourceDict = dataSources[DataDomainEnum.CRM];
    let productCategoryFilePath = path.join(
        dataDir, DataDomainEnum.CRM, crmSourceDict["productCategory"]
    );
    let objectPropertiesFilePath = path.join(
        dataDir, DataDomainEnum.CRM, crmSourceDict["objectProperties"]
    );
    const automationSourceDict = dataSources[DataDomainEnum.AUTOMATION];
    let territoryConfigFilePath = path.join(
        dataDir, DataDomainEnum.AUTOMATION, automationSourceDict["territoryConfig"]
    );
    let branchDictionaryFilePath = path.join(
        dataDir, DataDomainEnum.AUTOMATION, automationSourceDict["branchDictionary"]
    );
    validate.multipleExistingFileArguments(source, '.json', {
        productCategoryFilePath, objectPropertiesFilePath, 
        territoryConfigFilePath, branchDictionaryFilePath
    });
    if (!domains || domains.length === 0) {
        domains.push(...DEFAULT_DOMAINS)
    }
    mlog.info(`${source} Starting data initialization...`);
    try {
        for (const d of domains) {
            switch (d) {
                case DataDomainEnum.CRM:
                    crmData = {
                        productCategoryDictionary: await loadProductCategoryDictionary(productCategoryFilePath),
                        objectPropertyDictionary: await loadObjectPropertyDictionary(objectPropertiesFilePath),
                    }
                    break;
                case DataDomainEnum.AUTOMATION:
                    branchDictionary = await loadBranchDictionary(branchDictionaryFilePath);
                    territoryData = await loadTerritoryData(territoryConfigFilePath, branchDictionary);
                    break;
                default:
                    mlog.warn(`${source} Unrecognized domain: '${d}'. Skipping...`);
                    continue;
            }
        }
        dataInitialized = true;
        slog.info(`${source} ✓ All data initialized successfully`)
    } catch (error) {
        mlog.error(`${source} ✗ Failed to initialize data:`, error);
        STOP_RUNNING(1, `Data initialization failed`);
    }
}

async function loadProductCategoryDictionary(
    jsonPath: string
): Promise<Record<string, Set<string>>> {
    const source = `[${F}.${loadProductCategoryDictionary.name}()]`;
    validate.existingFileArgument(source, '.json', {jsonPath});
    let categoryData = read(jsonPath) as Record<string, string[]>;
    if (isNullLike(categoryData)) {
        throw new Error([`${source} Invalid category data at '${jsonPath}'`,
            `Expected json object of form { "category1": ["sku1", "sku2"], ... }`
        ].join(TAB));
    }
    const categorySetData: Record<string, Set<string>> = {};
    for (const [category, skus] of Object.entries(categoryData)) {
        if (!isNonEmptyArray(skus)) {
            mlog.warn(`${source} Category "${category}" has no SKUs or is not an array.`);
            continue;
        }
        categorySetData[category] = new Set(skus);
        slog.info(`\tLoaded Category "${category}" with ${skus.length} SKU(s)`);
    }
    return categorySetData;
}

async function loadObjectPropertyDictionary(
    jsonPath: string
): Promise<ObjectPropertyDictionary> {
    const source = `[${F}.${loadObjectPropertyDictionary.name}()]`;
    validate.existingFileArgument(source, '.json', {jsonPath});
    let propDict = read(jsonPath) as Record<string, string[]>;
    if (!hasKeys(propDict, OBJECT_PROPERTY_FILE_KEYS, true)) {
        let message = [`${source} ERROR: json file is missing required properties`,
            `Expected: ${JSON.stringify(OBJECT_PROPERTY_FILE_KEYS)} (each mapped to array of strings)`,
            `Received: ${JSON.stringify(Object.keys(propDict))}`,
        ].join(TAB);
        mlog.error(message);
        throw new Error(message);
    }
    for (const objectType of OBJECT_PROPERTY_FILE_KEYS) {
        if (!isStringArray(propDict[objectType])) {
            throw new Error(
                `${source} Invalid key '${objectType}' in default properties file at '${jsonPath}'`
            );
        }
    }
    return propDict as ObjectPropertyDictionary;
}

/** 
 * @consideration (to do later) should also validate that the array of props in config.flows[i].regionZipProps
 *  & territoryZipProperties are valid properties of target objects in HubSpot
 * - can probably use api to get all props of an objectType
 */
async function loadTerritoryData(
    configPath: string,
    branchDict: Record<string, string>
): Promise<TerritoryData> {
    const source = `[${F}.${loadTerritoryData.name}()]`;
    slog.info(`${source} START`)
    if (!isNonEmptyString(dataDir) || !isDirectory(dataDir)) {
        throw new Error([`${source} Invalid dataDir (undefined or not valid directory)`,
            ` -> call initializeData first or check project.config file`
        ].join(TAB))
    }
    validate.objectArgument(source, {branchDict});
    validate.existingFileArgument(source, '.json', {configPath}); // redundant...
    slog.info(`\tLoading territory config options from '${configPath}'`);
    let config = read(configPath) as LoadTerritoryDataOptions;
    validate.objectArgument(source, {config, isLoadTerritoryDataOptions});
    let automationDataDir = path.join(dataDir, DataDomainEnum.AUTOMATION);
    validate.existingDirectoryArgument(source, {automationDataDir});
    const { sourceOptions } = config;
    let potentialSourceFiles = getDirectoryFiles(
        automationDataDir, ...['.xlsx'] // '.tsv', '.csv', 
    ).filter(filePath=>
        filePath.toLowerCase().includes(sourceOptions.fileNamePrefix.toLowerCase())
    );
    
    const selectedFilePath = await promptForFileSelection(potentialSourceFiles, automationDataDir);
    slog.info(`\tSelected file: '${selectedFilePath}'`);
    const eastTerritoryDict = await getRegionDictionary(
        selectedFilePath, sourceOptions, sourceOptions.eastRegionSheetName
    );
    const eastZips = Object.values(eastTerritoryDict).flat().sort();
    const westTerritoryDict = await getRegionDictionary(
        selectedFilePath, sourceOptions, sourceOptions.westRegionSheetName
    );
    const westZips = Object.values(westTerritoryDict).flat().sort();
    const compositeTerritoryDict = {
        ...eastTerritoryDict,
        ...westTerritoryDict
    };
    const regionDict: { [regionBranchName: string]: string[] } = {
        'East': eastZips,
        'West': westZips
    };
    /**keys in composite dict but not in branch dict */
    const missingKeys: string[] = (Object.keys(compositeTerritoryDict)
        .filter(territoryKey=>!hasKeys(branchDict, territoryKey))
    );    
    if (missingKeys.length > 0) {
        mlog.error(`${source} Found ${missingKeys.length} Territory Name(s) not in branchDict: { [territoryName: string]: string }`,
            TAB+`The following keys exist in compositeTerritoryDict but not in branchDict:`, 
            JSON.stringify(missingKeys),
        );
        STOP_RUNNING(1);
    }
    slog.info(`${source} ✓ Territory data loaded successfully`);
    let data: TerritoryData = {
        filePath: selectedFilePath,
        branchDict,
        flows: config.flows,
        eastTerritoryDict,
        eastZips,
        westTerritoryDict,
        westZips,
        compositeTerritoryDict,
        regionDict,
    }
    return data;
}

async function getRegionDictionary(
    filePath: string, 
    sourceOptions: TerritorySourceFileConfig, 
    sheetName?: string
): Promise<Record<string, string[]>> {
    const source = `[${F}.${loadTerritoryData.name}()]`;
    validate.existingFileArgument(source, ['.tsv', '.csv', '.xlsx'], {filePath});
    const valueOptions: CleanStringOptions = {
        pad: {
            padLength: 5,
            padChar: '0',
            padLeft: true
        } as StringPadOptions
    }
    const dict = await getOneToManyDictionary(
        filePath, 
        sourceOptions.territoryColumn, 
        sourceOptions.zipColumn,
        undefined,
        valueOptions,
        sheetName
    );
    for (let territory in dict) {
        let zips = dict[territory];
        if (!isNonEmptyString(territory) && isNonEmptyArray(zips)) {
            mlog.warn([`${source} Encountered zips assigned to an invalid territory name`,
                `sheetName: '${sheetName}'`,
                `territory: '${territory}' (empty or not a string)`,
                `zips: ${JSON.stringify(zips)}`
            ].join(TAB));
        }
        if (!isNonEmptyArray(zips)) {
            mlog.warn([`${source} Encountered territory with no associated zips`,
                `sheetName: '${sheetName}'`,
                `territory: '${territory}'`
            ].join(TAB));
            continue;
        }
        dict[territory].sort();
    }
    return dict;
};

/**
 * @consideration add params for flowIds 
 * so can getFlowById(flowId) and check if flow contains expected branch names
 * @returns **`branchDictionary`** `Promise<{ [territoryName: string]: string }>`
 * @keys `territoryName` `string` values from territory column in source file
 * @values `branchName` `string` the name of branches in target workflow on HubSpot
 */
async function loadBranchDictionary(
    jsonPath: string
): Promise<{ [territoryName: string]: string }> {
    const source = `[${F}.${loadBranchDictionary.name}()]`;
    validate.existingFileArgument(source, '.json', {jsonPath});
    let dict = read(jsonPath) as Record<string, string>;
    for (let key in dict) { // validate all string entries
        if (!isNonEmptyString(key)) {
            mlog.error(`${source} Invalid key in json data`)
            throw new Error([`${source} Invalid key in provided json file`,
                `Expected: every key is non-empty string`,
                `Received: ${typeof key} = '${key}`
            ].join(NL))
        }
        let value = dict[key];
        if (!isNonEmptyString(value)) {
            mlog.error(`${source} Invalid value in json data`)
            throw new Error([`${source} Invalid value in provided json file`,
                `Expected: every value is non-empty string`,
                `Received: ${typeof value} = '${value}`
            ].join(NL));
        }
    }
    return dict;
}

/**
 * `sync`
 * @returns **`territoryData`** {@link TerritoryData}
 */
export function getTerritoryData(): TerritoryData {
    if (!dataInitialized || !territoryData) {
        throw new Error('[dataLoader.getTerritoryData()] Territory data not initialized. Call initializeData() first.');
    }
    return territoryData;
}



/**
 * `sync`
 * @returns **`CATEGORY_TO_SKU_DICT`** = `Record<string, Set<string>>` 
 * = `{ [category: string]: Set<string> }`
 */
export function getCategoryToSkuDict(): Record<string, Set<string>> {
    if (!dataInitialized || !crmData || !crmData.productCategoryDictionary) {
        throw new Error('[dataLoader.getCategoryToSkuDict()] Category to SKU dictionary not initialized. Call initializeData() first.');
    }
    return crmData.productCategoryDictionary;
}

/**
 * `sync`
 * @returns **`ObjectPropertyDictionary`** {@link ObjectPropertyDictionary} 
 */
export function getObjectPropertyDictionary(): ObjectPropertyDictionary {
    if (!dataInitialized || !crmData || !crmData.objectPropertyDictionary) {
        throw new Error('[dataLoader.getObjectPropertyDictionary()] Object property dictionary not initialized. Call initializeData() first.');
    }
    return crmData.objectPropertyDictionary;
}

/**
 * `sync`
 * @returns 
 */
export function getCrmData(): CrmData {
    if (!dataInitialized || !crmData) {
        throw new Error('[dataLoader.getCrmData()] CRM data not initialized. Call initializeData() first.');
    }
    return crmData;
}


export function isDataInitialized(): boolean {
    return dataInitialized;
}


/**
 * Prompts the user to select a file from the potential source files or browse for a different one
 */
export async function promptForFileSelection(
    potentialSourceFiles: string[], 
    searchDirectory: string
): Promise<string> {
    const source = `[${F}.${promptForFileSelection.name}()]`;
    if (potentialSourceFiles.length === 0) {
        mlog.warn(`${source} No matching files found in directory. Prompting for manual file selection.`);
        return await promptForManualFileSelection(searchDirectory);
    }
    // Create choices array with file names and a browse option
    const choices = [
        ...potentialSourceFiles.map(filePath => ({
            name: `📄 ${path.basename(filePath)} (${path.relative(searchDirectory, filePath)})`,
            value: filePath
        })),
        {
            name: '📁 Browse for a different file...',
            value: '__BROWSE__'
        }
    ];
    const { selectedFile } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedFile',
            message: 'Select a territory source file:',
            choices,
            pageSize: 10
        }
    ]);
    
    if (selectedFile === '__BROWSE__') {
        return await promptForManualFileSelection(searchDirectory);
    }
    
    return selectedFile;
}

/**
 * Prompts the user to manually enter a file path with validation
 */
async function promptForManualFileSelection(searchDirectory: string): Promise<string> {
    const source = `[${F}.${promptForManualFileSelection.name}()]`;
    const { filePath } = await inquirer.prompt([
        {
            type: 'input',
            name: 'filePath',
            message: `Enter the full path to your territory source file (or relative to ${searchDirectory}):`,
            validate: (input: string) => {
                if (!input.trim()) {
                    return 'Please enter a file path.';
                }
                // Try both absolute and relative paths
                let fullPath = path.isAbsolute(input) ? input : path.join(searchDirectory, input);
                
                if (!existsSync(fullPath)) {
                    return `File not found: ${fullPath}`;
                }
                // Check if it's a supported file type
                const ext = path.extname(fullPath).toLowerCase();
                if (!['.tsv', '.csv', '.xlsx'].includes(ext)) {
                    return 'File must be a .tsv, .csv, or .xlsx file.';
                }
                
                return true;
            },
            transformer: (input: string) => {
                // Show the resolved path as user types
                if (input.trim() && !path.isAbsolute(input)) {
                    return `${input} → ${path.join(searchDirectory, input)}`;
                }
                return input;
            }
        }
    ]);
    
    // Resolve to absolute path
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(searchDirectory, filePath);
    slog.info(`${source} User selected file: ${resolvedPath}`);
    return resolvedPath;
}


