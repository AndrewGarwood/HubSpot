/**
 * @file src/utils/workflow_code_actions/CONTACT_setLengthFivePostalCode.js
 * @flowName "Contact - Set Custom Postal Code Property Values"
 * @flowId NUMBER
 * @flowObject CONTACT
 * @description determine { lengthFivePostalCode, lengthFiveShippingPostalCode }, 
 * then set corresponding properties of enrolled contact to these values.
 */
const hubspot = require('@hubspot/api-client');
const NEWLINE = '\n > ';
/** `INDENTED_NEW_LINE` = `'\n\t'` */
const TAB = '\n\t';
const isFiveDigitsAndNoLeadingZero = (str) => {
    console.log(NEWLINE+`isFiveDigitsAndNoLeadingZero(${str}) /^[1-9]{1}\\d{4}$/.test(${str}) ==`, 
        /^[1-9]{1}\d{4}$/.test(str)
    );
    return /^[1-9]{1}\d{4}$/.test(str);
}	
exports.main = async (event, callback) => {
    const hubspotClient = new hubspot.Client({ 
        accessToken: process.env.AllCustomCode
    });

    const contactId = event['object']['objectId'];
    const initialPostalCode = event.inputFields['postal_code'];
    const initialShippingPostalCode = event.inputFields['unific_shipping_postal_code'];
    console.log(NEWLINE+`initial values for contact "${contactId}":`,
        TAB+`        initialPostalCode: "${initialPostalCode}"`,
        TAB+`initialShippingPostalCode: "${initialShippingPostalCode}"`,
    );

    const lengthFivePostalCode = String(initialPostalCode)
        .replace(/null|undefined|/g, '').slice(0,5).padStart(5, 0) || '';
    const lengthFiveShippingPostalCode = String(initialShippingPostalCode)
        .replace(/null|undefined|/g, '').slice(0,5).padStart(5, 0) || '';
    console.log(NEWLINE+`values after truncation for contact "${contactId}":`,
        TAB+`        lengthFivePostalCode: "${lengthFivePostalCode}"`,
        TAB+`lengthFiveShippingPostalCode: "${lengthFiveShippingPostalCode}"`,
    );
	const outputProperties = {};
	if (lengthFivePostalCode) {
        outputProperties[`length_five_postal_code`] = lengthFivePostalCode;
    }
	if (lengthFiveShippingPostalCode) {
        outputProperties[`length_five_shipping_postal_code`] = lengthFiveShippingPostalCode;
    }
    if (lengthFivePostalCode && isFiveDigitsAndNoLeadingZero(lengthFivePostalCode)) {
        outputProperties[`numeric_length_five_postal_code`] = parseInt(lengthFivePostalCode, 10);
    }
	if (lengthFiveShippingPostalCode && isFiveDigitsAndNoLeadingZero(lengthFiveShippingPostalCode)) {
        outputProperties[`numeric_length_five_shipping_postal_code`] = parseInt(lengthFiveShippingPostalCode, 10);
    }
    console.log(NEWLINE+`Preparing to set outputProperties for contact "${contactId}":`,
        TAB+`        lengthFivePostalCode:`, lengthFivePostalCode,
        TAB+`lengthFiveShippingPostalCode:`, lengthFiveShippingPostalCode,
        NEWLINE+`Only set numeric props if no leading zeros:`,
        TAB+`        isFiveDigitsAndNoLeadingZero(lengthFivePostalCode):`, lengthFivePostalCode && isFiveDigitsAndNoLeadingZero(lengthFivePostalCode),
        TAB+`isFiveDigitsAndNoLeadingZero(lengthFiveShippingPostalCode):`, lengthFiveShippingPostalCode && isFiveDigitsAndNoLeadingZero(lengthFiveShippingPostalCode),
        NEWLINE+ `outputProperties:`, outputProperties
    );
    if (Object.keys(outputProperties).length === 0) {
        console.log(NEWLINE+`No properties to set for contact "${contactId}". Exiting.`);
        return callback({
            outputFields: {}
        });
    }
	try {
        const simplePublicObjectInput = {
            objectWriteTraceId: "string",
            properties: outputProperties
        };
        const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, simplePublicObjectInput);
		console.log(`success! SimplePublicObject.id (contactId): `, apiResponse.id);
	} catch(e) {
        console.error("Error setting object property:", e);
    }
    return callback({
        outputFields: outputProperties
    });
}