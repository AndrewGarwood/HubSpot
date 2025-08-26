/**
 * @file src/types/ProjectEnvironment.ts
 */

/**
 * @typedefn **`ProjectConfiguration`**
 */
export type ProjectConfiguration = {
    name: string;
    nodeEnv: string;
    srcDir: string;
    dataLoader: DataLoaderConfiguration;
    [key: string]: any;
} & ({
    cloud: CloudConfiguration;
    local: never;
} | {
    cloud: never;
    local: LocalConfiguration;
})

/**
 * @interface **`ResourceFolderConfiguration`**
 * - values are either folder names or complete directory paths
 */
export interface ResourceFolderConfiguration {
    dataDir: string;
    logDir: string;
    outDir: string;
}

export type CloudConfiguration = ResourceFolderConfiguration & ({
    /**`C:/Users/{USER}`/**{rootName}**`{orgSeparator || ''}{ORG || ''}/{folderName}` */
    rootName: string;
    /**`C:/Users/{USER}/{rootName}`**{orgSeparator || ''}**`{ORG || ''}/{folderName}` */
    orgSeparator?: string;
    /**`C:/Users/{USER}/{rootName}{orgSeparator || ''}{ORG || ''}`/**`{folderName}`** */
    folderName?: string;
    absoluteDirPath: never;
} | {
    /** `absolute/path/to/dir` */
    absoluteDirPath: string;
    rootName: never;
    orgSeparator: never;
    folderName: never;
}) 

export type LocalConfiguration = ResourceFolderConfiguration & {
    [key: string]: any;
}

export interface DataLoaderConfiguration {
    loadFromCloud: boolean;
    configFileName: string;
    [key: string]: any;
}


export enum AccountEnvironmentEnum {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
    DEVELOPMENT = 'development',
}
export type AccountDetails = {
    id: string;
    name: string;
    type: string;
    accessKey: string;
};
export type HubSpotAccountDictionary = {
    [accountEnv in AccountEnvironmentEnum]: AccountDetails;
};