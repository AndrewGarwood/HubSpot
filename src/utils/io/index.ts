import {
    getCurrentPacificTime,
    toPacificTime,
    getUnixTimestampFromISO,
    getDateFromUnixTimestamp,
    calculateDifferenceOfDateStrings,
    parseLocaleStringToDate,
    ISO_PATTERN,
    DEFAULT_LOCALE,
    DEFAULT_TIMEZONE,
    DateFormatEnum,
    TimeUnitEnum,
} from './dateTime'
import {
    getDelimiterFromFilePath,
    readFileLinesIntoArray,
    validateFileExtension,
    parseExcelForOneToMany,
    parseCsvForOneToMany,
    readJsonFileAsObject,
} from './reading'
import {
    writeListsToCsv,
    writeObjectToJson,
    printConsoleGroup,
    printJson
} from './writing'
import {
    stripChar,
    stringEndsWithAnyOf,
    stringContainsAnyOf,
    stringStartsWithAnyOf,
    BOOLEAN_FIELD_ID_REGEX,
    RegExpFlagsEnum,
    EMAIL_REGEX,
    PHONE_REGEX,
    KOREA_PHONE_REGEX,
    JAPAN_PHONE_REGEX,
    applyPhoneRegex
} from './regex'
export {
    // dateTime.ts
    getCurrentPacificTime,
    toPacificTime,
    getUnixTimestampFromISO,
    getDateFromUnixTimestamp,
    calculateDifferenceOfDateStrings,
    parseLocaleStringToDate,
    ISO_PATTERN,
    DEFAULT_LOCALE,
    DEFAULT_TIMEZONE,
    DateFormatEnum,
    TimeUnitEnum,

    // reading.ts
    getDelimiterFromFilePath,
    readFileLinesIntoArray,
    validateFileExtension,
    parseExcelForOneToMany,
    parseCsvForOneToMany,
    readJsonFileAsObject,

    // regex.ts
    stripChar,
    stringEndsWithAnyOf,
    stringContainsAnyOf,
    stringStartsWithAnyOf,
    EMAIL_REGEX,
    BOOLEAN_FIELD_ID_REGEX,
    RegExpFlagsEnum,
    PHONE_REGEX,
    KOREA_PHONE_REGEX,
    JAPAN_PHONE_REGEX,
    applyPhoneRegex,

    // writing.ts
    writeListsToCsv,
    writeObjectToJson,
    printConsoleGroup,
    printJson
}