/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { version } from '../version';

/* global GoogleAppsScript */
/* global SpreadsheetApp */

/**
 * A function that adds Categories data and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function newWalletsSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Wallets/Accounts');

        // Format of the Wallets/Accounts page
        const header = ['      Wallet/Account     ', '     Balance     ', '       Coin       ', '       on Date       ', '   Unique Wallet/Account Name   ', '    Coin Total    '];

        // populate the header cells
        sheet.getRange('1:1').addDeveloperMetadata('version', version);
        sheet.getRange('A1:F1').setValues([header]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A1:F1').setBackground('#DDDDEE');

        // walk through all sheets in workbook to pick out the coin names & links
        const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
        const excludedSheetNames = ['HODL Totals', 'Wallets/Accounts', 'Categories', 'NFT Categories'];
        let rowCount = 1;
        for (const coinSheet of allSheets) {
            // Stop iteration execution if the condition is meet.
            if (!excludedSheetNames.includes(coinSheet.getName())) {
                const newCoinName = coinSheet.getName().replace(/ *\([^)]*\) */g, '');
                rowCount += 1;
                const data = [`Wallet Name ${rowCount-1}`, '', newCoinName, '2009-01-03', `=IF(A2>0,CONCATENATE(A${rowCount}," (",C${rowCount},")"), "")`, `=SUMIF($C$${rowCount}:$C,$C${rowCount},$B$${rowCount}:$B)`];
                sheet.appendRow(data);
            }
        }

        // create filter around all populated coin rows
        sheet.getRange(`A1:F${rowCount}`).createFilter();

        // autosize the columns' widths, add conditional formatting
        sheet.autoResizeColumns(1, 6);
        SpreadsheetApp.flush();

        return sheet;
    }
    return null;
}

// import getLastRowWithDataPresent from '../last-row';
// export updateWallets or formatWallets()
// {
// const lastRow = getLastRowWithDataPresent(sheet.getRange('E:E').getValues() as string[][]);
// format all populated coin rows
// sheet.getRange(`D2:D${rowCount}`).setNumberFormat('yyyy-mm-dd');
// create filter around all populated coin rows
// sheet.getRange(`A1:F${rowCount}`).createFilter();
// }
