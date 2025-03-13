/**
 * @file ColumnEnums.js
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