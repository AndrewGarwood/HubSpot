/**
 * @file src/utils/workflow_code_actions/CONTACT_setStateToShippingState.js
 * @flowName "Contact - Set State to Shipping State if State Unknown"
 * @flowId NUMBER
 * @flowObject CONTACT
 * @description set contact.state to contact.unific_shipping_state if contact.state 
 * is unknown (null, undefined, or empty string).
 */
const hubspot = require('@hubspot/api-client');
const NEWLINE = '\n > ';
/** `INDENTED_NEW_LINE` = `'\n\t'` */
const TAB = '\n\t';
/**
 * @param {string} s 
 * @returns {string} `string` - the input string converted to title case, 
 * or empty string if the input is falsy or not a string.
 */
function toTitleCase(s) {
    if (!s) return '';
    if (typeof s !== 'string') {
        console.error(`Expected string input, but got ${typeof s}: "${s}"`);
        return '';
    }
    return s
        .replace(/\b\w/g, char => char.toUpperCase())
        .replace(/(?<=\b[A-Z]{1})\w*\b/g, char => char.toLowerCase());
}

/**
 * @param {string} stateName 
 * @returns {string} `string` - the standardized state name, 
 * or an empty string if the input is not matched to a valid {@link HubSpotStateEnum}.
 */
function standardizeStateName(stateName) {
    if (!stateName) return '';
    if (typeof stateName !== 'string') {
        console.error(`Expected state to be a string, but got ${typeof stateName}: "${stateName}"`);
        return '';
    }
    if (Object.values(HubSpotStateEnum).includes(toTitleCase(stateName))) {
        return toTitleCase(stateName);
    }
    if (Object.keys(SPELLING_ALTERNATIVES).includes(toTitleCase(stateName))) {
        return SPELLING_ALTERNATIVES[toTitleCase(stateName)];
    }
    const stateKey = stateName 
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '') // Remove non-alphabetic, non-space characters
        .trim() // Trim leading and trailing spaces
        .replace(/\s{1,}/g, '_') // Replace multiple spaces with a single underscore
        .replace(/(?=^)(NEW|NORTH|SOUTH|N|S)(?=\w{2,})/, '$1_') // Add underscore after 'new', 'north', or 'south' if followed by a word of at least 2 characters 
            // (i.e. they forgot to put a space when inputting the state name))
        .replace(/(?<=^[A-Z])_(?=[A-Z]$)/g, '') // Remove underscores between two uppercase letters
        .replace(/N_(?=CAROLINA|DAKOTA)/, 'NORTH_') // Replace 'N_' with 'NORTH_' for North Carolina and North Dakota
        .replace(/S_(?=CAROLINA|DAKOTA)/, 'SOUTH_') // Replace 'S_' with 'SOUTH_' for South Carolina and South Dakota
        .replace(/N_(?=YORK|MEXICO|HAMPSHIRE|JERSEY)/, 'NEW_') // Replace 'N_' with 'NEW_' for New York, New Mexico, New Hampshire, and New Jersey
    const isValidStateAbbreviation = stateKey.length === 2 
        && Object.keys(StateAbbreviationToHubSpotState).includes(stateKey);
    if (isValidStateAbbreviation) {
        return StateAbbreviationToHubSpotState[stateKey];
    }
    if (HubSpotStateEnum[stateKey]) {
        return HubSpotStateEnum[stateKey];
    }
    console.warn(`End of standardizeStateName(): UNMATCHED STATE_NAME`, 
        TAB + `stateName does not match any known state names or abbreviations.`,
        TAB + `stateName: "${stateName}"`,
        TAB + `stateKey: "${stateKey}"`,
        TAB + `-> Returning empty string.`
    );
    return '';
    
}

const HubSpotStateEnum = {
    ALABAMA: 'Alabama',
    ALASKA: 'Alaska',
    ARIZONA: 'Arizona',
    ARKANSAS: 'Arkansas',
    CALIFORNIA: 'California',
    COLORADO: 'Colorado',
    CONNECTICUT: 'Connecticut',
    DELAWARE: 'Delaware',
    FLORIDA: 'Florida',
    GEORGIA: 'Georgia',
    HAWAII: 'Hawaii',
    IDAHO: 'Idaho',
    ILLINOIS: 'Illinois',   
    INDIANA: 'Indiana',
    IOWA: 'Iowa',
    KANSAS: 'Kansas',
    KENTUCKY: 'Kentucky',
    LOUISIANA: 'Louisiana',
    MAINE: 'Maine',
    MARYLAND: 'Maryland',
    MASSACHUSETTS: 'Massachusetts',
    MICHIGAN: 'Michigan',
    MINNESOTA: 'Minnesota',
    MISSISSIPPI: 'Mississippi',
    MISSOURI: 'Missouri',
    MONTANA: 'Montana',
    NEBRASKA: 'Nebraska',
    NEVADA: 'Nevada',
    NEW_HAMPSHIRE: 'New Hampshire',
    NEW_JERSEY: 'New Jersey',
    NEW_MEXICO: 'New Mexico',
    NEW_YORK: 'New York',
    NORTH_CAROLINA: 'North Carolina',
    NORTH_DAKOTA: 'North Dakota',
    OHIO: 'Ohio',
    OKLAHOMA: 'Oklahoma',
    OREGON: 'Oregon',
    PENNSYLVANIA: 'Pennsylvania',
    RHODE_ISLAND: 'Rhode Island',
    SOUTH_CAROLINA: 'South Carolina',
    SOUTH_DAKOTA: 'South Dakota',
    TENNESSEE: 'Tennessee',
    TEXAS: 'Texas',
    UTAH: 'Utah',
    VERMONT: 'Vermont',
    VIRGINIA: 'Virginia',
    WASHINGTON: 'Washington',
    WASHINGTON_DC: 'Washington D.C.',
    WEST_VIRGINIA: 'West Virginia',
    WISCONSIN: 'Wisconsin',
    WYOMING: 'Wyoming',
    PUERTO_RICO: 'Puerto Rico',
    US_VIRGIN_ISLANDS: 'U.S. Virgin Islands',
    INTERNATIONAL: 'International',
}

const StateAbbreviationEnum = {
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    WASHINGTON_DC: "DC",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    NEW_HAMPSHIRE: "NH",
    NEW_JERSEY: "NJ",
    NEW_MEXICO: "NM",
    NEW_YORK: "NY",
    NORTH_CAROLINA: "NC",
    NORTH_DAKOTA: "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    PUERTO_RICO: "PR",
    RHODE_ISLAND: "RI",
    SOUTH_CAROLINA: "SC",
    SOUTH_DAKOTA: "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    US_VIRGIN_ISLANDS: "VI",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    WEST_VIRGINIA: "WV",
    WISCONSIN: "WI",
    WYOMING: "WY",
    // AMERICAN_SAMOA: "AS",
    // FEDERATED_STATES_OF_MICRONESIA: "FM",
    // GUAM: "GU",
    // MARSHALL_ISLANDS: "MH",
    // NORTHERN_MARIANA_ISLANDS: "MP",
    // PALAU: "PW",
    // TRUST_TERRITORIES_OF_THE_PACIFIC_ISLANDS: "TT",
}

const StateAbbreviationToHubSpotState = {
    [StateAbbreviationEnum.ALABAMA]: HubSpotStateEnum.ALABAMA,
    [StateAbbreviationEnum.ALASKA]: HubSpotStateEnum.ALASKA,
    [StateAbbreviationEnum.ARIZONA]: HubSpotStateEnum.ARIZONA,
    [StateAbbreviationEnum.ARKANSAS]: HubSpotStateEnum.ARKANSAS,
    [StateAbbreviationEnum.CALIFORNIA]: HubSpotStateEnum.CALIFORNIA,
    [StateAbbreviationEnum.COLORADO]: HubSpotStateEnum.COLORADO,
    [StateAbbreviationEnum.CONNECTICUT]: HubSpotStateEnum.CONNECTICUT,
    [StateAbbreviationEnum.DELAWARE]: HubSpotStateEnum.DELAWARE,
    [StateAbbreviationEnum.WASHINGTON_DC]: HubSpotStateEnum.WASHINGTON_DC,
    [StateAbbreviationEnum.FLORIDA]: HubSpotStateEnum.FLORIDA,
    [StateAbbreviationEnum.GEORGIA]: HubSpotStateEnum.GEORGIA,
    [StateAbbreviationEnum.HAWAII]: HubSpotStateEnum.HAWAII,
    [StateAbbreviationEnum.IDAHO]: HubSpotStateEnum.IDAHO,
    [StateAbbreviationEnum.ILLINOIS]: HubSpotStateEnum.ILLINOIS,
    [StateAbbreviationEnum.INDIANA]: HubSpotStateEnum.INDIANA,
    [StateAbbreviationEnum.IOWA]: HubSpotStateEnum.IOWA,
    [StateAbbreviationEnum.KANSAS]: HubSpotStateEnum.KANSAS,
    [StateAbbreviationEnum.KENTUCKY]: HubSpotStateEnum.KENTUCKY,
    [StateAbbreviationEnum.LOUISIANA]: HubSpotStateEnum.LOUISIANA,
    [StateAbbreviationEnum.MAINE]: HubSpotStateEnum.MAINE,
    [StateAbbreviationEnum.MARYLAND]: HubSpotStateEnum.MARYLAND,
    [StateAbbreviationEnum.MASSACHUSETTS]: HubSpotStateEnum.MASSACHUSETTS,
    [StateAbbreviationEnum.MICHIGAN]: HubSpotStateEnum.MICHIGAN,
    [StateAbbreviationEnum.MINNESOTA]: HubSpotStateEnum.MINNESOTA,
    [StateAbbreviationEnum.MISSISSIPPI]: HubSpotStateEnum.MISSISSIPPI,
    [StateAbbreviationEnum.MISSOURI]: HubSpotStateEnum.MISSOURI,
    [StateAbbreviationEnum.MONTANA]: HubSpotStateEnum.MONTANA,
    [StateAbbreviationEnum.NEBRASKA]: HubSpotStateEnum.NEBRASKA,
    [StateAbbreviationEnum.NEVADA]: HubSpotStateEnum.NEVADA,
    [StateAbbreviationEnum.NEW_HAMPSHIRE]: HubSpotStateEnum.NEW_HAMPSHIRE,
    [StateAbbreviationEnum.NEW_JERSEY]: HubSpotStateEnum.NEW_JERSEY,
    [StateAbbreviationEnum.NEW_MEXICO]: HubSpotStateEnum.NEW_MEXICO,
    [StateAbbreviationEnum.NEW_YORK]: HubSpotStateEnum.NEW_YORK,
    [StateAbbreviationEnum.NORTH_CAROLINA]: HubSpotStateEnum.NORTH_CAROLINA,
    [StateAbbreviationEnum.NORTH_DAKOTA]: HubSpotStateEnum.NORTH_DAKOTA,
    [StateAbbreviationEnum.OHIO]: HubSpotStateEnum.OHIO,
    [StateAbbreviationEnum.OKLAHOMA]: HubSpotStateEnum.OKLAHOMA,
    [StateAbbreviationEnum.OREGON]: HubSpotStateEnum.OREGON,
    [StateAbbreviationEnum.PENNSYLVANIA]: HubSpotStateEnum.PENNSYLVANIA,
    [StateAbbreviationEnum.PUERTO_RICO]: HubSpotStateEnum.PUERTO_RICO,
    [StateAbbreviationEnum.RHODE_ISLAND]: HubSpotStateEnum.RHODE_ISLAND,
    [StateAbbreviationEnum.SOUTH_CAROLINA]: HubSpotStateEnum.SOUTH_CAROLINA,
    [StateAbbreviationEnum.SOUTH_DAKOTA]: HubSpotStateEnum.SOUTH_DAKOTA,
    [StateAbbreviationEnum.TENNESSEE]: HubSpotStateEnum.TENNESSEE,
    [StateAbbreviationEnum.TEXAS]: HubSpotStateEnum.TEXAS,
    [StateAbbreviationEnum.UTAH]: HubSpotStateEnum.UTAH,
    [StateAbbreviationEnum.VERMONT]: HubSpotStateEnum.VERMONT,
    [StateAbbreviationEnum.US_VIRGIN_ISLANDS]: HubSpotStateEnum.US_VIRGIN_ISLANDS,
    [StateAbbreviationEnum.VIRGINIA]: HubSpotStateEnum.VIRGINIA,
    [StateAbbreviationEnum.WASHINGTON]: HubSpotStateEnum.WASHINGTON,
    [StateAbbreviationEnum.WEST_VIRGINIA]: HubSpotStateEnum.WEST_VIRGINIA,
    [StateAbbreviationEnum.WISCONSIN]: HubSpotStateEnum.WISCONSIN,
    [StateAbbreviationEnum.WYOMING]: HubSpotStateEnum.WYOMING,
}

const SPELLING_ALTERNATIVES = {
    'District Of Columbia': 'Washington D.C.',
    'Virgin Islands': 'U.S. Virgin Islands',
}

/**
 * @param {any} event 
 * @param {any} callback 
 * @returns {any}
 */
exports.main = async (event, callback) => {
    const hubspotClient = new hubspot.Client({ 
        accessToken: process.env.AllCustomCode
    });
    const contactId = event['object']['objectId'];
	const outputProperties = {
        state: '',
        unific_shipping_state: '',
    };
    const state = String(event.inputFields['state'])
        .replace(/null|undefined|/g, '').trim() || '';
    if (state) {
        console.warn(NEWLINE+`main(): Non-trivial State Encountered.`,
            TAB + `Expected null, undefined, or empty string, but received: "${state}"`,
            TAB + ` -> Returning without setting state for contact "${contactId}"`,
        );
        return callback({ outputFields: outputProperties });
    }
    const shippingState = String(event.inputFields['unific_shipping_state'])
        .replace(/null|undefined|/g, '').trim() || '';
    if (!shippingState) {
        console.warn(NEWLINE+`Falsy shippingState from event.inputFields.`, 
            TAB + `Expected a nontrivial string, but received: "${shippingState}"`,
            TAB + ` -> Returning without setting state for contact "${contactId}"`,
        );
        return callback({ outputFields: outputProperties });
    }
    const standardizedShippingState = standardizeStateName(shippingState);
    if (!standardizedShippingState) {
        console.warn(NEWLINE+`main(): Falsy standardizedShippingState.`,
            TAB + `standardizeStateName("${shippingState}") returned an empty string.`,
            TAB + ` -> Returning without setting state for contact "${contactId}"`,
        );
        return callback({ outputFields: outputProperties });
    }
    outputProperties.state = standardizedShippingState;
    outputProperties.unific_shipping_state = standardizedShippingState;
    console.log(NEWLINE+`main(): Trying to set value for properties: ${JSON.stringify(Object.keys(outputProperties))}.`,
        TAB + `newValue: "${standardizedShippingState}"`, 
        TAB + `contactId "${contactId}"`
    );
    try {
        /**@type {SimplePublicObjectInput} */
        const simplePublicObjectInput = {
            objectWriteTraceId: "string",
            properties: outputProperties
        };
        const updateRes = await hubspotClient.crm.contacts.basicApi.update(
            contactId, simplePublicObjectInput
        );
		console.log(
            NEWLINE+`Success!`,
            TAB+`Completed update for contact "${updateRes.id}"`
        );
        const getRes = await hubspotClient.crm.contacts.basicApi.getById(
            contactId, 
            ['state', 'unific_shipping_state', 'firstname', 'lastname']
        );
        console.log(
            NEWLINE+`[Validation] getById() response:`,
            TAB + `            firstname: "${getRes.properties.firstname}"`,
            TAB + `             lastname: "${getRes.properties.lastname}"`,
            TAB + `                state: "${getRes.properties.state}"`,
            TAB + `unific_shipping_state: "${getRes.properties.unific_shipping_state}"`,
        );    
	} catch(e) {
        console.error(`Error setting one or more properties for contact "${contactId}":`, e);
    }
    return callback({
        outputFields: outputProperties
    });
}