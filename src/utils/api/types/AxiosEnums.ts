/**
 * @file src/utils/api/types/AxiosEnums.ts
 */

/**
 * @enum {string} **`GrantTypeEnum`**
 * @property {string} AUTHORIZATION_CODE - Authorization code grant type.
 * @property {string} REFRESH_TOKEN - Refresh token grant type.
 */
export enum GrantTypeEnum {
    AUTHORIZATION_CODE='authorization_code',
    REFRESH_TOKEN='refresh_token',
}

/**
 * @enum {string} **`AxiosCallEnum`**
 * @property {string} GET - HTTP GET method.
 * @property {string} POST - HTTP POST method.
 * @property {string} PUT - HTTP PUT method.
 * @property {string} DELETE - HTTP DELETE method.
 */
export enum AxiosCallEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}


/**
 * @enum {string} **`AxiosContentTypeEnum`**
 * @property {string} JSON - `'application/json'`
 * @property {string} TEXT - `'text/plain'`
 * @property {string} XML - `'application/xml'`
 * @property {string} FORM_URLENCODED - `'application/x-www-form-urlencoded'`
 */
export enum AxiosContentTypeEnum {
    JSON = 'application/json',
    PLAIN_TEXT = 'text/plain',
    XML = 'application/xml',
    FORM_URLENCODED = 'application/x-www-form-urlencoded',
}