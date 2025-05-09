/**
 * @file Reading.ts
 * @description types for src/utils/io/reading.ts
 */

/**
 * 
 * @typedefn {Object} FileExtensionResult
 * @property {boolean} isValid - true if the filePath has the expected extension, false otherwise
 * @property {string} validatedFilePath - the filePath with the expected extension if it was missing, otherwise the original filePath
 */
export type FileExtensionResult = {
    isValid: boolean,
    validatedFilePath: string
}


export type ParseOneToManyOptions = {
    keyCaseOptions?: StringCaseOptions,
    valueCaseOptions?: StringCaseOptions,
    keyPadOptions?: StringPadOptions,
    valuePadOptions?: StringPadOptions
}

export type StringCaseOptions = {
    toUpper?: boolean,
    toLower?: boolean,
    toTitle?: boolean,
    // toSentenceCase?: boolean,
    // toPascalCase?: boolean,
    // toCamelCase?: boolean,
}

export type StringPadOptions = {
    padLength: number,
    padChar?: string,
    padLeft?: boolean,
    padRight?: boolean,
}