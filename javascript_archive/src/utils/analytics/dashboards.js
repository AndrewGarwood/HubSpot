/**
 * @file dashboards.js
 * @fileoverview used to scrape and update dashboard json from Chrome Dev Tools console because HubSpot API does not provide a way to update dashboard reports. . .
 * @TODO add example json file and eventually add type definitions for the report and dashboard objects + the rest
 */
const apiEndpoint = "https://app.hubspot.com/api/dashboard/v2";
let authToken = "AUTH_TOKEN_HERE";
let csrfToken = "CSRF_TOKEN_HERE";
const PORTAL_ID = "PORTAL_ID_HERE";
const DEFAULT_DASHBOARD_URL_SEARCH_PARAMS = {
    "record": "true",
    "hydrate": ["FAVORITE", "PERMISSION_CONFIG", "USER_PERMISSION_LEVEL", "WIDGET", "FILTERS", "DATA_SOURCES"],
    "hs_static_app": "DashboardUI",
    "hs_static_app_version": "4.75258", 
    "portalId": PORTAL_ID,
    "clienttimeout": "50000"
};
const DEFAULT_REPORT_URL_SEARCH_PARAMS = {
    "hs_static_app": "advanced-builder",
    "hs_static_app_version": "1.45256",
    "portalId": PORTAL_ID,
    "clienttimeout": "15000"
};
/**
 * @enum {string} ObjectTypeEnum
 * @property {string} DASHBOARD - Dashboard object type
 * @property {string} REPORT - Report object type
 */
const ObjectTypeEnum = {
    DASHBOARD: "dashboard",
    REPORT: "report",
};


async function main() {
    let dashboardId = 123456; // replace with your dashboard ID
    let replaceArr = [
        {
            escapedString: /regularExpression/g,
            newVal: "newValue"
        }
    ]
    await updateAllOccurrencesofStringInDashboardReports(dashboardId, true, replaceArr);
    await replaceAllOccurrencesOfStringInObject(dashboardId, ObjectTypeEnum.DASHBOARD, replaceArr);
}


/**
 * 
 * @param {string | number} objectId 
 * @param {ObjectTypeEnum} objectType
 * @returns {Promise<object.<string, any>>}
 * @description Get object by id and type. The objectType can be either dashboard or report. 
 */
async function getObjectById(objectId, objectType) {
    if (!objectId || !objectType) {
        throw new Error("objectId and objectType are required parameters.");
    }
    if (Object.keys(ObjectTypeEnum).includes(objectType)) {
        objectType = ObjectTypeEnum[objectType];
    } else if (!Object.values(ObjectTypeEnum).includes(objectType)) {
        throw new Error(`objectType ${objectType} is not a valid ObjectTypeEnum key or value.`);
    } 
    try {
        if (objectType === ObjectTypeEnum.DASHBOARD) {
            return await getDashboardById(objectId);
        } else if (objectType === ObjectTypeEnum.REPORT) {
            return await getReportById(objectId);
        }
    } catch (error) {
        console.error(`Error in getObjectById(objectId: ${objectId}, objectType: ${objectType}):`, error);
        return undefined;
    }
}

/**
 * 
 * @param {string | number} objectId 
 * @param {ObjectTypeEnum} objectType 
 * @param {string | object.<string, any>} objectData 
 * @returns {Promise<object.<string, any>>}
 */
async function setObjectById(objectId, objectType, objectData) {
    if (!objectId || !objectType || !objectData) {
        throw new Error("objectId, objectType and objectData are required parameters for function setObjectById().");
    }
    if (Object.keys(ObjectTypeEnum).includes(objectType)) {
        objectType = ObjectTypeEnum[objectType];
    } else if (!Object.values(ObjectTypeEnum).includes(objectType)) {
        throw new Error(`objectType ${objectType} is not a valid ObjectTypeEnum key or value.`);
    } 
    try {
        if (objectType === ObjectTypeEnum.DASHBOARD) {
            return await setDashboardById(objectId, objectData);
        } else if (objectType === ObjectTypeEnum.REPORT) {
            return await setReportById(objectId, objectData);
        }
    } catch (error) {
        console.error(`Error in setObjectById(objectId: ${objectId}, objectType: ${objectType}):`, error);
    }
}

/**
 * 
 * @param {string | number} objectId 
 * @param {ObjectTypeEnum} objectType
 * @param {Array<{escapedString: RegExp, newVal: string}>} replaceArr where replaceArr[i].escapedString: {@link RegExp} is the pattern to match, replaceArr[i].newVal is the new value.
 * @returns {Promise<object.<string, any>>}
 */
async function replaceAllOccurrencesOfStringInObject(objectId, objectType, replaceArr) {
    console.log(`replaceAllOccurrencesOfStringInObject(objectId: ${objectId}, objectType: ${objectType}, replaceArr), replaceArr.length: ${replaceArr.length}`);
    if (!objectId || !objectType || !replaceArr) {
        throw new Error("objectId and objectType and replaceArr are required parameters.");
    }
    try {
        let data = await getObjectById(objectId, objectType);
        if (!data || data === undefined) {
            console.log('data is undefined or null', data);
            throw new Error(`No data found for objectId: ${objectId} and objectType: ${objectType}`);
        }
        let updatedString = JSON.stringify(data);
        for (let i = 0; i < replaceArr.length; i++) {
            let regExp = new RegExp(replaceArr[i].escapedString, 'g');
            let value = replaceArr[i].newVal;
            if (!regExp.test(updatedString)) {
                console.log(`\tNo match found for RegExp ${regExp} in objectId: ${objectId} and objectType: ${objectType}`);
                continue;
            }
            // console.log(`\tAttempting to replace RegExp ${regExp} with ${value}`);
            updatedString = updatedString.replace(regExp, value);
            console.log(`\t\t regExp.test(updatedString) after replace:      ${regExp.test(updatedString)}`);
            console.log(`\t\t updatedString.includes(${value}) afer replace: ${updatedString.includes(value)}`);
        }
        return await setObjectById(objectId, objectType, JSON.parse(updatedString));
    } catch (error) {
        console.error(`Error in replaceAllOccurrencesOfStringInObject(objectId: ${objectId}, objectType: ${objectType}):`, error);
    }
}

/**
 * 
 * @param {string | number} dashboardId 
 * @param {string | object.<string, any>} dashboardData 
 * @returns {Promise<object.<string, any>>}
 */
async function setDashboardById(dashboardId, dashboardData) {
    const dashboardUrl = createUrlWithParams(
        `${apiEndpoint}/dashboard/${dashboardId}`, 
        DEFAULT_DASHBOARD_URL_SEARCH_PARAMS
    ).toString();
    try {
        let dashboardRes = await fetch(dashboardUrl, {
            method: "PUT",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            },
            body: (typeof dashboardData === "string") ? dashboardData : JSON.stringify(dashboardData)
        });
        return await dashboardRes.json();
    } catch (error) {
        console.error(`Error in setDashboardById(dashboardId: ${dashboardId}):`, error);
    }
}


/**
 * 
 * @param {string | number} dashboardId 
 * @returns {Promise<object.<string, any>>}
 */
async function getDashboardById(dashboardId) {
    const dashboardUrl = createUrlWithParams(
        `${apiEndpoint}/dashboard/${dashboardId}`, 
        DEFAULT_DASHBOARD_URL_SEARCH_PARAMS
    ).toString();    
    try {
        let dashboardRes = await fetch(dashboardUrl, {
            method: "GET",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            }
        });
        return await dashboardRes.json();
    } catch (error) {
        console.error(`Error in getDashboardById(dashboardId: ${dashboardId}):`, error);
    }
}

/**
 * 
 * @param {string | number} reportId 
 * @returns {Promise<object.<string, any>>}
 */
async function getReportById(reportId) {
    const reportUrl = createUrlWithParams(
        `${apiEndpoint}/reports/${reportId}`, 
        DEFAULT_REPORT_URL_SEARCH_PARAMS
    ).toString();
    try {
        let reportRes = await fetch(reportUrl, {
            method: "GET",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            }
        });
        return await reportRes.json();
    } catch (error) {
        console.error(`Error in getReportById(reportId: ${reportId}):`, error);
    }
}

/**
 * 
 * @param {string | number} dashboardId 
 * @param {string | object.<string, any>} reportData 
 * @returns {Promise<object.<string, any>>}
 */
async function setReportById(reportId, reportData) {
    const reportUrl = createUrlWithParams(
        `${apiEndpoint}/reports/${reportId}`, 
        DEFAULT_REPORT_URL_SEARCH_PARAMS
    ).toString();
    try {
        let reportRes = await fetch(reportUrl, {
            method: "PUT",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            },
            body: (typeof reportData === "string") ? reportData : JSON.stringify(reportData)
        });
        return await reportRes.json();
    } catch (error) {
        console.error(`Error in setReportById(reportId: ${reportId}):`, error);
    }
}


/**
 * 
 * @param {string | number} dashboardId 
 * @param {boolean} useReplaceMethod 
 * @param {Array<{escapedString: RegExp, newVal: string}>} replaceArr where replaceArr[i].escapedString: {@link RegExp} is the pattern to match, replaceArr[i].newVal is the new value.
 * @returns {Promise<{status: number, message: string}>}
 */
async function updateAllOccurrencesofStringInDashboardReports(
    dashboardId, 
    useReplaceMethod=true, 
    replaceArr=[]
) {
    let dashboardData = await getDashboardById(dashboardId);
    // Loop over each widget that contains a report
    try {
        let i = 0;
        for (let widget of dashboardData.widgets) {
            console.log(`Widget ${i++}.`);
            if (!widget.reportId) {
                continue;
            }
            let reportId = widget.reportId;
            let widgetRes = undefined
            if (useReplaceMethod) {
                widgetRes = await replaceAllOccurrencesOfStringInObject(reportId, ObjectTypeEnum.REPORT, replaceArr);
            } else {
                throw new Error('Alternative Method not yet implemented.');
            }
            if (widgetRes) {
                console.log(`\t Updated report ${reportId} in dashboard ${dashboardId}`);
            } else {
                console.log(`\t Failed to update report ${reportId} in dashboard ${dashboardId}`);
            }
        }
        return { status: 200, message: `Finished updateAllOccurrencesofStringInDashboardReports(dashboardId: ${dashboardId})` };
    } catch (error) {
        console.error(`Error in updateAllOccurrencesofStringInDashboardReports(dashboardId: ${dashboardId}):`, error);
        return { status: 500, message: `Failed updateAllOccurrencesofStringInDashboardReports(dashboardId: ${dashboardId})` };
    }
}





async function setAuthToken() {
    let input = prompt('Input new authToken:').trim();
    if (input) {
        authToken = input;
        console.log(`authToken updated at ${getCurrentPacificTime().split(', ')[1]}`);
    }
}

async function setCsrfToken() {
    let input = prompt('Input new csrfToken:').trim();
    if (input) {
        csrfToken = input;
        console.log(`csrfToken updated at ${getCurrentPacificTime().split(', ')[1]}`);
    }
}


/**
 * @enum {string} DateFormatEnum
 * @property {string} ISO - ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @property {string} UTC - UTC format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @property {string} LOCALE - Local format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
const DateFormatEnum = {
    ISO: 'ISO',
    UTC: 'UTC',
    LOCALE: 'LOCALE'
};
/**
 * - defaultValue: string = "en-US"
 * @description set as first param, locales, in {@link Date}.toLocaleString(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions)
 * @reference ~\node_modules\typescript\lib\lib.es2020.date.d.ts @see {@link Date}
 */
const DEFAULT_LOCALE = 'en-US';
/**
 * - defaultValue: string = "America/Los_Angeles"
 * @description set as second param, options, in {@link Date}.toLocaleString(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions)
 * @reference ~\node_modules\typescript\lib\lib.es2020.date.d.ts @see {@link Date}
 */
const DEFAULT_TIMEZONE = 'America/Los_Angeles';

/**
 * Converts a date string to Pacific Time
 * @param {string} initialDateString The date string to convert
 * @returns {string} The date string in Pacific Time
 */
function toPacificTime(initialDateString) {
    if (!initialDateString) {
        console.error('No initial date string provided');
        return null;
    }
    if (typeof initialDateString !== 'string') {
        console.error('Initial date string must be a string');
        return null;
    }
    const initialDate = new Date(initialDateString);
    const pacificTime = initialDate.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
    return pacificTime
}


/**
 * Gets the current date and time in Pacific Time
 * @returns {string} The current date and time in Pacific Time
 * @example "4/16/2025, 9:00:15 AM"
 */
function getCurrentPacificTime() {
    const currentDate = new Date();
    const pacificTime = currentDate.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
    return pacificTime;
}

function getUnixTimestampFromISO(dateString) {
    if (!dateString) {
        console.error('No date string provided');
        return null;
    }
    if (typeof dateString !== 'string') {
        console.error('Date string must be a string');
        return null;
    }
    if (dateString.length > 10) {
        dateString = dateString.substring(0, 10);
    }
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoPattern.test(dateString)) {
        console.error('Date string must be in ISO format (YYYY-MM-DD)');
        return null;
    }
    const date = new Date(dateString);
    return date.getTime();
}

/**
 * 
 * @param {number} unixTimestamp - number - The unix timestamp in milliseconds or seconds to convert
 * @param {DateFormatEnum} dateFormat {@link DateFormatEnum} - The format to return the date in
 * @returns {string} The date string in the specified format
 * @example "2025-04-16T00:00:00.000Z"
 */
function getDateFromUnixTimestamp(unixTimestamp, dateFormat) {
    if (!unixTimestamp) {
        console.error('No unixTimestamp provided');
        return null;
    }
    if (typeof unixTimestamp !== 'number') {
        console.error('unixTimestamp must be a number');
        return null;
    }
    if (String(unixTimestamp).length === 10) {
        unixTimestamp = unixTimestamp * 1000; // Convert to milliseconds if in seconds
    }
    if (String(unixTimestamp).length > 13) {
        console.error('unixTimestamp must be in milliseconds or seconds');
        return null;
    }
    const date = new Date(unixTimestamp);
    if (dateFormat === DateFormatEnum.ISO) {
        return date.toISOString();
    } else if (dateFormat === DateFormatEnum.UTC) {
        return date.toUTCString();
    } else if (dateFormat === DateFormatEnum.LOCALE) {
        return date.toLocaleString(DEFAULT_LOCALE, {timeZone: DEFAULT_TIMEZONE});
    }
    console.error('Invalid date format specified. Use DateFormatEnum.ISO, DateFormatEnum.UTC, or DateFormatEnum.LOCALE');
    return null;
}

/**
 * Creates a URL object with search parameters from a dictionary.
 * @param {string} baseUrl - The base URL as a string.
 * @param {Object.<string, string|number|boolean | Array<string|number|boolean>>} searchParamsDict - An object containing key-value pairs for search parameters.
 * @returns {URL} A new URL object with the search parameters added.
 * @example createUrlWithParams(baseUrl: "https://example.com/api", searchParamsDict: { record: "true", hydrate: "FAVORITE" }) => url 
 * url.toString() = "https://example.com/api?record=true&hydrate=FAVORITE"
 */
function createUrlWithParams(baseUrl, searchParamsDict) {
    if (!baseUrl || typeof baseUrl !== "string") {
        throw new Error("baseUrlString must be a valid string.");
    }
    if (!searchParamsDict || typeof searchParamsDict !== "object") {
        throw new Error("searchParamsDict must be a valid object.");
    }

    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(searchParamsDict)) {
        if (typeof value === "string") {
            url.searchParams.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach(val => url.searchParams.append(key, String(val)));
        } else {
            throw new Error(`Value for key ${key} must be a primitives or an array of primitives.`);
        }
    }
    return url;
}