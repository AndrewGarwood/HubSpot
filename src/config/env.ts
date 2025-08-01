/**
 * @file src/config/env.ts
 */
import { Client } from '@hubspot/api-client';
import * as fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

const NL = '\n > ';
const TAB = '\n\t• ';

export const USER = process.cwd().split(path.sep)[2];
console.log(`[env.ts] Loading environment variables...`,NL+`USER: '${USER}'`);
export const ORGANIZATION = process.env.ORGANIZATION || 'MISSING_ENV_VAR-ORGANIZATION';
/** `'C:/Users/${USER}/OneDrive - ${ORGANIZATION}'` */
export const ONE_DRIVE_DIR = `C:/Users/${USER}/OneDrive - ${ORGANIZATION}`;
/** `${`{@link ONE_DRIVE_DIR}`}/HubSpot/logs` (not part of git repo so no worry about file size) */
export const CLOUD_LOG_DIR = path.join(ONE_DRIVE_DIR, 'HubSpot', 'logs') as string;

/** `./HubSpot/` = the directory where the node_modules folder lives*/
export const NODE_HOME_DIR = process.cwd() as string;
/** = {@link NODE_HOME_DIR}`/src` = `process.cwd()/src`*/
export const SRC_DIR = path.join(NODE_HOME_DIR, 'src') as string;


/** `./HubSpot/data` = `NODE_HOME_DIR/../data` */
export const DATA_DIR = path.join(NODE_HOME_DIR, 'data') as string;
/** `./HubSpot/.output `*/
export const OUTPUT_DIR = path.join(NODE_HOME_DIR, '.output') as string;

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
enum AccountEnvironmentEnum {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
    DEVELOPMENT = 'development',
}
type AccountDetails = {
    id: string;
    name: string;
    type: string;
    accessKey: string;
};
type HubSpotAccountDictionary = {
    [accountEnv in AccountEnvironmentEnum]: AccountDetails;
};
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
const nodeEnv = (process.env.NODE_ENV || 'MISSING_ENV_VARIABLE-NODE_ENV');

const accountDetails: AccountDetails = {
    id: '',
    name: '',
    type: '',
    accessKey: ''
}

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
        throw new Error(`[env.ts] Invalid Environment Variable: 'NODE_ENV'`);
}

for (const value of [accountDetails.id, accountDetails.accessKey]) {
    if (value.startsWith('MISSING')) {
        throw new Error([`[env.ts] Missing environment variable(s)`,
            `Expected definition in .env file for variable '${value.split('-')[1]}'`,
            `current accountDetails from .env values: ${JSON.stringify(accountDetails, null, 4)}`
        ].join(TAB))
    }
}

export const HUBSPOT_ACCOUNT_ID = accountDetails.id;
export const PERSONAL_ACCESS_KEY = accountDetails.accessKey;
export const ACCOUNT_DETAILS = accountDetails;
export const CRM_STEM = `https://api.hubapi.com/crm/v3`
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

validatePath(
    NODE_HOME_DIR, SRC_DIR, ONE_DRIVE_DIR, CLOUD_LOG_DIR, 
    DATA_DIR, OUTPUT_DIR
);
function validatePath(...paths: string[]): void {
    for (const p of paths) {
        if (!fs.existsSync(p)) {
            console.error(`[env.validatePath()] ERROR: Path does not exist: ${p}`);
            STOP_RUNNING(1);
        }
    }
}

/** 
 * @example 
 * import READLINE as rl;
 * const answer = await rl.question('What do you think of Node.js?')
 * */
export const READLINE = readline.createInterface({ input, output });

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