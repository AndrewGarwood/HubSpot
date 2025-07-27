/**
 * @file src/analytics/puppeteerFetch.ts
 * @note not yet implemented
 */
import puppeteer, { Browser, Page, Protocol, Cookie, PuppeteerLifeCycleEvent } from 'puppeteer-core';
import axios from 'axios';
import { USER, HUBSPOT_PORTAL_ID as PORTAL_ID, HUBSPOT_APP_URL_STEM as APP_STEM } from '../config/env';
import { mainLogger as log, INDENT_LOG_LINE as TAB, NEW_LINE as NL } from '../config/setupLog';

const CHROME_PATH = "C:/Program Files/Google/ChromeApplication/chrome.exe";
const CHROME_USER_DATA_DIR = `C:/Users/${USER}/AppData/Local/Google/Chrome/User Data/Default`;
const DASHBOARD_ID = "16454843";

async function main(): Promise<void> {
    try {
        // 1. Launch Chrome using your real profile
        const browser: Browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            userDataDir: CHROME_USER_DATA_DIR,
            headless: true,
            args: ['--no-sandbox'],
        });

        const [page]: Page[] = await browser.pages();
        // 2. Navigate to HubSpot dashboard (must be logged in)
        await page.goto(
            `${APP_STEM}/reports-dashboards/${PORTAL_ID}/view/${DASHBOARD_ID}`,
            { waitUntil: 'networkidle2' as PuppeteerLifeCycleEvent }
        );
        
        const cookies: Cookie[] = await browser.cookies();
        const cookieHeaderValue: string = cookies
            .map(c => `${c.name}=${c.value}`).join('; ');
    } catch (error) {
        log.error('Error:', error);
    }
}

/*
import puppeteer, { Browser, Page, Protocol } from 'puppeteer-core';
import axios, { AxiosResponse } from 'axios';

async function main(): Promise<void> {
  // 1. Launch Chrome using your real profile
  const browser: Browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: 'C:\\Users\\Andrew\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
    args: ['--no-sandbox']
  });

  const [page]: Page[] = await browser.pages();

  // 2. Navigate to HubSpot dashboard (must be logged in)
  await page.goto(
    'https://app.hubspot.com/reports-dashboards/44788543',
    { waitUntil: 'networkidle2' }
  );

  // 3a. Pull all cookies
  const cookies: Protocol.Network.Cookie[] = await page.cookies();
  const cookieHeader: string = cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  // 3b. Extract CSRF token from cookies
  const csrfMatch: RegExpMatchArray | null =
    cookieHeader.match(/hubspotapi-csrf=([^;]+)/);
  const csrfToken: string | null = csrfMatch ? csrfMatch[1] : null;

  console.log('› Cookie header:', cookieHeader);
  console.log('› CSRF token:', csrfToken);

  // 4. Do authenticated GET (or PUT) via Axios
  const dashboardId = '16454843';
  const apiUrl = `https://app.hubspot.com/api/dashboard/v2/dashboard/${dashboardId}` +
    '?record=true&hs_static_app=DashboardUI&hs_static_app_version=4.78218' +
    '&portalId=44788543&clienttimeout=50000';

  let resp: AxiosResponse;
  try {
    resp = await axios.get(apiUrl, {
      headers: {
        Cookie: cookieHeader,
        'x-hubspot-csrf-hubspotapi': csrfToken || '',
        'Content-Type': 'application/json'
      }
    });
    console.log('Dashboard JSON:', resp.data);
  } catch (err) {
    console.error('Request failed:', err);
  } finally {
    await browser.close();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

*/