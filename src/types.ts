/**
 * types used in HODL Totals functions
 *
 */

// types used for data validation
export type sixPackDataRow = [string, string, number, number, number, number];
export type sixPackLooselyTypedDataRow = [string, string, string | number, string | number, string | number, string | number];

// types used for cost basis calculation
export type tenPackDataRow = [string, string, number, number, number, number, string, number, number, string ];

// types used for fiar market value calculation
export type thirteenPackDataRow = [string, string, number, number, number, number, string, number, number, string, string, string, string];
