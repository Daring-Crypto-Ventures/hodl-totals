/**
 * types used in HODL Totals functions
 *
 */

// types used for data validation
export type DataValidationRow = [
    string, // E: Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // F: Category (dropdown)
    number, // G: Net Change
    string, // H: Valuation Strategy (dropdown)
    number, // I: Coin Acquired
    number, // J: Value (USD)
    number, // K: Coin Disposed
    number, // L: Value (USD)
];
export type LooselyTypedDataValidationRow = [
    string, // E: Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // F: Category (dropdown)
    number, // G: Net Change
    string, // H: Valuation Strategy (dropdown)
    string | number, // I: Coin Acquired
    string | number, // J: Value (USD)
    string | number, // K: Coin Disposed
    string | number // L: Value (USD)
];

// types used for cost basis calculation
export type CompleteDataRow = [
    string, // A: Tx ✔ (TRUE or FALSE)
    string, // B: All Wallets & Accounts (dropdown)
    string, // C: Transaction ID
    string, // D: Description
    string, // E: Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // F: Category (dropdown)
    number, // G: Net Change
    string, // H: Valuation Strategy (dropdown)
    number, // I: Coin Acquired
    number, // J: Value (USD)
    number, // K: Coin Disposed
    number, // L: Value (USD)
    string, // M: Coin High
    string, // N: Coin Low
    string, // O: Coin Price
    string, // P: Lot ID
    string, // Q: Date Acquired
    string, // R: Status
    number, // S: Cost Basis
    number, // T: Gain (Loss)
    string, // U: Summarized In
    ...string[]];
export type CompleteDataRowAsStrings = [ ...string[] ];
