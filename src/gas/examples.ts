/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

/* global GoogleAppsScript */
/* global SpreadsheetApp */

import resetTotalSheet from './totals';
import { newCategorySheet, newNFTCategorySheet } from './categories';
import { formatSheet } from './format';
import { newCoinSheet_ } from './menu';
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

    if ((typeof ScriptApp !== 'undefined') && (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories') == null)) {
        newNFTCategorySheet();
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

    // first reset totals sheet to populate the correct wallets
    resetTotalSheet();

    // format coin sheets after reseting the Totals sheet to make reconciliation dropdowns correct
    formatSheet(newSheet1);
    formatSheet(newSheet2);

    return newSheet1;
}

/**
 * Classically known as "the Fair Market Value example"
 *
 */
function coin1Example(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const initialData: string[][] = [
        ['FALSE', 'Metamask Main Address', 'aaa1112222333bbb', 'Distributed on project launch day to people who performed the requested actions on twitter', '2015-12-01 15:20:10', 'Active Airdrop', '+1.0', 'Avg Daily Price Variation', '1.00000000', '', '', '', '1.111100', '0.992222', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', 'BBBB444445555CCC', 'coinbase.com Coinbase Earn pretendCOIN promotion', '2018-02-28 20:23:59', 'Promotion', '+1.0', 'Value Known', '1.00000000', '1', '', '', '0', '0', '0', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'Ccccc6666667777ddddddd', 'Spent 1 pretendCOIN on a digital ticket to a concert in the metaverse, tx fee included', '2018-03-01 2:04:01', 'Spent', '-1.0', 'Value Known', '', '', '1.00000000', '5', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'eeee-89898989-fffff', 'Offline purchase of 23 pretendCOIN from John Doe @ 34 USD/pretendCOIN', '2019-02-28 0:00:02', 'USD Deposit', '+23.0', 'Price Known', '23.00000000', '', '', '', '0', '0', '34', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'deadbeef42deadbeef69', 'pretendCOIN1, pretendCOIN2: Uniswap traded 2 pretendCOIN for 0.0025 pretendCOIN2', '2021-04-01 0:15:00', 'Traded', '-2.0', 'Avg Daily Price Variation', '', '', '2.00000000', '', '2.312002', '1.8222', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', '345sixSEVENeight9ten', 'Tx Fee to Transfer my Metamask balance to binance for cash out', '2021-04-01 12:00:05', 'Tx Fee', '-0.02', 'Value Known', '', '', '0.02000000', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', '345sixSEVENeight9ten', 'Transfer my Metamask balance to binance for cash out', '2021-04-01 12:00:05', 'Transfer', '-20.98', 'n/a', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Binance.us Account', '345sixSEVENeight9ten', 'Transfer my Metamask balance to binance for cash out', '2021-04-01 12:00:05', 'Transfer', '+20.98', 'n/a', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Binance.us Account', 'IJijIJijIJijIJ3434334343', 'binance.us traded 20 pretendCOIN for USD', '2021-04-02 9:00:00', 'USD Withdrawal', '-20.0', 'Avg Daily Price Variation', '', '', '20.00000000', '', '=0.0003561*7088.25', '=0.0003561*6595.92', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'onetwo3456seven-EightNine', 'unsolicited distribution of pretendCOIN from a total stranger sent to random addresses', '2022-05-31 10:12:12', 'Passive Airdrop', '+26.92', 'Avg Daily Price Variation', '26.92000000', '', '', '', '=0.0069319*9700.34/I12', '=0.0069319*9432.3/I12', '', '', '', '', '', '', ''],
    ];
    initialData.push(...instructionData());

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    updateFMVFormulas(sheet);
    // calculateCoinGainLoss(sheet);
}

/**
 * Classically known as "the cost basis example"
 *
 */
function coin2Example(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // sample data set
    const initialData: string[][] = [
        ['FALSE', 'Coinbase Account', '321432-babbcd-00435', 'Crypto given to me at SXSW by a friendly entrepenuer', '2017-03-15 0:00:00', 'Gift Received', '+0.2', 'Value Known', '0.20000000', '200.00', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', '88811-eee-pl33z', 'Purchased at coinbase for $600, fees included', '2018-02-01 0:00:48', 'USD Deposit', '+0.6', 'Value Known', '0.60000000', '600.00', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', '8576309-yolo-8576309', 'Bought a pizza with pretendCOIN2', '2018-02-01 9:23:45', 'Spent', '-0.05', 'Value Known', '0', '0', '0.05000000', '100.00', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', '8576309-yolo-8576309', 'Tx Fee for buying a pizza with pretendCOIN2', '2018-02-01 9:23:45', 'Tx Fee', '-0.05', 'Value Known', '0', '0', '0.05000000', '100.00', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', '77777rrre5re5re5re5re77777', 'Sold pretendCOIN2 for $601.11 USD on coinbase, fees included', '2018-03-21 17:20:22', 'USD Withdrawal', '-0.3', 'Value Known', '0', '0', '0.30000000', '601.11', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'eeeeyyyyoorree5555bbbbdddaaaayyy', 'Distributed to everyone that filled out the gleam.io form last month', '2018-03-22 8:08:08', 'Active Airdrop', '+0.4', 'Value Known', '0.40000000', '400.00', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Coinbase Account', 'yyyyzzz-343434-525210', 'Transfer from Coinbase to Metamask', '2018-03-23 9:09:09', 'Transfer', '-0.4', 'Value Known', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', '1a2b3c4d5e6f7g8h9i10j11k12l13m14n15o16p', 'Transfer from Coinbase to Metamask', '2018-03-23 9:11:50', 'Transfer', '+0.4', 'Value Known', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'deadbeef42deadbeef69', 'pretendCOIN1, pretendCOIN2: Uniswap traded 2 pretendCOIN for 0.6 pretendCOIN2', '2021-04-01 0:15:00', 'Traded', '+0.6', 'Value Known', '0.60000000', '108.50', '', '', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'e11it3hkr8zb3wr3maB2much4u2hnd13', 'Tx Fee for buying sweet NFT #4242', '2022-03-06 13:10:11', 'Tx Fee', '-0.05', 'Value Known', '0', '0', '0.05000000', '50.00', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'e11it3hkr8zb3wr3maB2much4u2hnd13', 'Bought sweet NFT #4242', '2022-03-06 13:10:11', 'Sold for Goods', '-0.1', 'Value Known', '0', '0', '0.10000000', '100.00', '', '', '', '', '', '', '', '', ''],
        ['FALSE', 'Metamask Main Address', 'fu72fu72fu72fu72fu72fu72fu72', 'prentedCOIN2 Gift for my boo', '2022-03-07 10:00:00', 'Given Away', '-0.1', 'Value Known', '0', '0', '0.10000000', '200.00', '', '', '', '', '', '', '', '', ''],
    ];
    initialData.push(...instructionData());

    for (let i = 0; i < initialData.length; i++) {
        sheet.getRange(`A${i + 3}:U${i + 3}`).setValues([initialData[i]]);
    }

    updateFMVFormulas(sheet);
    // calculateCoinGainLoss(sheet);
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
        ['FALSE', '', '', 'For each transaction, provide wallet/account information and transaction IDs.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
