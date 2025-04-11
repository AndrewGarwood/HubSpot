import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';
dotenv.config();

export const HUBSPOT_ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const HUBSPOT_DEVELOPER_API_KEY = process.env.DEVELOPER_API_KEY;

export const hubspotClient = new Client({ 
    accessToken: HUBSPOT_ACCESS_TOKEN, 
    developerApiKey: HUBSPOT_DEVELOPER_API_KEY,
    numberOfApiCallRetries: 5, 
});


export const SEARCH_LIMIT = 200;
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const FLOWS_API_URL = `https://api.hubapi.com/automation/v4/flows`;

/**
 * @description Exit the program/script for debugging purposes 
 * @returns {void}
 */
export const STOP_RUNNING = () => {
    process.exit(1);
}