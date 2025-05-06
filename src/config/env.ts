import { Client } from '@hubspot/api-client';
import * as fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @description Exit the program/script
 * @param {number} exitCode - The exit code to use when exiting the program. 
 * Default is 0. Use 1 for error.
 * @returns {void}
 * */
export const STOP_RUNNING = (exitCode: number=0, ...msg: any[]): void => {
    console.log('STOP_RUNNING() called with exitCode:', exitCode, ...(msg || []));
    process.exit(exitCode);
}
/**
 * @description Pause execution for specified amount of milliseconds 
 * @param {number} ms - The number of milliseconds to pause execution for.
 * @returns {Promise<void>}
 * @example DELAY(1000) // pauses for 1 second
 * */
export const DELAY = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const USER = (process.env.CURRENT_USER ||'MISSING_ENV_VAR-CURRENT_USER');
console.log('USER:'.padEnd(13), USER);

/** `C:/Users/${USER}/OneDrive - ENTITY_NAME` */
export const ONE_DRIVE_DIR = `C:/Users/${USER}/OneDrive - ENTITY_NAME`;
validateDirectory(ONE_DRIVE_DIR);

/** `./HubSpot/` = the directory where the node_modules folder lives*/
export const NODE_HOME_DIR = process.cwd() as string;
/** = {@link NODE_HOME_DIR}`/src` = `process.cwd()/src` =  `./HubSpot/src`*/
export const SRC_DIR = path.join(NODE_HOME_DIR, 'src') as string;


/** `~/HubSpot/src/data` */
export const DATA_DIR = path.join(SRC_DIR, 'data') as string;
validateDirectory(DATA_DIR);
/** `~/HubSpot/.output `*/
export const OUTPUT_DIR = path.join(NODE_HOME_DIR, '.output') as string;
validateDirectory(OUTPUT_DIR);


export const HUBSPOT_ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'MISSING_ENV_VARIABLE-ACCESS_TOKEN';
export const HUBSPOT_DEVELOPER_API_KEY = process.env.DEVELOPER_API_KEY || 'MISSING_ENV_VARIABLE-DEVELOPER_API_KEY';

export const hubspotClient = new Client({ 
    accessToken: HUBSPOT_ACCESS_TOKEN, 
    developerApiKey: HUBSPOT_DEVELOPER_API_KEY,
    numberOfApiCallRetries: 5, 
});
export const SEARCH_LIMIT = 200;

export const FLOWS_API_URL = `https://api.hubapi.com/automation/v4/flows`;

function validateDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        console.error(`ERROR: Directory does not exist: ${dirPath}`);
        STOP_RUNNING(1);
    }
}


/** 
 * @example 
 * // import READLINE as rl;
 * const answer = await rl.question('What do you think of Node.js?')
 * */
export const READLINE = readline.createInterface({ input, output });