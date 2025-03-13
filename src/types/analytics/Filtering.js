/** 
 * @file Report.js
 */
let filteringPartOfReport = {
    "reportDefinition": {
        "filtering": {
            "condition": "AND",
            "groups": [
                {
                    "id": 1,
                    "condition": "AND",
                    "filters": [
                        {
                            "id": 10001,
                            "field": {
                                "source": "TABLE",
                                "table": "__DATASET__",
                                "name": "482267",
                                "type": "datetime"
                            },
                            "filter": {
                                "filterType": "PROPERTY",
                                "property": "closedate",
                                "operation": {
                                    "propertyType": "datetime-ranged",
                                    "operator": "IS_BETWEEN",
                                    "lowerBoundTimestamp": 1704067200000,
                                    "upperBoundTimestamp": 1767139200000,
                                    "requiresTimeZoneConversion": false,
                                    "defaultValue": null,
                                    "includeObjectsWithNoValueSet": false,
                                    "operationType": "datetime-ranged",
                                    "operatorName": "IS_BETWEEN"
                                },
                                "frameworkFilterId": null
                            },
                            "isIgnored": false
                        },
                        {
                            "id": 10002,
                            "field": {
                                "source": "TABLE",
                                "table": "__DATASET__",
                                "name": "446458",
                                "type": "string"
                            },
                            "filter": {
                                "filterType": "PROPERTY",
                                "property": "dealstage",
                                "operation": {
                                    "propertyType": "enumeration",
                                    "operator": "IS_ANY_OF",
                                    "values": [
                                        "processed",
                                        "__hs__CLOSEDWON",
                                        "shipped",
                                        "checkout_completed",
                                        "closedwon"
                                    ],
                                    "defaultValue": null,
                                    "includeObjectsWithNoValueSet": false,
                                    "operationType": "enumeration",
                                    "operatorName": "IS_ANY_OF"
                                },
                                "frameworkFilterId": null
                            },
                            "isIgnored": false
                        }
                    ]
                },
                {
                    "id": 2,
                    "condition": "AND",
                    "filters": [
                        {
                            "id": 10003,
                            "field": {
                                "source": "TABLE",
                                "table": "__DATASET__",
                                "name": "178773",
                                "type": "number"
                            },
                            "filter": {
                                "filterType": "PROPERTY",
                                "property": "178773",
                                "operation": {
                                    "propertyType": "number",
                                    "operator": "IS_GREATER_THAN",
                                    "value": 0,
                                    "defaultValue": null,
                                    "includeObjectsWithNoValueSet": false,
                                    "operationType": "number",
                                    "operatorName": "IS_GREATER_THAN"
                                },
                                "frameworkFilterId": null
                            },
                            "isIgnored": false
                        }
                    ]
                },
                {
                    "id": 3,
                    "condition": "AND",
                    "filters": [
                        {
                            "id": 10004,
                            "field": {
                                "source": "TABLE",
                                "table": "__DATASET__",
                                "name": "172843",
                                "type": "string"
                            },
                            "filter": {
                                "filterType": "PROPERTY",
                                "property": "hubspot_team_id",
                                "operation": {
                                    "propertyType": "enumeration",
                                    "operator": "IS_ANY_OF",
                                    "values": [
                                        "43153691",
                                        "58135910",
                                        "46362934",
                                        "46045010",
                                        "52296439",
                                        "43153649",
                                        "43878114",
                                        "57729213",
                                        "43153646",
                                        "43153679",
                                        "43153778",
                                        "49214404",
                                        "43878129",
                                        "45229712",
                                        "49214400",
                                        "43153660",
                                        "43153348",
                                        "43153678",
                                        "43153666",
                                        "43153676",
                                        "43153675",
                                        "43153653"
                                    ],
                                    "defaultValue": null,
                                    "includeObjectsWithNoValueSet": false,
                                    "operationType": "enumeration",
                                    "operatorName": "IS_ANY_OF"
                                },
                                "frameworkFilterId": null
                            },
                            "isIgnored": false
                        }
                    ]
                }
            ],
            "logic": "1",
            "stagedFilters": [
                {
                    "field": "482267",
                    "type": "DATASET_FIELD"
                },
                {
                    "field": "982753",
                    "type": "DATASET_FIELD"
                }
            ]
        },
        "aggregatedFiltering": null,
        "flags": [],
        "useWideJoin": false,
        "type": "RELATIONAL",
        "visual": {
            "type": "VERTICAL_BAR",
            "encodings": {
                "color": {
                    "column": "7c5fa2e5552b07b7a77d5065be790a1b",
                    "options": {
                        "format": {
                            "type": "auto",
                            "negativeSymbol": "AUTO",
                            "customPrecision": 2,
                            "useThousandsSeparator": true
                        }
                    },
                    "encodingOptions": null
                },
                "values": [],
                "rows": [],
                "columns": [],
                "x": {
                    "column": "d9e5bc28e45e63ea088f5f11de3b249a",
                    "options": {
                        "format": {
                            "type": "auto",
                            "negativeSymbol": "AUTO",
                            "customPrecision": 2,
                            "useThousandsSeparator": true
                        }
                    },
                    "encodingOptions": null
                },
                "y_multi": [
                    {
                        "column": "af7f8e1aa9c9af6866f3225a3519296b",
                        "options": {
                            "format": {
                                "type": "currency",
                                "currencyCode": "USD",
                                "negativeSymbol": "AUTO",
                                "customPrecision": 0,
                                "useThousandsSeparator": true
                            }
                        },
                        "encodingOptions": null
                    }
                ]
            },
            "options": {
                "showDataLabels": true,
                "stacking": false,
                "showRecordIds": true,
                "accumulate": false,
                "color": {
                    "assignments": {}
                },
                "legendPosition": "TOP",
                "stackingType": "",
                "yMinMax": {},
                "yAxisType": "linear"
            }
        },
        "stagedFields": [],
        "stagedColumns": [
            {
                "alias": "b62a5b2fbe86ae63c181b5ea84ee0647",
                "field": {
                    "source": "TABLE",
                    "table": "__DATASET__",
                    "name": "797138",
                    "type": "number"
                },
                "domain": "DISCRETE",
                "role": "DIMENSION",
                "sort": {
                    "priority": 0,
                    "type": "VALUE",
                    "order": "ASCENDING",
                    "nested": false
                },
                "fixedMeasure": false,
                "undefinedBucket": "@@MISSING@@",
                "preserveCase": false,
                "includeUndefinedBuckets": true,
                "symmetricAggregation": true,
                "useFiscalYear": false
            }
        ],
        "stagedEncodings": [
            {
                "column": "b62a5b2fbe86ae63c181b5ea84ee0647",
                "options": {
                    "format": {
                        "type": "auto",
                        "negativeSymbol": "AUTO",
                        "customPrecision": 2,
                        "useThousandsSeparator": true
                    }
                },
                "encodingOptions": null
            }
        ]
    }
}