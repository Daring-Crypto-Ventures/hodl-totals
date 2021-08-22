/**
 * types used in HODL Totals functions
 *
 */

// types used for data validation
export type SevenPackDataRow = [string, string, string, number, number, number, number];
export type SevenPackLooselyTypedDataRow = [string, string, string, string | number, string | number, string | number, string | number];

// types used for cost basis calculation
export type CompleteDataRow = [string, string, string, number, number, number, number, string, number, number, ...string[] ];
export type FormulaDataRow = [ ...string[] ];
