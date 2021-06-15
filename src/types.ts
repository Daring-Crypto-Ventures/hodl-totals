/**
 * types used in HODL Totals functions
 *
 */

// types used for data validation
export type sevenPackDataRow = [string, string, string, number, number, number, number];
export type sevenPackLooselyTypedDataRow = [string, string, string, string | number, string | number, string | number, string | number];

// types used for cost basis calculation
export type completeDataRow = [string, string, string, number, number, number, number, string, number, number, ...string[] ];
