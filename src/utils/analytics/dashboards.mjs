/**
 * @file dashboards.mjs
 * @fileoverview used to scrape dashboard json from chrome browser console because HubSpot API does not provide a way to update dashboard reports. . .
 * @TODO add example json file and eventually add type definitions for the report and dashboard objects + the rest
 */
const apiEndpoint = "https://app.hubspot.com/api/dashboard/v2";
let authToken = "AUTH_TOKEN_HERE";
let csrfToken = "CSRFTOKEN_HERE";
const portalId = "PORTAL_ID_HERE";

// refactor into a UpdateObject
const oldExpressionInput = "expression1";
const newExpressionInput = "expression2";
const oldExpressionLabel = "label1";
const newExpressionLabel = "label2";


async function main() {
    let dashboardIds = ["d1", "d2"];
    for (let dashboardId of dashboardIds) {
        await updateFormulaFieldOfDashboardReports(dashboardId, true);
    }
    let reportIds = ["r1", "r2"];
    for (let reportId of reportIds) {  
        await stringReplaceFormulaFieldOfReport(reportId); 
    }
}

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
            body: JSON.stringify(reportData)
        });
        let reportResult = await reportRes.json();
        return reportResult;
    } catch (error) {
        console.error(`Error in setReportById(reportId: ${reportId}):`, error);
    }
}

/**
 * @warning be careful with global string replacement
 * @param {*} reportId 
 */
async function stringReplaceFormulaFieldOfReport(reportId) {
    try {
        let reportData = await getReportById(reportId); 
        const reportString = JSON.stringify(reportData);
        const updatedString = reportString
            .replace(/"OLD_PROPERTY_NAME_HERE/g, "\"NEW_PROPERTY_NAME_HERE")
            .replace(/expression1Regex/g, newExpressionInput)
            .replace(/expression1RegexVariant/g, newExpressionInput)
            .replace(/label1Regx/g, newExpressionLabel);
        reportData = JSON.parse(updatedString);
        await setReportById(reportId, reportData);
    } catch (error) {
        console.error(`Error in stringReplaceFormulaFieldOfReport(reportId: ${reportId}):`, error);
    }
}

function getCurrentPacificTime() {
    const now = new Date();
    return now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
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

/**@TODO refactor*/
async function updateFormulaFieldOfReport(reportId) {
    try {
        let modified = false;
        let reportData = await getReportById(reportId);
        let expressionAlias = null;
        reportData.reportDefinition.expressions.forEach(expression => {
            if (expression && expression.input && (expression.input.replace(/\s/g, '') === oldExpressionInput.replace(/\s/g, '') || expression.input.replace(/\s/g, '') === newExpressionInput.replace(/\s/g, ''))) {
                if (expression.expression.right.type === "PROPERTY") {
                    expression.input = newExpressionInput;
                    expression.label = newExpressionLabel;
                    expression.expression.right.name = "NEW_PROPERTY_NAME_HERE";
                } else if (expression.expression.right.type === "FUNCTION_CALL") {
                    expression.input.replace(oldExpressionLabel, newExpressionLabel);
                }
                expressionAlias = expression.alias;
                return;
            }
        });
        if (expressionAlias) {
            // Update columns that reference the expression alias
            let columns = reportData.reportDefinition.columns;
            Object.keys(columns).forEach(key => {
                let col = columns[key];
                if (col.field && col.field.source === "EXPRESSION" && col.field.name === expressionAlias) {
                    if (col.field.expression && col.field.expression.right && col.field.expression.right.name === "OLD_PROPERTY_NAME_HERE") {
                        col.field.expression.right.name = "NEW_PROPERTY_NAME_HERE";
                        modified = true;
                    }
                }
            });
            if (reportData.reportDefinition.filtering && reportData.reportDefinition.filtering.groups) {
                reportData.reportDefinition.filtering.groups.forEach(group => {
                    if (group.filters && Array.isArray(group.filters)) {
                        group.filters.forEach(filter => {
                            if (filter.field && filter.field.source === "EXPRESSION" && filter.field.name === expressionAlias) {
                                if (filter.field.expression && filter.field.expression.right && filter.field.expression.right.name === "OLD_PROPERTY_NAME_HERE") {
                                    filter.field.expression.right.name = "NEW_PROPERTY_NAME_HERE";
                                    modified = true;
                                }
                            }
                        });
                    }
                });
            }
        }

        if (modified && reportData) {
            console.log(`Updating Expression in Report Name: ${reportData.name}`);
            let updateRes = await setReportById(reportId, reportData);
            console.log('Report Updated:', updateRes);
            console.log(`Report ${reportId} updated:`, updateRes);
        } else {
            console.log(`No matching expression found for report ${reportId}`);
        }
    } catch (error) {
        console.error(`Error in updateFormulaFieldOfReport(reportId: ${reportId}):`, error);
    }
}

async function updateFormulaFieldOfDashboardReports(dashboardId, useReplaceMethod = false) {
    let dashboardData = await getDashboardById(dashboardId);
    // Loop over each widget that contains a report
    for (let widget of dashboardData.widgets) {
        if (!widget.reportId) {
            continue;
        }
        let reportId = widget.reportId;
        if (useReplaceMethod) {
            await stringReplaceFormulaFieldOfReport(reportId);
        } else {
            await updateFormulaFieldOfReport(reportId);
        }
    }
}

function recursiveReplace(obj, replacements) {
    if (typeof obj === "string") {
        let newStr = obj;
        replacements.forEach(r => {
            // Replace all occurrences of rep.oldTerm with rep.newTerm
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
