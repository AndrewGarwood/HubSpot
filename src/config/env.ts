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

export const USER = process.cwd().split(path.sep)[2];
console.log(`[env.ts] Loading environment variables...`,`\n > USER: '${USER}'`);
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
 * @param {number} exitCode - The exit code to use when exiting the program. Default is `0`. Use `1` for error.
 * @param {...any} [msg] - `(optional)` The message to log before exiting.
 * @returns {void}
 * */
export const STOP_RUNNING = (exitCode: number=0, ...msg: any[]): void => {
    console.log(`STOP_RUNNING() called with exitCode ${exitCode}.`, ...(msg || []));
    process.exit(exitCode);
}

/**
 * @description Pause execution for specified amount of milliseconds
 * - default message =  `'> Pausing for ${ms} milliseconds.'`
 * - `if` pass in null as second argument, no message will be logged 
 * @param {number} ms - The number of milliseconds to pause execution for.
 * @param {...any} [msg] - `(optional)` The message to log before pausing.
 * @returns {Promise<void>}
 * @example DELAY(1000) // pauses for 1 second
 * */
export const DELAY = async (ms: number, ...msg: any[]): Promise<void> => {
    let pauseMsg = ` > Pausing for ${ms} milliseconds.`;
    let msgArr = Array.isArray(msg) && msg.length > 0 ? msg : [pauseMsg];
    if (msgArr[0] !== null) {console.log(...msgArr);}
    return new Promise(resolve => setTimeout(resolve, ms));
}