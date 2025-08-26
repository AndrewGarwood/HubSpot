/**
 * @file src/config/types/ProjectData.TypeGuards.ts
 */
import { ApiObjectEnum } from "src/api/crm";
import { hasKeys, isNonEmptyArray, isNonEmptyString, isObject, isStringArray } from "@typeshi/typeValidation";
import { 
    DataDomainEnum, 
    DataSourceDictionary, 
    TerritorySourceFileConfig, 
    TerritoryFlowConfig, 
    LoadTerritoryDataOptions,
    TerritoryData, 
} from "./ProjectData";


export function isDataSourceDictionary(value: any): value is DataSourceDictionary {
    return (isObject(value)
        && Object.values(DataDomainEnum).every(
            v=>Object.keys(value).includes(v) && isObject(value[v])
        )
    );
}

export function isLoadTerritoryDataOptions(value: any): value is LoadTerritoryDataOptions {
    return (isObject(value)
        && isTerritorySourceFileConfig(value.sourceOptions)
        && isNonEmptyArray(value.flows)
        && value.flows.every(el=>isTerritoryFlowConfig(el))
    )
}

export function isTerritorySourceFileConfig(value: any): value is TerritorySourceFileConfig {
    /**array of props where TerritorySourceFileConfig[prop] is supposed to be a string */
    let stringKeys = ['fileNamePrefix', 'eastRegionSheetName', 'westRegionSheetName', 
        'territoryColumn', 'zipColumn'
    ];
    return (isObject(value)
        && stringKeys.every(k=>isNonEmptyString(value[k]))
    );
}

export function isTerritoryFlowConfig(value: any): value is TerritoryFlowConfig {
    return (isObject(value)
        && isNonEmptyString(value.objectType)
        && Object.values(ApiObjectEnum).includes(value.objectType as ApiObjectEnum)
        && isNonEmptyString(value.flowId)
        && isNonEmptyString(value.name)
        && isStringArray(value.regionZipProperties)
        && isStringArray(value.territoryZipProperties)
    );
}

export function isTerritoryData(value: any): value is TerritoryData {
    const objectPropKeys = ['branchDict', 'eastTerritoryDict', 'westTerritoryDict',
        'compositeTerritoryDict', 'regionDIct'
    ];
    return (isObject(value) 
        && isNonEmptyString(value.filePath)
        && isStringArray(value.eastZips)
        && isStringArray(value.westZips)
        && objectPropKeys.every(k=>isObject(value[k]))
    );
}