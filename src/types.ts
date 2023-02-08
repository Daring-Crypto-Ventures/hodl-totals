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

// types used for cost basis calculation
export type CompleteNFTDataRow = [
    string, // A  or col#1 | d[0]:   In Tx ✔ (TRUE or FALSE)
    string, // B  or col#2 | d[1]:   Collection
    string, // C  or col#3 | d[2]:   NFT ID
    string, // D  or col#4 | d[3]:   NFT In Tx(s)
    string, // E  or col#5 | d[4]:   NFT In Description
    Date | string, // F  or col#6 | d[5]:   Date & Time (string: yyyy-mm-dd h:mm:ss)
    string, // G  or col#7 | d[6]:   Inflow Category (dropdown)
    number, // H  or col#8 | d[7]:   Acq Price
    number, // I  or col#9 | d[8]:   Acq Price (USD)
    number, // J  or col#10 | d[9]:  Tx Fees
    number, // K  or col#11 | d[10]: Tx Fees (USD)
    number, // L  or col#12 | d[11]: Cost Basis Adj
    number, // M  or col#13 | d[12]: Cost Basis Adj (USD)
    number, // N  or col#14 | d[13]: Cost Basis
    number, // O  or col#15 | d[14]: Cost Basis (USD)
    string, // P  or col#16 | d[15]: In Tx Status
    string, // Q  or col#17 | d[16]: In Tx Tax Doc Link
    string, // R  or col#18 | d[17]: Out Tx ✔ (TRUE or FALSE)
    string, // S  or col#19 | d[18]: NFT Out Tx(s)
    string, // T  or col#20 | d[19]: NFT Out Description
    string, // U  or col#21 | d[20]: Outflow Category (dropdown)
    Date | string, // V  or col#22 | d[21]: Date & Time (string: yyyy-mm-dd h:mm:ss)
    number, // W  or col#23 | d[22]: Sale Price
    number, // X  or col#24 | d[23]: Sale Price (USD)
    number, // Y  or col#25 | d[24]: Tx Fees
    number, // Z  or col#26 | d[25]: Tx Fees (USD)
    number, // AA or col#27 | d[26]: Selling Fees
    number, // AB or col#28 | d[27]: Selling Fees (USD)
    number, // AC or col#29 | d[28]: Proceeds
    number, // AD or col#30 | d[29]: Proceeds (USD)
    number, // AE or col#31 | d[30]: Gain(Loss)
    string, // AF or col#32 | d[31]: Out Tx Status
    string, // AG or col#33 | d[32]: Out Tx Tax Doc Link
    ...string[]];
