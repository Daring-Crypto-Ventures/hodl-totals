/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

/* global GoogleAppsScript */
/* global SpreadsheetApp */

import resetTotalSheet from './totals';
import newCategorySheet from './categories';
import { formatSheet } from './format';
import { newCoinSheet_ } from './menu';
import { calculateCoinGainLoss } from './calculate';
import { updateFMVFormulas } from './fmv';

/**
 * Creates example coins with data showing how HODL Totals works
 *
 * @return the first of the two sheets that are created
 */
export function loadExample_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // if no Categories sheet previously exists, create one
    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null)) {
        newCategorySheet();
    }

    // delete any pre-existing pretendCOIN example sheets
    if (typeof ScriptApp !== 'undefined') {
        const sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('pretendCOIN1');
        const sheet2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('pretendCOIN2');
        if (sheet1 != null) {
            SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet1);
        }
        if (sheet2 != null) {
            SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet2);
        }
    }

    const newSheet1 = newCoinSheet_('pretendCOIN1');
    const newSheet2 = newCoinSheet_('pretendCOIN2');
    if (newSheet1 !== null) {
        coin1Example(newSheet1);
    }
    if (newSheet2 !== null) {
        coin2Example(newSheet2);
    }

    resetTotalSheet();

    return newSheet1;
}

/**
 * Classically known as "the Fair Market Value example"
 *
 */
function coin1Example(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const initialData: string[][] = [
        ['FALSE', '', '', 'Distributed on project launch day to people who performed the requested actions on twitter', '2015-12-01', 'Active Airdrop', '+1.0', 'Avg Daily Price Variation', '1.00000000', '', '', '', '1.111100', '0.992222', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'coinbase.com Coinbase Earn pretendCOIN promotion', '2018-02-28', 'Promotion', '+1.0', 'Value Known', '1.00000000', '1', '', '', '0', '0', '0', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Spent 1 pretendCOIN on a digital ticket to a concert in the metaverse', '2018-03-01', 'Spent', '-1.0', 'Value Known', '', '', '1.00000000', '5', '', '', '0', '0', '0', '', '', '', ''],
        ['FALSE', '', '', 'Bought 23 pretendCOIN from John Doe @ 34 USD/pretendCOIN', '2019-02-28', 'USD Deposit', '+23.0', 'Price Known', '23.00000000', '', '', '', '0', '0', '34', '', '', '', '', '', ''],
        ['FALSE', '', '', 'pretendCOIN, ETH: Uniswap traded 2 pretendCOIN for 0.0025 ETH', '2021-04-01', 'Traded', '-2.0', 'Avg Daily Price Variation', '', '', '2.00000000', '', '2.312002', '1.8222', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'binance.us traded 20 pretendCOIN for USD', '2021-04-02', 'USD Withdrawal', '-20.0', 'Avg Daily Price Variation', '', '', '20.00000000', '', '=0.0003561*7088.25', '=0.0003561*6595.92', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'unsolicited distribution of pretendCOIN from a total stranger sent to random addresses', '2022-05-31', 'Passive Airdrop', '+26.92', 'Avg Daily Price Variation', '26.92000000', '', '', '', '=0.0069319*9700.34/I9', '=0.0069319*9432.3/I9', '', '', '', '', '', '', ''],
    ];
    initialData.push(...instructionData());

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet(sheet);
    updateFMVFormulas(sheet);
    calculateCoinGainLoss(sheet);
}

/**
 * Classically known as "the cost basis example"
 *
 */
function coin2Example(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const initialData: string[][] = [
        ['FALSE', '', '', 'xxx', '2017/01/01', 'Gift Received', '+0.2', 'Value Known', '0.20000000', '2000.00', '0', '0', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/02/01', 'USD Deposit', '+0.6', 'Value Known', '0.60000000', '6000.00', '0', '0', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/02/01', 'Spent', '-0.05', 'Value Known', '0', '0', '0.05000000', '1000.00', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/01', 'Tx Fee', '-0.05', 'Value Known', '0', '0', '0.05000000', '1000.00', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/01', 'Traded', '-0.3', 'Value Known', '0', '0', '0.30000000', '6000.00', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', '', '2018/03/02', 'Active Airdrop', '+0.4', 'Value Known', '0.40000000', '4000.00', '0', '0', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/03', 'USD Deposit', '+0.8', 'Value Known', '0.80000000', '8000.00', '0', '0', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/04', 'Bounty Fulfilled', '+0.6', 'Value Known', '0.60000000', '6000.00', '0', '0', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', '', '2018/03/05', 'Tx Fee', '-0.1', 'Value Known', '0', '0', '0.10000000', '500.00', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/06', 'Spent', '-0.1', 'Value Known', '0', '0', '0.10000000', '1000.00', '', '', '', '', '', '', '0', '0', ''],
        ['FALSE', '', '', 'xxx', '2018/03/07', 'Spent', '-0.1', 'Value Known', '0', '0', '0.10000000', '2000.00', '', '', '', '', '', '', '0', '0', ''],
    ];
    initialData.push(...instructionData());

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    formatSheet(sheet);
    updateFMVFormulas(sheet);
    calculateCoinGainLoss(sheet);
}

/**
 * Instructions to tack onto the bottom of all example coins
 *
 */
function instructionData(): string[][] {
    const instructionsData: string[][] = [
        ['FALSE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'THE BASICS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Do not enter data into the gray columns of any HODL Totals sheet. This content is always calculated.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Enter coin inflows as positive numbers in the Net Change column.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Enter coin outflows as negative numbers in the Net Change column.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If some amount of coin entered your control, also enter that coin amount in the Acquired column.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If some amount of coin left your control, also enter that coin amount in the Disposed column.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If you know the USD value of the coin amount, set the Valuation Strategy to \'Value Known\' and record this in the neighboring Value(USD) column.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If the transaction is a transfer between addresses you control, set the Category to \'Transfer\', Valuation Strategy to \'n/a\'.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'VERIFY THE ACCURACY OF YOUR SHEETS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Provide wallet/account information and transaction IDs for each transaction.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Use the Tx ✔ columnn to track your progress while updating/reconciling each transaction.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Reset the HODL Totals sheet at any time to refresh the summary of your holdings.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Enter your holdings on the HODL Totals sheet periodically to reconcile your records with reality.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Use the notes column to record details about your wallet, address or account.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'DETERMINE FAIR MARKET VALUE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Grab High/Lows from historical values tab on https://coinmarketcap.com', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD amount paid to receive the coin is known, enter in the Fiat Value column and set strategy to \'Value Known\'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD amount received for the coin is known, enter the in the Fiat Value column and set strategy to \'Value Known\'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If USD purchase/sale price per coin is known, enter in the FMV Price column and set strategy to \'Price Known\'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'High/Low cells can contain formulas that translate sales of coin to BTC, to USD.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'CACULATE YOUR GAIN/LOSS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'The transactions must be sorted into chronological order before a calculation can run.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'The status column provides useful information for each transaction.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'If a sale includes short and long-term components, it is split.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', '', '', 'Use the notes column to store links to any other sheets that summarize the gain/loss', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];
    return instructionsData;
}
