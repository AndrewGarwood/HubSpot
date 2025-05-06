/** 
 * @file Column.js
 */

// Column ----------------
/**
 *- aggregation: AggregationEnum != null => role === ColumnRoleEnum.MEASURE 
 *- fixed: Array<string> != null => fixedMeasure === true
 * @typedef {Object} Column
 * @property {string} alias
 * @property {ColumnField} field
 * @property {ColumnDomainEnum} domain
 * @property {ColumnRoleEnum} role
 * @property {string} [name]
 * @property {ColumnSort} sort
 * @property {Limit} limit
 * @property {boolean} fixedMeasure
 * @property {Array<string>} [fixed]
 * @property {ColumnAggregationEnum} [aggregation]
 * @property {ColumnTransform} [transform]
 * @property {ColumnUndefinedBucketEnum} [undefinedBucket]
 * @property {boolean} [preserveCase]
 * @property {boolean} [includeUndefinedBuckets]
 * @property {boolean} [symmetricAggregation]
 * @property {boolean} [useFiscalYear]
 * @export
 */

// ColumnField ----------------
/**
 *- name: string = propertyName 
 * @typedef {Object} ColumnField
 * @property {ColumnFieldSourceEnum} source
 * @property {TablePrimaryObjectNameEnum} table
 * @property {string} name
 * @property {PropertyTypeEnum} type
 * @export
 */


// ColumnTransform ----------------
/**
 * @typedef {Object} ColumnTransform
 * @property {ColumnTransformTypeEnum} type
 * @property {Array<ColumnTransformArgumentEnum>} arguments
 * @export
 */

// ColumnSort ----------------
/**
 *- by: string = a column.alias
 * @typedef {Object} ColumnSort
 * @property {number} priority
 * @property {ColumnSortTypeEnum} type
 * @property {ColumnSortOrderEnum} order
 * @property {string} by
 * @property {boolean} nested
 * @export
 */

// Limit ----------------
/**
 *- count: number = number of rows to return 
 *- forDimension: string = a column.alias, where column.role === 'DIMENSION'
 *- byMeasure: string = a column.alias, where column.role === 'MEASURE'
 * @typedef {Object} ColumnLimit
 * @property {ColumnSortOrderEnum} direction
 * @property {number} count
 * @property {string} forDimension
 * @property {string} byMeasure
 * @export
 */


/**
 * @enum {string} ColumnFieldSourceEnum
 * @readonly
 * @export
 *- TABLE
 */
export const ColumnFieldSourceEnum = {
    TABLE: 'TABLE',
};
/**
 * @enum {string} ColumnUndefinedBucketEnum
 * @readonly
 * @export
 *- MISSING
 */
export const ColumnUndefinedBucketEnum = {
    MISSING: '@@MISSING@@',
};

/**
 * @enum {string} ColumnDomainEnum
 * @readonly
 * @export
 *- DISCRETE
 *- CONTINUOUS
 */
export const ColumnDomainEnum = {
    DISCRETE: 'DISCRETE',
    CONTINUOUS: 'CONTINUOUS',
};

/**
 * @enum {string} ColumnRoleEnum
 * @readonly
 * @export
 *- MEASURE
 *- DIMENSION
 */
export const ColumnRoleEnum = {
    MEASURE: 'MEASURE',
    DIMENSION: 'DIMENSION',
};

/**
 * @enum {string} ColumnAggregationEnum
 * @readonly
 * @export
 *- SUM
 *- AVERAGE
 *- DISTINCT_COUNT
 *- Median 
 */
export const ColumnAggregationEnum = {
    SUM: 'SUM',
    AVERAGE: 'AVERAGE',
    DISTINCT_COUNT: 'DISTINCT_COUNT',
    MEDIAN: 'MEDIAN',
};

/**
 * @enum {string} SortOrderEnum
 * @readonly
 * @export
 *- ASCENDING
 *- DESCENDING
 */
export const ColumnSortOrderEnum = {
    ASCENDING: 'ASCENDING',
    DESCENDING: 'DESCENDING',
};

/**
 * @enum {string} SortTypeEnum
 * @readonly
 * @export
 *- VALUE
 *- 
 */
export const ColumnSortTypeEnum = {
    VALUE: 'VALUE',
};

/**
 * @enum {string} ColumnTransformTypeEnum
 * @readonly
 * @export
 *- DATE_TRUNC
 */
export const ColumnTransformTypeEnum = {
    DATE_TRUNC: 'DATE_TRUNC',
};

/**
 * @enum {string} ColumnTransformArgumentEnum
 * @readonly
 * @export
 *- MONTH
 *- YEAR
 *- DAY 
 */
export const ColumnTransformArgumentEnum = {
    MONTH: 'MONTH',
    YEAR: 'YEAR',
    DAY: 'DAY',
};