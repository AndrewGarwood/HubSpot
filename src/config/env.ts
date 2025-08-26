/**
 * @file src/config/env.ts
 */
import { 
    ProjectConfiguration, 
    CloudConfiguration, 
    LocalConfiguration, 
    DataLoaderConfiguration,
    isCloudConfiguration,
    isDataLoaderConfiguration,
    isLocalConfiguration,
    isProjectConfiguration,
    AccountDetails, AccountEnvironmentEnum, HubSpotAccountDictionary, ResourceFolderConfiguration
} from "./types";
import { mainLogger, apiLogger, formatLogObj } from "./setupLog";
import { 
    INDENT_LOG_LINE as TAB, NEW_LINE as NL, typeshiLogger as mlog, typeshiSimpleLogger as slog,
} from "typeshi/dist/config/setupLog";
import { extractFileName } from "@typeshi/regex";
import { isDirectory, readJsonFileAsObject as read, indentedStringify } from "@typeshi/io";
import { Client } from "@hubspot/api-client";
import path from "node:path";
import dotenv from "dotenv";
import * as validate from "@typeshi/argumentValidation";
import * as fs from "fs";
import { isNonEmptyString } from "@typeshi/typeValidation";
import { ILogObj, ILogObjMeta } from "tslog";
dotenv.config();
const F = extractFileName(__filename);
let environmentInitialized = false;

export function isEnvironmentInitialized(): boolean {
    return environmentInitialized;
}

export const LOG_FILES: string[] = []

/** `default:` `/HubSpot/{home}` = the directory where package.json and node_modules live */
export const NODE_HOME_DIR = process.cwd() as string;
/** assume directory this file is located in is always NODE_HOME_DIR */
const PROJECT_CONFIG_FILE_NAME = `project.config.json`;
export const USER = process.cwd().split(path.sep)[2];
export const ORGANIZATION = process.env.ORGANIZATION || '';

/* -------------- Environment Variables With Default Values ---------------- */
let nodeEnv = AccountEnvironmentEnum.SANDBOX;
/**
 * @reference `hs account list` after making accounts with `hs auth`
 */
const accountDictionary: HubSpotAccountDictionary = {
    production: {
        id: (process.env.PROD_ACCOUNT_ID || 'MISSING_ENV_VAR-PROD_ACCOUNT_ID'),
        name: (process.env.PROD_ACCOUNT_NAME || 'PRODUCTION_ACCOUNT'),
        type: 'standard',
        accessKey: (process.env.PROD_PERSONAL_ACCESS_KEY 
            || 'MISSING_ENV_VAR-PROD_PERSONAL_ACCESS_KEY' 
        )
    },
    sandbox: {
        id: (process.env.SB_ACCOUNT_ID || 'MISSING_ENV_VAR-SB_ACCOUNT_ID'),
        name: (process.env.SB_ACCOUNT_NAME || 'SANDBOX_ACCOUNT'),
        type: 'standard sandbox',
        accessKey: (process.env.SB_PERSONAL_ACCESS_KEY 
            || 'MISSING_ENV_VAR-SB_PERSONAL_ACCESS_KEY' 
        )
    },
    development: {
        id: (process.env.DEV_ACCOUNT_ID || 'MISSING_ENV_VAR-DEV_ACCOUNT_ID'),
        name: (process.env.SB_ACCOUNT_NAME || 'AG-Dev'),
        type: 'dev account',
        accessKey: (process.env.DEV_PERSONAL_ACCESS_KEY 
            || 'MISSING_ENV_VAR-DEV_PERSONAL_ACCESS_KEY' 
        )
    }
}


/**@TODO conceal these in getter functions ? */
/** `default:` `'C:/Users/${USER}/OneDrive - ${ORGANIZATION}'` */
// let ONE_DRIVE_DIR = `C:/Users/${USER}/OneDrive` 
//     + ORGANIZATION ? `- ${ORGANIZATION}` : '';
// /** `default:` `'C:/Users/${USER}/OneDrive - ${ORGANIZATION}/HubSpot'` */
// let CLOUD_DIR = path.join(ONE_DRIVE_DIR, 'HubSpot');
// /** `default:` `${`{@link CLOUD_DIR}`}/HubSpot/logs`*/
// let LOG_DIR = path.join(CLOUD_DIR, 'logs') as string;
// /** `default:` {@link NODE_HOME_DIR}`/src` = `process.cwd()/src`*/
// let SRC_DIR = path.join(NODE_HOME_DIR, 'src') as string;

// /** `default:` `${`{@link CLOUD_DIR}`}/data`*/
// let DATA_DIR = path.join(CLOUD_DIR, 'data') as string;
// /** `default:` `${`{@link CLOUD_DIR}`}/.output`*/
// let OUTPUT_DIR = path.join(CLOUD_DIR, '.output') as string;

/** 
 * `default:` `null`
 * - assumes this file is located in `NODE_HOME_DIR`
 * - e.g. `'NODE_HOME_DIR/project.data.config.json'`
 * */
let dataLoaderConfigPath: string | null = null;
let projectConfig: ProjectConfiguration | null = null;
let resourceFolderConfiguration: ResourceFolderConfiguration | null = null;
let dataLoaderConfig: DataLoaderConfiguration | null = null;
let accountDetails: AccountDetails = accountDictionary.sandbox;
const DEFAULT_PROJECT_CONFIG_PATH = path.join(NODE_HOME_DIR, PROJECT_CONFIG_FILE_NAME);
export async function initializeEnvironment(
    configPath: string = DEFAULT_PROJECT_CONFIG_PATH,
    makeDirs: boolean = false
): Promise<void> {
    const source = `[${F}.${initializeEnvironment.name}()]`;
    slog.info(`${source} calling loadProjectConfiguration()...`);
    try {
        let config = await loadProjectConfiguration(configPath);
        mlog.info([`${source} Valid ProjectConfiguration file received, unpacking content...`,
            `project name: '${config.name}'`,
            ` environment: '${config.nodeEnv}'`,
        ].join(TAB));
        resourceFolderConfiguration = await loadResourceFolderConfiguration(config, makeDirs);
        await setLogTransports(resourceFolderConfiguration.logDir);
        dataLoaderConfig = await loadDataLoaderConfiguration(config);
        accountDetails = await loadAccountDetails(config);
        projectConfig = config;
        environmentInitialized = true;  
        slog.info(`${source} ✓ Environment initialized successfully!`)
    } catch (error: any) {
        mlog.error([`${source} Environment Initialization failed`, 
            `caught: ${error}`
        ].join(TAB));
        STOP_RUNNING(1, `${source} Environment Initialization failed`);
    }
}

/**
 * - `mainLogger:` attach transport that appends to `logDir/main.txt`
 * - `apiLogger:` attach transport that appends to `logDir/api.txt`
 * @param logDir `string`
 */
async function setLogTransports(logDir: string): Promise<void> {
    const source = `[${F}.${setLogTransports.name}()]`;
    validate.existingDirectoryArgument(source, {logDir});
    let mainLogFile = path.join(logDir, `main.txt`);
    let apiLogFile = path.join(logDir, `api.txt`);
    LOG_FILES.push(mainLogFile, apiLogFile)
    mainLogger.attachTransport((logObj: ILogObj & ILogObjMeta) => {
        fs.appendFileSync(mainLogFile, 
            JSON.stringify(formatLogObj(logObj)) + "\n", 
            { encoding: "utf-8" } as fs.WriteFileOptions
        );
    });
    apiLogger.attachTransport((logObj: ILogObj & ILogObjMeta) => {
        fs.appendFileSync(apiLogFile, 
            JSON.stringify(formatLogObj(logObj)) + "\n", 
            { encoding: "utf-8" } as fs.WriteFileOptions
        );
    });
}


async function loadAccountDetails(
    config: ProjectConfiguration
): Promise<AccountDetails> {
    const source = `[${F}.${loadAccountDetails.name}()]`;
    /**validated previously via isProjectConfiguration in initializeEnvironment() */
    nodeEnv = config.nodeEnv as AccountEnvironmentEnum; 
    switch (nodeEnv) {
        case AccountEnvironmentEnum.PRODUCTION:
            Object.assign(accountDetails, accountDictionary.production);
            break;
        case AccountEnvironmentEnum.SANDBOX:
            Object.assign(accountDetails, accountDictionary.sandbox);
            break;
        case AccountEnvironmentEnum.DEVELOPMENT:
            Object.assign(accountDetails, accountDictionary.development);
            break;
        default:
            throw new Error(`${source} Invalid Environment Variable: 'NODE_ENV' or (config.nodeEnv)`);
    }
    for (const value of [accountDetails.id, accountDetails.accessKey]) {
        if (!value || value.startsWith('MISSING')) {
            throw new Error([`${source} Missing AccountDetails variable(s)`,
                `Expected definition in .env file for AccountDetails variable(s)`,
                `current accountDetails from .env values: ${indentedStringify(accountDetails)}`
            ].join(TAB));
        }
    }
    return accountDetails;
}

/**
 * define path to be used in dataLoader.ts
 */
async function loadDataLoaderConfiguration(
    config: ProjectConfiguration
): Promise<DataLoaderConfiguration> {
    const source = `[${F}.${loadDataLoaderConfiguration.name}()]`;
    dataLoaderConfigPath = path.join(NODE_HOME_DIR, config.dataLoader.configFileName);
    validate.existingFileArgument(source, '.json', {DATA_LOADER_CONFIG_PATH: dataLoaderConfigPath});
    return config.dataLoader as DataLoaderConfiguration
}

async function loadProjectConfiguration(
    configPath: string=path.join(NODE_HOME_DIR, PROJECT_CONFIG_FILE_NAME)
): Promise<ProjectConfiguration> {
    const source = `[${F}.${loadProjectConfiguration.name}()]`;
    validate.existingFileArgument(source, '.json', {configPath});
    let config = read(configPath) as ProjectConfiguration;
    validate.objectArgument(source, {config, isProjectConfiguration});
    return config;
}

/**
 * use config to define folders for retrieving data, writing output, and logging
 */
async function loadResourceFolderConfiguration(
    config: ProjectConfiguration, 
    makeDirs: boolean = false
): Promise<ResourceFolderConfiguration> {
    const source = `[${F}.${loadResourceFolderConfiguration.name}()]`;
    slog.info(`${source} START`);
    let root: string | null = null;
    let folders: ResourceFolderConfiguration | null = null;
    if (isCloudConfiguration(config.cloud)) {
        slog.info(`\tCloudConfiguration detected, setting env variables...`);
        folders = config.cloud;
        root = await getCloudDirectory(config.cloud);
    } else if (isLocalConfiguration(config.local)) {
        slog.info(`\tLocalConfiguration detected, setting env variables...`);
        folders = config.local;
        root = NODE_HOME_DIR;
    } else {
        throw new Error([`${source} Unable to load resource folders from ProjectConfiguration;`
            +`Did not receive valid CloudConfiguration or LocalConfiguration`,
        ].join(NL));
    }
    let logDir = path.join(root, folders.logDir);
    let outDir = path.join(root, folders.outDir);
    let dataDir = path.join(root, folders.dataDir);
    try {
        await validateResourceFolders(source, {logDir, outDir, dataDir}, makeDirs);
        return { logDir, outDir, dataDir } as ResourceFolderConfiguration;
    } catch (error: any) {
        throw new Error(`${source} Unable to load resource folders from configuration, ${error}`)
    }
}

async function getCloudDirectory(cloud: CloudConfiguration): Promise<string> {
    const source = `[${F}.${getCloudDirectory.name}()]`
    let configuredCloudDir = '';
    if (isNonEmptyString(cloud.absoluteDirPath) && (!isNonEmptyString(cloud.rootName))) { // cloud config method 1
        configuredCloudDir = cloud.absoluteDirPath;
        validate.existingDirectoryArgument(source, {configuredCloudDir})
    } else if (isNonEmptyString(cloud.rootName) && isNonEmptyString(cloud.folderName)) { // cloud config method 2
        let cloudRootSuffix = (isNonEmptyString(cloud.orgSeparator) 
            && isNonEmptyString(ORGANIZATION) 
            ? `${cloud.orgSeparator}${ORGANIZATION}` 
            : ''
        );
        configuredCloudDir = path.join(
            'C:/Users', USER, cloud.rootName + cloudRootSuffix, cloud.folderName 
        );
        validate.existingDirectoryArgument(source, {configuredCloudDir});
    } 
    // else {
    //     throw new Error(`${source} Unable to construct cloud directory path from CloudConfiguration`)
    // }
    return configuredCloudDir;
}

/**
 * - validate dir existence; throw error if dir not exists and !makeDirs
 * @param dir `string`
 * @param dirLabel `{ [dirLabel: string]: string }`
 * @param makeDirs `boolean (optional)` `default = false`
 * @returns `Promise<void>`
 */
async function validateResourceFolders(
    source: string,
    dirDictionary: { [dirLabel: string]: string },
    makeDirs: boolean = false
): Promise<void> {
    const vSource = `[${validateResourceFolders.name}()]`;
    for (let [dirLabel, dir] of Object.entries(dirDictionary)) {
        if (isDirectory(dir)) continue;
        if (!makeDirs) {
            throw new Error([`${source} -> ${vSource} directory does not exist`,
                `label: '${dirLabel}'`,
                `value: '${dir}'`
            ].join(TAB));
        }
        fs.mkdirSync(dir, { recursive: true });
        slog.info(`   Created '${dirLabel}' at ${dir}`);
    }
}

export async function getProjectConfiguration(): Promise<ProjectConfiguration> {
    const source = `[${F}.${getProjectConfiguration.name}()]`;
    if (!projectConfig) {
        throw new Error([`${source} projectConfig is undefined`,
            ` -> call initializeEnvironment() first.`
        ].join(NL));
    }
    return projectConfig;
}

export async function getResourceFolderConfiguration(): Promise<ResourceFolderConfiguration> {
    const source = `[${F}.${getResourceFolderConfiguration.name}()]`;
    if (!resourceFolderConfiguration && projectConfig) {
        resourceFolderConfiguration = await loadResourceFolderConfiguration(projectConfig);
    } else if (!resourceFolderConfiguration) {
        throw new Error([`${source} projectConfig is undefined`,
            ` -> Unable to call loadResourceFolderConfiguration()`,
            ` -> call initializeEnvironment() first.`
        ].join(NL));
    }
    return resourceFolderConfiguration;
}

export async function getDataLoaderConfiguration(): Promise<DataLoaderConfiguration> {
    const source = `[${F}.${getDataLoaderConfiguration.name}()]`;
    if (!dataLoaderConfig && projectConfig) {
        dataLoaderConfig = await loadDataLoaderConfiguration(projectConfig);
    } else if (!dataLoaderConfig) {
        throw new Error([`${source} projectConfig is undefined`,
            ` -> Unable to call loadDataLoaderConfiguration()`,
            ` -> call initializeEnvironment() first.`
        ].join(NL));
    }
    return dataLoaderConfig;
}
/**
 * `project.data.config.json`
 * @returns `string`
 */
export async function getDataLoaderConfigurationFile(): Promise<string> {
    if (!dataLoaderConfigPath) {
        dataLoaderConfigPath = (await getDataLoaderConfiguration()).configFileName;
    }
    return dataLoaderConfigPath
}


export async function getAccountDetails(): Promise<AccountDetails> {
    const source = `[${F}.${getAccountDetails.name}()]`;
    if (!accountDetails && projectConfig) {
        accountDetails = await loadAccountDetails(projectConfig);
    } else if (!accountDetails) {
        throw new Error([`${source} projectConfig is undefined`,
            ` -> Unable to call loadAccountDetails()`,
            ` -> call initializeEnvironment() first.`
        ].join(NL));
    }
    return accountDetails;
}


export const HUBSPOT_PERSONAL_ACCESS_KEY = (process.env.PERSONAL_ACCESS_KEY 
    || 'MISSING_ENV_VARIABLE-PERSONAL_ACCESS_KEY'
);
export const HUBSPOT_ACCESS_TOKEN = (process.env.ACCESS_TOKEN 
    || 'MISSING_ENV_VARIABLE-ACCESS_TOKEN'
);
export const HUBSPOT_DEVELOPER_API_KEY = (process.env.DEVELOPER_API_KEY 
    || 'MISSING_ENV_VARIABLE-DEVELOPER_API_KEY'
);
/**id for hubspot account. */
export const HUBSPOT_PORTAL_ID = (process.env.PORTAL_ID 
    || 'MISSING_ENV_VAR-HUBSPOT_PORTAL_ID'
);




export let CRM_STEM = `https://api.hubapi.com/crm/v3`
// https://api.hubapi.com/crm/v3/objects/contacts/batch/archive
/** 
 * = `'https://api.hubapi.com/crm/v3/objects'` 
 * 
 * */
export const CRM_OBJECTS_URL = `${CRM_STEM}/objects`
export const hubspotClient = new Client({ 
    accessToken: HUBSPOT_ACCESS_TOKEN, 
    developerApiKey: HUBSPOT_DEVELOPER_API_KEY,
    numberOfApiCallRetries: 1, 
});
/** `https://api.hubapi.com/automation/v4/flows/${flowId}` */
export const FLOWS_API_URL = `https://api.hubapi.com/automation/v4/flows`;

/** `'https://app.hubspot.com'` */
export const HUBSPOT_APP_URL_STEM = `https://app.hubspot.com`;


/**
 * @description Exit the program/script for debugging purposes
 * @param exitCode `number` - The exit code to use when exiting the program. Default is `0`. Use `1` for error.
 * @param msg `any[]` `(optional)` - The message to log before exiting.
 * @returns {void}
 * */
export const STOP_RUNNING = (exitCode: number=0, ...msg: any[]): void => {
    console.log(` > STOP_RUNNING() called with exitCode ${exitCode} at (${new Date().toLocaleString()}).`, ...(msg || []));
    process.exit(exitCode);
}

/**
 * @description async func to pause execution for specified amount of milliseconds
 * - default message =  `'> Pausing for ${ms} milliseconds.'`
 * - `if` pass in `null` as second argument, no message will be logged 
 * @param ms `number` - milliseconds to pause execution for.
 * @param msg `any[]` `(optional)` The message to log before pausing.
 * @returns {Promise<void>}
 * @example DELAY(1000) // pauses for 1 second
 * */
export const DELAY = async (ms: number, ...msg: any[]): Promise<void> => {
    let pauseMsg = ` > Pausing for ${ms} milliseconds.`;
    let msgArr = Array.isArray(msg) && msg.length > 0 ? msg : [pauseMsg];
    if (msgArr[0] !== null) {console.log(...msgArr);}
    return new Promise(resolve => setTimeout(resolve, ms));
}