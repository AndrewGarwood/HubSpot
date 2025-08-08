/**
 * @file src/CrmObjectManager.ts
 */
import { 
    getIndexedColumnValues,
    getRows,
    isValidCsv,
    writeObjectToJson as write,
    readJsonFileAsObject as read, 
    indentedStringify, getFileNameTimestamp
} from "./utils/io";
import { DATA_DIR, ONE_DRIVE_DIR, STOP_RUNNING, DELAY, CLOUD_LOG_DIR,
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL, 
    initializeData, DataDomainEnum
} from "./config";
import { searchObjectByProperty,
    updatePropertyByObjectId,
    batchUpdatePropertyByObjectId,
    setPropertyByObjectId,
    batchSetPropertyByObjectId, 
    FilterOperatorEnum, 
    Filter, 
    FilterGroup, 
    PublicObjectSearchRequest as SearchRequest, 
    PublicObjectSearchResponseSummary as SearchResponseSummary, 
    CrmAssociationObjectEnum, 
    CrmObjectTypeIdEnum,
    ApiObjectEnum,
    getDealByOrderNumber,
    PublicObjectSearchRequest,
} from "./api/crm";
import path from "node:path";
import { clearFile, trimFile } from './utils/io';
import { parseAddress, cities, IParsedAddress, IStateCities } from "addresser";
import { JOB_TITLE_SUFFIX_PATTERN, 
    COMPANY_KEYWORDS_PATTERN, COMPANY_ABBREVIATION_PATTERN,
    extractName, extractJobTitleSuffix, 
    LAST_NAME_COMMA_FIRST_NAME_PATTERN, 
    stringContainsAnyOf,
    RegExpFlagsEnum,
    clean,
    stringStartsWithAnyOf,
    extractSource
} from "./utils/regex";
import * as validate from "./utils/argumentValidation";
import { isNonEmptyString, isNullLike } from "./utils/typeValidation";

export type Address = {
    zipCode: string;
    stateAbbreviation: string;
    stateName: string;
    placeName: string;
    addressLine1: string;
    addressLine2?: string;
    streetNumber: string;
    streetSuffix: string;
    streetName: string;
    id: string;
    formattedAddress?: string;
};
type StateCities = {
    [stateName: string]: string[];
};

function Filter(
    propertyName: string,
    operator: FilterOperatorEnum,
    value: string
): Filter {
    return {
        propertyName, operator, value
    }
}

// function SearchRequest(
//     properties: string[],
//     filterGroups: FilterGroup[]
// ): SearchRequest {
//     return { properties, filterGroups }
// }

type EntitySearchMeta = {
    rowIndex: number;
    entity: string;
    ogAddress: string;
    parsedAddress: Address;
    [key: string]: any;
}

enum SourceColumnEnum {
    ENTITY = 'Entity',
    ADDRESS = 'Address'
}

const MAX_NUM_FILTER_GROUPS = 5;
const MAX_NUM_FILTERS = 18;

async function main() {
    const source = `[CrmObjectManager.main()]`;
    try {
        await initializeData(DataDomainEnum.REGEX, DataDomainEnum.CRM);
        mlog.info(`${source} ✓ Application data initialized successfully`);
    } catch (error) {
        mlog.error(`${source} ✗ Failed to initialize application data:`, error);
        STOP_RUNNING(1);
    }
    const resultsFilePath = path.join(CLOUD_LOG_DIR, `searches`,`apiSearch_entResults.json`);
    const results = read(resultsFilePath) as {
        [entity: string]: {
            strict: { [searchLabel: string]: SearchResponseSummary },
            lax: { [searchLabel: string]: SearchResponseSummary },
        }
    };
    let contacts: { [entity: string]: string[] } = {}
    for (const ent in results) {
        for (const [label, res] of Object.entries(results[ent].strict)) {
            if (res.objectIds.length === 0) { continue }
            for (const id of res.objectIds) {
                if (!contacts[ent].includes(id)) {
                    contacts[ent].push(id);
                }
            }
        }
    }
    // write(contacts, path.join(CLOUD_LOG_DIR, `searches`, `entity_match_contactIds.json`));
    STOP_RUNNING(0);
}
main().catch((err) => {
    mlog.error("[CrmObjectManager.main()] ERROR:", err);
    STOP_RUNNING(1);
});

async function runSearch(): Promise<void> {
    const source = `[CrmObjectManager.runSearch()]`;
    const entFile = path.join(DATA_DIR, 'reports', 'client_entity_list.tsv');
    if (!isValidCsv(entFile, Object.values(SourceColumnEnum))) {
        mlog.error([`${source} Error: invalid entity tsv file provided`]);
    }
    const entRows = await getRows(entFile) as {
        [SourceColumnEnum.ENTITY]: string;
        [SourceColumnEnum.ADDRESS]: string;
    }[];
    const targetEntDict = await getIndexedColumnValues(entRows, SourceColumnEnum.ENTITY);
    const targetAddressDict = await getIndexedColumnValues(entRows, SourceColumnEnum.ADDRESS);

    mlog.debug([`${source} Pause`, 
        `     num unique ents:  ${Object.keys(targetEntDict).length}`,
        `num unique addresses:  ${Object.keys(targetAddressDict).length}`,
    ].join(TAB));
    const entMetaArray: EntitySearchMeta[] = []
    for (let i = 0; i < entRows.length; i++) {
        const { Address: addr, Entity: ent } = entRows[i];
        try {
            entMetaArray.push({
                rowIndex: i, 
                entity: ent.trim(), 
                ogAddress: addr.trim(), 
                parsedAddress: parseAddress(addr.trim()),
            });
        } catch (e) {
            mlog.error([`${source} Error parsing address from entRow ${i}`,
                ` entity: '${ent.trim()}'`,
                `address: '${addr.trim()}'`,
                `  error:  ${e as any}`
            ].join(TAB));
            STOP_RUNNING(1);
        }
    }
    const entSearches: { 
        [entity: string]: { 
            strict: { [searchLabel: string]: SearchRequest }, 
            lax: { [searchLabel: string]: SearchRequest } 
        } 
    } = {};
    const entResults: {
        [entity: string]: {
            strict: { [searchLabel: string]: SearchResponseSummary },
            lax: { [searchLabel: string]: SearchResponseSummary },
        }
    } = {};
    // const responseProperties = getObjectPropertyDictionary().DEFAULT_CONTACT_PROPERTIES;
    for (const meta of entMetaArray) {
        const ent = meta.entity;
        let addressVariants: Address[] = await generateAddressVariants(meta.parsedAddress);
        entSearches[ent] = {
            strict: {
                ENTITY_NAME_EQUALS: {
                    filterGroups: [
                        { filters: await generateEntityFilters(meta, FilterOperatorEnum.EQUAL_TO, true) },
                        { filters: await generateEntityFilters(meta, FilterOperatorEnum.EQUAL_TO, false) }
                    ] as FilterGroup[]
                } as SearchRequest,
            }, 
            lax: {
                ENTITY_NAME_CONTAINS: {
                    filterGroups: [
                        { filters: await generateEntityFilters(meta, FilterOperatorEnum.CONTAINS_TOKEN, true) },
                        { filters: await generateEntityFilters(meta, FilterOperatorEnum.CONTAINS_TOKEN, false) }
                    ] as FilterGroup[]
                } as SearchRequest,
            }
        }
        for (let i = 0; i < addressVariants.length; i++) {
            const billing1 = await generateAddressFilters(
                addressVariants[i], 
                ContactPropertyEnum.STREET_LINE_1, 
                FilterOperatorEnum.CONTAINS_TOKEN, 
                false, 
                ContactPropertyEnum.STATE, 
                false,
                ContactPropertyEnum.ZIP
            );
            const billing2 = await generateAddressFilters(
                addressVariants[i], 
                ContactPropertyEnum.STREET_LINE_1, 
                FilterOperatorEnum.CONTAINS_TOKEN, 
                true, 
                ContactPropertyEnum.STATE, 
                false,
                ContactPropertyEnum.ZIP
            );
            const shipping1 = await generateAddressFilters(
                addressVariants[i],
                ContactPropertyEnum.SHIPPING_ADDRESS_LINE_1,
                FilterOperatorEnum.CONTAINS_TOKEN,
                false, 
                ContactPropertyEnum.SHIPPING_STATE,
                true,
                ContactPropertyEnum.SHIPPING_POSTAL_CODE
            )
            const shipping2 = await generateAddressFilters(
                addressVariants[i],
                ContactPropertyEnum.SHIPPING_ADDRESS_LINE_1,
                FilterOperatorEnum.CONTAINS_TOKEN,
                false, 
                ContactPropertyEnum.SHIPPING_STATE,
                false,
                ContactPropertyEnum.SHIPPING_POSTAL_CODE
            )
            entSearches[ent].strict[`ADDRESS_EQUALS_${i}`] = {
                filterGroups: [
                    { filters: billing1 },
                    { filters: billing2 },
                    { filters: shipping1 },
                    { filters: shipping2 }
                ]
            } as SearchRequest
        }
    }
    for (const ent in entSearches) {
        entResults[ent] = {
            strict: {},
            lax: {}
        }
        let { strict, lax } = entSearches[ent];
        for (const [label, req] of Object.entries(strict)) {
            entResults[ent].strict[label] = await searchObjectByProperty(
                ApiObjectEnum.CONTACTS, req, 
            ) as SearchResponseSummary;
            await DELAY(2000, null);
        }
        for (const [label, req] of Object.entries(lax)) {
            entResults[ent].lax[label] = await searchObjectByProperty(
                ApiObjectEnum.CONTACTS, req, 
            );
            await DELAY(2000, null);
        }
    }
    let numNonEmptyResults = Object.keys(entResults).reduce((acc, ent) => {
        let searchDict = entResults[ent];
        if (Object.keys(searchDict.strict).some(searchLabel => searchDict.strict[searchLabel].total > 0)) {
            acc++;
        }
        return acc;
    }, 0);
    mlog.debug(`numNonEmptyResults: ${numNonEmptyResults}`);
    write(entResults, path.join(ONE_DRIVE_DIR, `apiSearch_entResults.json`));
}

async function generateNameFilters(
    value: string,
    operator: FilterOperatorEnum = FilterOperatorEnum.EQUAL_TO,
    includeSuffix: boolean = true
): Promise<Filter[]> {
    const filters: Filter[] = [];
    let name = extractName(value, includeSuffix);
    let { first, last } = name;
    if (!last) return []
    filters.push(
        Filter(ContactPropertyEnum.FIRST_NAME, operator, first),
        Filter(ContactPropertyEnum.LAST_NAME, operator, last)
    )
    return filters;
}

async function generateCompanyFilters(
    value: string,
    operator: FilterOperatorEnum = FilterOperatorEnum.EQUAL_TO,
    includeSuffix: boolean = true
): Promise<Filter[]> {
    if (!includeSuffix) {
        value = clean(value, {
            replace: [
                {searchValue: COMPANY_ABBREVIATION_PATTERN, replaceValue: ''},
                {searchValue: /P\.A\.\s*$/, replaceValue: ''},
            ]
        });
    }
    return [Filter(ContactPropertyEnum.COMPANY_NAME, operator, value)];
}


/**
 * @param meta {@link EntitySearchMeta}
 * @returns **`filterGroups`** `Array<`{@link FilterGroup}`>`
 */
async function generateEntityFilters(
    meta: EntitySearchMeta,
    operator: FilterOperatorEnum = FilterOperatorEnum.EQUAL_TO,
    includeSuffix: boolean = true
): Promise<Filter[]> {
    const { entity } = meta;
    if (isPerson(entity)) {
        return await generateNameFilters(entity, operator, includeSuffix);
    } else { // entity is a company name
        return await generateCompanyFilters(entity, operator, includeSuffix);
    }
}

/**
 * @TODO make args optional and only return filters for args passed in.
 * @param address 
 * @param street1Property 
 * @param streetOperator 
 * @param appendStreet2 
 * @param stateProperty 
 * @param useStateAbbreviation 
 * @param zipProperty 
 * @returns **`filters`** {@link Filter}`[]` `filters.length === 4`
 */
async function generateAddressFilters(
    address: Address,
    street1Property: ContactPropertyEnum.STREET_LINE_1 | ContactPropertyEnum.SHIPPING_ADDRESS_LINE_1,
    streetOperator: FilterOperatorEnum,
    appendStreet2: boolean,
    stateProperty: ContactPropertyEnum.STATE | ContactPropertyEnum.SHIPPING_STATE,
    useStateAbbreviation: boolean,
    zipProperty: ContactPropertyEnum.ZIP | ContactPropertyEnum.SHIPPING_POSTAL_CODE
): Promise<Filter[]> {
    const filters: Filter[] = [
        Filter(ContactPropertyEnum.CITY, FilterOperatorEnum.EQUAL_TO, address.placeName),
        Filter(street1Property, streetOperator, 
            (appendStreet2 
                ? `${address.addressLine1} ${address.addressLine2 || ''}` 
                : address.addressLine1
            ).trim()
        ),
        Filter(stateProperty, FilterOperatorEnum.EQUAL_TO,
            (useStateAbbreviation 
                ? address.stateAbbreviation 
                : address.stateName
            )
        ),
        Filter(zipProperty, FilterOperatorEnum.CONTAINS_TOKEN, address.zipCode)
    ]
    return filters;
}

async function generateAddressVariants(
    addr: Address
): Promise<Address[]> {
    const source = `[CrmObjectManager.generateAddressVariants()]`;
    validate.objectArgument(source, {addr});
    const variants: Address[] = [addr];
    let ogStreetValues: string[] = [];
    let variantStreetValues: string[] = [];
    let line1Variants: string[] = [];
    if (isNonEmptyString(addr.addressLine1)) {
        for (const { abbrev, full } of streetAbbreviations) {
            ogStreetValues.push(addr.addressLine1);
            if (abbrev.test(addr.addressLine1)) {
                variantStreetValues.push(addr.addressLine1.replace(abbrev, full));
            } else if (stringContainsAnyOf(addr.addressLine1, full, RegExpFlagsEnum.IGNORE_CASE)) {
                variantStreetValues.push(addr.addressLine1.replace(full, extractSource(abbrev)));
            }
        }
    }
    line1Variants = [...ogStreetValues, ...variantStreetValues];
    for (const street of line1Variants) {
        let a1: Address = {
            ...addr,
            addressLine1: street,
            id: `${street}-${addr.stateAbbreviation}-${addr.zipCode}`
                .replace(/\s+/g, '-').toLowerCase()
        };
        if (!variants.some(a => a.id === a1.id)) {
            variants.push(a1);
        }
    }
    return variants;
}

enum ContactPropertyEnum {
    CONTACT_ID = 'hs_object_id',
    FIRST_NAME = 'firstname',
    LAST_NAME = 'lastname',
    COMPANY_NAME = 'company',
    STREET_LINE_1 = 'address',
    STREET_LINE_2 = 'street_address_2',
    CITY = 'city',
    STATE = 'state',
    ZIP = 'zip',
    COUNTRY = 'country',
    PHONE = 'phone',
    EMAIL = 'email',
    SHIPPING_ADDRESS_LINE_1 = 'unific_shipping_address_line_1',
    SHIPPING_ADDRESS_LINE_2 = 'unific_shipping_address_line_2',
    SHIPPING_CITY = 'unific_shipping_city',
    SHIPPING_STATE = 'unific_shipping_state',
    SHIPPING_POSTAL_CODE = 'unific_shipping_postal_code',
    SHIPPING_COUNTRY = 'unific_shipping_country',
    SHIPPING_PHONE = 'unific_shipping_phone'
}

/** @TODO make a type for this and/or put in the regex utils folder */
const streetAbbreviations = [
    { abbrev: /\bSt\.?$/i, full: 'Street' },
    { abbrev: /\bRd\.?$/i, full: 'Road' },
    { abbrev: /\bAve\.?$/i, full: 'Avenue' },
    { abbrev: /\bBlvd\.?$/i, full: 'Boulevard' },
    { abbrev: /\bDr\.?$/i, full: 'Drive' },
    { abbrev: /\bLn\.?$/i, full: 'Lane' },
    { abbrev: /\bCt\.?$/i, full: 'Court' },
    { abbrev: /\bPl\.?$/i, full: 'Place' },
    { abbrev: /\bCir\.?$/i, full: 'Circle' },
    { abbrev: /\bCtr\.?$/i, full: 'Center'},
    { abbrev: /\bPkwy\.?$/i, full: 'Parkway' },
    { abbrev: /\bTer\.?$/i, full: 'Terrace' },
    { abbrev: /\bSq\.?$/i, full: 'Square' }
];


/**
 * - {@link COMPANY_ABBREVIATION_PATTERN}, {@link COMPANY_KEYWORDS_PATTERN}
 * @param value `string`
 * @returns **`isPerson`** `boolean`
 */
function isPerson(value: string): boolean {
    const isCompany = COMPANY_ABBREVIATION_PATTERN.test(value) 
        || COMPANY_KEYWORDS_PATTERN.test(value)
        || stringContainsAnyOf(value, /[0-9@]+/, RegExpFlagsEnum.GLOBAL);
    if ((LAST_NAME_COMMA_FIRST_NAME_PATTERN.test(value) 
        || JOB_TITLE_SUFFIX_PATTERN.test(value)
        && !isCompany)) { 
        // mlog.debug([`[CrmObjectManager.isPerson()] value = '${value}' -> return true`,].join(TAB))
        return true;
    }
    if (isCompany) {
        // mlog.debug([`[CrmObjectManager.isPerson()] value = '${value}' -> return false`,].join(TAB))
        return false;
    }
    // mlog.debug([`[CrmObjectManager.isPerson()] value = '${value}' -> return true`,].join(TAB))
    return true;
}