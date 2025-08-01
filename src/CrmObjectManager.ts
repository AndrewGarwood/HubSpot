/**
 * @file src/CrmObjectManager.ts
 */
import { 
    getIndexedColumnValues,
    getRows,
    isValidCsv,
    writeObjectToJson as write, 
    indentedStringify
} from "./utils/io";
import { DATA_DIR, ONE_DRIVE_DIR, STOP_RUNNING, DELAY, 
    mainLogger as mlog, INDENT_LOG_LINE as TAB, NEW_LINE as NL 
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
    PublicObjectSearchResponseSummary, 
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
import { isNonEmptyString } from "./utils/typeValidation";
// define types from interfaces because the 
// typescript.experimental.expandableHover isn't working yet 
type Address = {
    zipCode: string;
    stateAbbreviation: string;
    stateName: string;
    placeName: string;
    addressLine1: string;
    streetNumber: string;
    streetSuffix: string;
    streetName: string;
    id: string;
    formattedAddress?: string;
} | IParsedAddress;
type StateCities = {
    [stateName: string]: string[];
} | IStateCities;
function Filter(
    propertyName: string,
    operator: FilterOperatorEnum,
    value: string
): Filter {
    return {
        propertyName, operator, value
    }
}

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
async function main() {
    const source = `[CrmObjectManager.main()]`;
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
        entMetaArray.push({
            rowIndex: i, 
            entity: ent, 
            ogAddress: addr, 
            parsedAddress: parseAddress(addr),
        })
    }
    const entSearches: { 
        [entity: string]: { 
            strict: { [searchLabel: string]: SearchRequest }, 
            lax: { [searchLabel: string]: SearchRequest } 
        } 
    } = {}
    for (const meta of entMetaArray) {
        entSearches[meta.entity] = {
            strict: {}, 
            lax: {}
        }
    }
    STOP_RUNNING(0);
}
main().catch((err) => {
    mlog.error("[CrmObjectManager.main()] ERROR:", err);
    STOP_RUNNING(1);
});

const contactResponseProps = [
    "hs_object_id", "firstname", "lastname", "company", 
    
    "address", "street_address_2", "city", "state", "zip", "country", "phone", "email", 
    
    "unific_shipping_address_line_1", "unific_shipping_address_line_2", 
    "unific_shipping_city", "unific_shipping_state","unific_shipping_postal_code",
    "unific_shipping_country", "unific_shipping_phone"

]
/**
 * - {@link COMPANY_ABBREVIATION_PATTERN}, {@link COMPANY_KEYWORDS_PATTERN}
 * - {@link LAST_NAME_COMMA_FIRST_NAME_PATTERN}
 * @param value `string`
 * @returns **`isPerson`** `boolean`
 */
function isPerson(value: string): boolean {
    if (LAST_NAME_COMMA_FIRST_NAME_PATTERN.test(value)) {
        return true;
    }
    if (COMPANY_ABBREVIATION_PATTERN.test(value) 
        || COMPANY_KEYWORDS_PATTERN.test(value)
        || stringContainsAnyOf(value, /[0-9@]+/, RegExpFlagsEnum.GLOBAL)) {
        return false;
    }
    return false;
}

/**
 * generate search request that can be satisfied if any of the strict filtergroups in req.filterGroups are met; 
 * @param meta {@link EntitySearchMeta}
 * @param responseProps 
 * @returns 
 */
async function generateStrictNameFilterGroup(
    meta: EntitySearchMeta,
): Promise<FilterGroup[]> {
    const filterGroups: FilterGroup[] = [];
    // if meta.entity isPerson, then 
    // search contact.firstname = extractName(meta.entity).first
    // && contact.lastname = extractName(meta.entity).last
    const { entity } = meta;
    if (isPerson(entity)) {
        let nameWithPossibleSuffix = extractName(entity);
        let nameWithoutSuffx = extractName(entity, false);
        for (const name of [nameWithPossibleSuffix, nameWithoutSuffx]) {
            let { first, last } = name;
            if (!last) continue
            filterGroups.push({
                filters: [
                    Filter(ContactPropertyEnum.FIRST_NAME, FilterOperatorEnum.EQUAL_TO, first),
                    Filter(ContactPropertyEnum.LAST_NAME, FilterOperatorEnum.EQUAL_TO, last)
                ]
            })
        }
    } else { // entity is a company name
        let companyWithoutSuffix = clean(entity, {
            replace: [{searchValue: COMPANY_ABBREVIATION_PATTERN, replaceValue: ''}]
        });
        filterGroups.push({
            filters: [
                Filter(ContactPropertyEnum.COMPANY_NAME, FilterOperatorEnum.EQUAL_TO, entity),
                Filter(ContactPropertyEnum.COMPANY_NAME, FilterOperatorEnum.EQUAL_TO, companyWithoutSuffix)
            ]
        });
    }
    return filterGroups;
}
const MAX_NUM_FILTER_GROUPS = 5;
async function generateStrictAddressFilterGroup(
    meta: EntitySearchMeta,
): Promise<FilterGroup[]> {
    const filterGroups: FilterGroup[] = [];
    let addressVariants: Address[] = await generateAddressVariants(meta.parsedAddress);
    addressVariants = addressVariants.slice(0, MAX_NUM_FILTER_GROUPS);
    return filterGroups;
}

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
const MAX_NUM_FILTERS = 18;
async function generateAddressVariants(
    addr: Address
): Promise<Address[]> {
    const source = `[CrmObjectManager.generateAddressVariants()]`;
    validate.objectArgument(source, {addr});
    const addressVariants: Address[] = [addr];

    let stateValues: string[] = [];
    if (isNonEmptyString(addr.stateAbbreviation)) stateValues.push(addr.stateAbbreviation);
    if (isNonEmptyString(addr.stateName)) stateValues.push(addr.stateName);
    let ogStreetValues: string[] = [];
    let variantStreetValues: string[] = [];
    let streetValues: string[] = [];
    if (isNonEmptyString(addr.addressLine1)) {
        for (const { abbrev, full } of streetAbbreviations) {
            ogStreetValues.push(addr.addressLine1);
            if (abbrev.test(addr.addressLine1)) {
                variantStreetValues.push(addr.addressLine1.replace(abbrev, full));
            } else if (stringContainsAnyOf(addr.addressLine1, full, RegExpFlagsEnum.IGNORE_CASE)) {
                variantStreetValues.push(addr.addressLine1.replace(full, extractSource(abbrev)));
            }
        }
        streetValues = [...ogStreetValues, ...variantStreetValues];
    }
    while (stateValues.length * streetValues.length > MAX_NUM_FILTERS) {
        streetValues.pop(); // remove last street value until we are under the limit
    }
    for (const street of streetValues) {
        for (const state of stateValues) {
            const variant: Address = {
                ...addr,
                addressLine1: street,
                stateAbbreviation: state,
                stateName: state,
                id: `${street}-${state}-${addr.zipCode}`.replace(/\s+/g, '-').toLowerCase()
            };
            if (!addressVariants.some(av => av.id === variant.id)) {
                addressVariants.push(variant);
            }
        }
    }
    return addressVariants;
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