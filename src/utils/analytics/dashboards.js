/**
 * @file dashboards.js
 * @fileoverview used to scrape and update dashboard json from Chrome Dev Tools console because HubSpot API does not provide a way to update dashboard reports. . .
 * @TODO add example json file and eventually add type definitions for the report and dashboard objects + the rest
 */
const apiEndpoint = "https://app.hubspot.com/api/dashboard/v2";
let authToken = "AUTH_TOKEN_HERE";
let csrfToken = "CSRF_TOKEN_HERE";
const portalId = "PORTAL_ID_HERE";

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
    let dashboardId = 16002060;
    /**@type {Record<string, string>} */
    let replaceDict = {
        // unix dates in milliseconds
        // old : new
        "1742601600000": "1741747200000", // change to march 12, 2025
        "1746230400000": "1758211200000", // change to sep 22, 2025
    }
    // let res = await updateAllOccurrencesOfStringInDashboard(dashboardId, replaceDict);
    let res = await updateAllOccurrencesofStringInDashboardReports(dashboardId, true, replaceDict);
    console.log('res', res);
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
    if (!ObjectTypeEnum[objectType] || !Object.values(ObjectTypeEnum).includes(objectType)) {
        throw new Error(`objectType ${objectType} is not a valid ObjectTypeEnum key or value.`);
    } else { // objectType is a key in ObjectTypeEnum
        objectType = ObjectTypeEnum[objectType];
    }
    try {
        let data = undefined;
        if (objectType === ObjectTypeEnum.DASHBOARD) {
            data = await getDashboardById(objectId);
        } else if (objectType === ObjectTypeEnum.REPORT) {
            data = await getReportById(objectId);
        }
        return data;
    } catch (error) {
        console.error(`Error in getObjectById(objectId: ${objectId}, objectType: ${objectType}):`, error);
    }
}

/**
 * 
 * @param {string | number} objectId 
 * @param {ObjectTypeEnum} objectType 
 * @param {string | object.<string, any>} objectData 
 * @returns 
 */
async function setObjectById(objectId, objectType, objectData) {
    if (!objectId || !objectType || !objectData) {
        throw new Error("objectId, objectType and objectData are required parameters for function setObjectById().");
    }
    if (!ObjectTypeEnum[objectType] || !Object.values(ObjectTypeEnum).includes(objectType)) {
        throw new Error(`objectType ${objectType} is not a valid ObjectTypeEnum key or value.`);
    } else { // objectType is a key in ObjectTypeEnum
        objectType = ObjectTypeEnum[objectType];
    }
    try {
        let data = undefined;
        if (objectType === ObjectTypeEnum.DASHBOARD) {
            data = await setDashboardById(objectId, objectData);
        } else if (objectType === ObjectTypeEnum.REPORT) {
            data = await setReportById(objectId, objectData);
        }
        return data;
    } catch (error) {
        console.error(`Error in setObjectById(objectId: ${objectId}, objectType: ${objectType}):`, error);
    }
}

/**
 * 
 * @param {string | number} objectId 
 * @param {ObjectTypeEnum} objectType
 * @param {Record<string, string>} replaceDict key is the {@link RegExp} pattern to match, value is the string to replace with.
 */
async function replaceAllOccurrencesOfStringInObject(objectId, objectType, replaceDict) {
    if (!objectId || !objectType || !replaceDict) {
        throw new Error("objectId and objectType and replaceDict are required parameters.");
    }
    try {
        let data = getObjectById(objectId, objectType);
        if (!data) {
            throw new Error(`No data found for objectId: ${objectId} and objectType: ${objectType}`);
        }
        const dataString = JSON.stringify(data);
        let updatedString = dataString
        for ([key, value] of Object.entries(replaceDict)) {
            console.log(`Replacing RegExp ${new RegExp(key, 'g')} with ${value}`);
            updatedString = updatedString.replace(new RegExp(key, 'g'), value);
        }
        data = JSON.parse(updatedString);
        let res = await setObjectById(objectId, objectType, data);
        console.log(`Updated ${objectType} ${objectId} with new data`);
    } catch (error) {
        console.error(`Error in replaceAllOccurrencesOfStringInObject(reportId: ${objectId}):`, error);
    }
}

/**
 * 
 * @param {string | number} dashboardId 
 * @param {string | object.<string, any>} dashboardData 
 * @returns 
 */
async function setDashboardById(dashboardId, dashboardData) {
    const dashboardUrl = `${apiEndpoint}/dashboard/${dashboardId}?record=true&hydrate=FAVORITE&hydrate=PERMISSION_CONFIG&hydrate=USER_PERMISSION_LEVEL&hydrate=WIDGET&hydrate=FILTERS&hydrate=DATA_SOURCES&hs_static_app=DashboardUI&hs_static_app_version=4.75258&portalId=${portalId}&clienttimeout=50000`;
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
        let dashboardResult = await dashboardRes.json();
        return dashboardResult;
    } catch (error) {
        console.error(`Error in setDashboardById(dashboardId: ${dashboardId}):`, error);
    }
}


/**
 * 
 * @param {string | number} dashboardId 
 */
async function getDashboardById(dashboardId) {
    const dashboardUrl = `${apiEndpoint}/dashboard/${dashboardId}?record=true&hydrate=FAVORITE&hydrate=PERMISSION_CONFIG&hydrate=USER_PERMISSION_LEVEL&hydrate=WIDGET&hydrate=FILTERS&hydrate=DATA_SOURCES&hs_static_app=DashboardUI&hs_static_app_version=4.75258&portalId=${portalId}&clienttimeout=50000`;
    try {
        let dashboardRes = await fetch(dashboardUrl, {
            method: "GET",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            }
        });
        let dashboardData = await dashboardRes.json();
        return dashboardData;
    } catch (error) {
        console.error(`Error in getDashboardById(dashboardId: ${dashboardId}):`, error);
    }
}

/**
 * 
 * @param {string | number} reportId 
 */
async function getReportById(reportId) {
    const reportUrl = `${apiEndpoint}/reports/${reportId}?hs_static_app=advanced-builder&hs_static_app_version=1.45256&portalId=${portalId}&clienttimeout=15000`;
    try {
        let reportRes = await fetch(reportUrl, {
            method: "GET",
            headers: {
                "authorization": authToken,
                "x-hubspot-csrf-hubspotapi": csrfToken,
                "content-type": "application/json"
            }
        });
        let reportData = await reportRes.json();
        return reportData;
    } catch (error) {
        console.error(`Error in getReportById(reportId: ${reportId}):`, error);
    }
}

/**
 * 
 * @param {string | number} dashboardId 
 * @param {string | object.<string, any>} reportData 
 * @returns 
 */
async function setReportById(reportId, reportData) {
    const reportUrl = `${apiEndpoint}/reports/${reportId}?hs_static_app=advanced-builder&hs_static_app_version=1.45256&portalId=${portalId}&clienttimeout=15000`;
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
        let reportResult = await reportRes.json();
        return reportResult;
    } catch (error) {
        console.error(`Error in setReportById(reportId: ${reportId}):`, error);
    }
}

/**
 * 
 * @param {string | number} dashboardId 
 * @param {boolean} useReplaceMethod 
 * @param {Record<string, string>} replaceDict key is the {@link RegExp} pattern to match, value is the string to replace with.
 */
async function updateAllOccurrencesofStringInDashboardReports(dashboardId, useReplaceMethod = true, replaceDict = {}) {
    let dashboardData = await getDashboardById(dashboardId);
    // Loop over each widget that contains a report
    for (let widget of dashboardData.widgets) {
        if (!widget.reportId) {
            continue;
        }
        let reportId = widget.reportId;
        let widgetRes = undefined
        if (useReplaceMethod) {
            widgetRes = await replaceAllOccurrencesOfStringInObject(reportId, replaceDict);
        } else {
            widgetRes = await updateFormulaFieldOfReport(reportId);
        }
        if (widgetRes) {
            console.log(`Updated report ${reportId} in dashboard ${dashboardId}`);
        } else {
            console.log(`Failed to update report ${reportId} in dashboard ${dashboardId}`);
        }
    }
}



function recursiveReplace(obj, replacements) {
    if (typeof obj === "string") {
        let newStr = obj;
        replacements.forEach(r => {
            // Replace all occurrences of r.oldTerm with r.newTerm
            newStr = newStr.split(r.oldTerm).join(r.newTerm);
        });
        return newStr;
    } else if (Array.isArray(obj)) {
        return obj.map(item => recursiveReplace(item, replacements));
    } else if (typeof obj === "object" && obj !== null) {
        Object.keys(obj).forEach(key => {
            obj[key] = recursiveReplace(obj[key], replacements);
        });
        return obj;
    }
    return obj;
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

function getCurrentPacificTime() {
    const now = new Date();
    return now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
}
