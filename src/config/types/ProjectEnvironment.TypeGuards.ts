/**
 * @file src/types/ProjectEnvironment.TypeGuards.ts
 */

import { 
    ProjectConfiguration, 
    CloudConfiguration, 
    LocalConfiguration, 
    DataLoaderConfiguration,
    AccountEnvironmentEnum 
} from "./ProjectEnvironment";
import { 
    isObject, isNonEmptyString, hasKeys 
} from "@typeshi/typeValidation";

/** `['dataDir', 'logDir', 'outDir']` 
 * = directory props shared by {@link LocalConfiguration} and {@link CloudConfiguration} 
 * */
const subdirectoryKeys = ['dataDir', 'logDir', 'outDir'];

export function isProjectConfiguration(value: any): value is ProjectConfiguration {
    return (isObject(value)
        && hasKeys(value, ['cloud', 'local'], false)
        && isNonEmptyString(value.name)
        && isNonEmptyString(value.srcDir)
        && isNonEmptyString(value.nodeEnv) 
        && Object.values(AccountEnvironmentEnum)
            .includes(value.nodeEnv as AccountEnvironmentEnum)
        && isDataLoaderConfiguration(value.dataLoader)
        && (!value.cloud || isCloudConfiguration(value.cloud))
        && (!value.local || isLocalConfiguration(value.local))
    );
}


export function isDataLoaderConfiguration(value: any): value is DataLoaderConfiguration {
    return (isObject(value)
        && isNonEmptyString(value.configFileName)
        && typeof value.loadFromCloud === 'boolean'
    );
}

export function isLocalConfiguration(value: any): value is LocalConfiguration {
    return (isObject(value)
        && subdirectoryKeys.every(k=>isNonEmptyString(k))
    );
}

export function isCloudConfiguration(value: any): value is CloudConfiguration {
    return (isObject(value)
        && subdirectoryKeys.every(k=>isNonEmptyString(k))
        && (( // specify single absolute path
                isNonEmptyString(value.absoluteDirPath)
            ) || ( // e.g. `C:/Users/{USER}/{rootName}{orgSeparator || ''}{ORG || ''}/{folderName}`
                isNonEmptyString(value.rootName)
                && (!value.folderName || isNonEmptyString(value.folderName))
                && (!value.orgSeparator || typeof value.orgSeparator === 'string')
            )
        )
    );
}