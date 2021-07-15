/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * example0: Populates spreadsheet with Bitcoin data, no complex FMV calcs
 * example1: Populates spreadsheet with Altcoin data, more complex FMV calcs
 *
 */
/* global SpreadsheetApp */
import newCategorySheet from './categories';
import { newCurrencySheet_, formatSheet_, calculateFIFO_ } from './menu';

export function loadCostBasisExample_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // if no Categories sheet previously exists, create one
    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null)) {
        newCategorySheet();
    }

    const newSheet = newCurrencySheet_();
    if (newSheet !== null) {
        costBasisExample(newSheet);
    }
    return newSheet;
}

function costBasisExample(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    // TODO stop including value known values in the FMV columns, as it breaks switching strategies
    const initialData: string[][] = [
        ['2017/01/01', 'Gift Received', 'Value Known', '0.20000000', '2000.00', '', '', '', '', '', 'Enter coin buys in the left-hand columns. Include fees in the cost.', 'value known', '', ''],
        ['2018/02/01', 'USD Deposit', 'Value Known', '0.60000000', '6000.00', '', '', '', '', '', 'Enter everything in chronological order.', 'value known', '', ''],
        ['2018/02/01', 'Spent', 'Value Known', '', '', '0.05000000', '1000.00', '', '', '', 'Enter coin sales in the right-hand columns, again, including fees.', 'value known', '', ''],
        ['2018/03/01', 'Tx Fee', 'Value Known', '', '', '0.05000000', '1000.00', '', '', '', 'The status column provides useful information for each transaction.', 'value known', '', ''],
        ['2018/03/01', 'Traded', 'Value Known', '', '', '0.30000000', '6000.00', '', '', '', 'If a sale includes short and long-term components, it is split.', 'value known', '', ''],
        ['2018/03/02', 'Active Airdrop', 'Value Known', '0.40000000', '4000.00', '', '', '', '', '', '', 'value known', '', ''],
        ['2018/03/03', 'USD Deposit', 'Value Known', '0.80000000', '8000.00', '', '', '', '', '', 'If you would like to sort or filter to analyze your results, it is', 'value known', '', ''],
        ['2018/03/04', 'Bounty Fulfilled', 'Value Known', '0.60000000', '6000.00', '', '', '', '', '', 'recommended that you copy the results to a blank spreadsheet.', 'value known', '', ''],
        ['2018/03/05', 'Tx Fee', 'Value Known', '', '', '0.10000000', '500.00', '', '', '', '', 'value known', '', ''],
        ['2018/03/06', 'Sales Revenue', 'Value Known', '', '', '0.10000000', '1000.00', '', '', '', 'Create a copy of the blank spreadsheet for each coin you trade', 'value known', '', ''],
        ['2018/03/07', 'Spent', 'Value Known', '', '', '0.10000000', '2000.00', '', '', '', 'Use the notes column to keep track of fees, trades details, etc.', 'value known', '', ''],
    ];

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:N${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet_();
    calculateFIFO_();
}

export function loadFMVExample_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // if no Categories sheet previously exists, create one
    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null)) {
        newCategorySheet();
    }

    const newSheet = newCurrencySheet_();
    if (newSheet !== null) {
        fmvExample(newSheet);
    }
    return newSheet;
}

function fmvExample(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    // TODO stop including value known, price known vlaues in the FMV columns, as it breaks switching strategies
    const initialData: string[][] = [
        ['2015-12-01', 'USD Deposit', 'Avg Daily Price Variation', '1.00000000', '', '', '', '', '', '', 'Grab High/Lows from historical values tab on https://coinmarketcap.com', '1.111100', '0.992222', ''],
        ['2016-02-29', 'USD Deposit', 'Value Known', '1.00000000', '1', '', '', '', '', '', 'If USD amount paid to receive the coin is known, enter in col C and \'value known\' in col J', 'value known', 'value known', ''],
        ['2016-03-01', 'Spent', 'Value Known', '', '', '1.00000000', '5', '', '', '', 'If USD amount received for the coin is known, enter in col E and \'value known\' in col J', 'value known', 'value known', ''],
        ['2018-02-28', 'USD Deposit', 'Price Known', '23.00000000', '', '', '', '', '', '', 'If USD purchase/sale price per coin is known, enter in col L and \'price known\' in col J', 'price known', 'price known', '34'],
        ['2020-04-01', 'Traded', 'Avg Daily Price Variation', '', '', '2.00000000', '', '', '', '', 'High/Low cells can contain formulas that translate sales of coin to BTC, to USD.', '2.312002', '1.8222', ''],
        ['2020-04-02', 'USD Withdrawal', 'Avg Daily Price Variation', '', '', '20.00000000', '', '', '', '', 'i.e. Sale Outcome Known: binance.us traded 20 TEST for 0.0003561 BTC', '=0.0003561*7088.25', '=0.0003561*6595.92', ''],
        ['2020-05-31', 'Passive Airdrop', 'Avg Daily Price Variation', '26.92000000', '', '', '', '', '', '', 'i.e. Purchase Price Known: coinbase.com traded BTC for 26.92 TEST @ 0.0069319', '=0.0069319*9700.34/D9', '=0.0069319*9432.3/D9', '']
    ];
    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:N${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet_();
    calculateFIFO_();
}
