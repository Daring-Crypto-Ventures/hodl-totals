/**
 * types used in HODL Totals functions
 *
 */

// types used for data validation
export type DataValidationRow = [
    Date | string, // E: Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // F: Category (dropdown)
    number, // G: Net Change
    string, // H: Valuation Strategy (dropdown)
    number, // I: Coin Acquired
    number, // J: Value (USD)
    number, // K: Coin Disposed
    number, // L: Value (USD)
];
export type LooselyTypedDataValidationRow = [
    Date | string, // E: Date & Time (string: yyyy-mm-dd h:mm:ss)
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
    string, // A or col#1 | d[0]:   Tx ✔ (TRUE or FALSE)
    string, // B or col#2 | d[1]:   All Wallets & Accounts (dropdown)
    string, // C or col#3 | d[2]:   Transaction ID
    string, // D or col#4 | d[3]:   Description
    string, // E or col#5 | d[4]:   Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // F or col#6 | d[5]:   Category (dropdown)
    number, // G or col#7 | d[6]:   Net Change
    string, // H or col#8 | d[7]:   Valuation Strategy (dropdown)
    number, // I or col#9 | d[8]:   Coin Acquired
    number, // J or col#10 | d[9]:  Value (USD)
    number, // K or col#11 | d[10]: Coin Disposed
    number, // L or col#12 | d[11]: Value (USD)
    string, // M or col#13 | d[12]: Coin High
    string, // N or col#14 | d[13]: Coin Low
    string, // O or col#15 | d[14]: Coin Price
    string, // P or col#16 | d[15]: Lot Information
    string, // Q or col#17 | d[16]: Date Acquired
    string, // R or col#18 | d[17]: Status
    number, // S or col#19 | d[18]: Cost Basis
    number, // T or col#20 | d[19]: Gain (Loss)
    string, // U or col#21 | d[20]: Tax Doc Link
    ...string[]];
export type CompleteDataRowAsStrings = [ ...string[] ];
