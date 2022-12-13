/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * example0: Populates spreadsheet with Bitcoin data, no complex FMV calcs
 * example1: Populates spreadsheet with Altcoin data, more complex FMV calcs
 *
 */

/* global GoogleAppsScript */
/* global SpreadsheetApp */

import resetTotalSheet from './totals';
import newCategorySheet from './categories';
import { newCoinSheet_, formatSheet_, calculateFIFO_ } from './menu';
import { CompleteDataRow } from '../types';

export function loadCostBasisExample_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // if no Categories sheet previously exists, create one
    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null)) {
        newCategorySheet();
    }

    const newSheet = newCoinSheet_();
    if (newSheet !== null) {
        costBasisExample(newSheet);
    }

    resetTotalSheet();

    return newSheet;
}

function costBasisExample(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const data: CompleteDataRow[] = [
        ['FALSE', '', '', 'Enter coin buys in the left-hand columns. Include fees in the cost.', '2017/01/01', 'Gift Received', +0.2, 'Value Known', 0.20000000, 2000.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'Enter everything in chronological order.', '2018/02/01', 'USD Deposit', +0.6, 'Value Known', 0.60000000, 6000.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'Enter coin sales in the right-hand columns, again, including fees.', '2018/02/01', 'Spent', -0.05, 'Value Known', 0, 0, 0.05000000, 1000.00, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'The status column provides useful information for each transaction.', '2018/03/01', 'Tx Fee', -0.05, 'Value Known', 0, 0, 0.05000000, 1000.00, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'If a sale includes short and long-term components, it is split.', '2018/03/01', 'Traded', -0.3, 'Value Known', 0, 0, 0.30000000, 6000.00, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', '', '2018/03/02', 'Active Airdrop', +0.4, 'Value Known', 0.40000000, 4000.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'If you would like to sort or filter to analyze your results, it is', '2018/03/03', 'USD Deposit', +0.8, 'Value Known', 0.80000000, 8000.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'recommended that you copy the results to a blank spreadsheet.', '2018/03/04', 'Bounty Fulfilled', +0.6, 'Value Known', 0.60000000, 6000.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', '', '2018/03/05', 'Tx Fee', -0.1, 'Value Known', 0, 0, 0.10000000, 500.00, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'Create a copy of the blank spreadsheet for each coin you trade', '2018/03/06', 'Spent', -0.1, 'Value Known', 0, 0, 0.10000000, 1000.00, '', '', '', '', '', '', 0, 0, ''],
        ['FALSE', '', '', 'Use the notes column to keep track of fees, trades details, etc.', '2018/03/07', 'Spent', -0.1, 'Value Known', 0, 0, 0.10000000, 2000.00, '', '', '', '', '', '', 0, 0, '']];
    const initialData = data as string[][];

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet_();
    calculateFIFO_();
}

export function loadFMVExample_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // if no Categories sheet previously exists, create one
    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null)) {
        newCategorySheet();
    }

    const newSheet = newCoinSheet_();
    if (newSheet !== null) {
        fmvExample(newSheet);
    }

    resetTotalSheet();

    return newSheet;
}

function fmvExample(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const initialData: string[][] = [
        ['FALSE', '', '', 'Grab High/Lows from historical values tab on https://coinmarketcap.com', '2015-12-01', 'USD Deposit', '+1.0', 'Avg Daily Price Variation', '1.00000000', '', '', '', '1.111100', '0.992222', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD amount paid to receive the coin is known, enter in the Fiat Value column and set strategy to \'Value Known\'', '2016-02-29', 'USD Deposit', '+1.0', 'Value Known', '1.00000000', '1', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD amount received for the coin is known, enter the in the Fiat Value column and set strategy to \'Value Known\'', '2016-03-01', 'Spent', '-1.0', 'Value Known', '', '', '1.00000000', '5', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD purchase/sale price per coin is known, enter in the FMV Price column and set strategy to \'Price Known\'', '2018-02-28', 'USD Deposit', '+23.0', 'Price Known', '23.00000000', '', '', '', '', '', '34', '', '', '', '', '', ''],
        ['FALSE', '', '', 'High/Low cells can contain formulas that translate sales of coin to BTC, to USD.', '2020-04-01', 'Traded', '-2.0', 'Avg Daily Price Variation', '', '', '2.00000000', '', '2.312002', '1.8222', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'e.g. Sale Outcome Known: binance.us traded 20 TEST for 0.0003561 BTC', '2020-04-02', 'USD Withdrawal', '-20.0', 'Avg Daily Price Variation', '', '', '20.00000000', '', '=0.0003561*7088.25', '=0.0003561*6595.92', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'i.e. Purchase Price Known: coinbase.com traded BTC for 26.92 TEST @ 0.0069319', '2020-05-31', 'Passive Airdrop', '+26.92', 'Avg Daily Price Variation', '26.92000000', '', '', '', '=0.0069319*9700.34/I9', '=0.0069319*9432.3/I9', '', '', '', '', '', '', '']
    ];

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet_();
    calculateFIFO_();
}
