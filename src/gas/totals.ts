/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { version } from '../version';

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function resetTotalSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        // delete the previous HODL Totals sheet, if any
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HODL Totals')?.clear();
        if (sheet != null) {
            sheet.clear();
            sheet.getFilter()?.remove();
        } else {
            sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('HODL Totals', 0);
        }

        // Initial set of categories provided out of the box
        const header = ['      ↩ Sheet     ', '     Holdings     ', '      Coin      ', '    Last Reconciliation    ', '       Off By       ', '    Last Calculation    ', '     Calc Status     '];

        // populate the header cells
        sheet.getRange('1:1').addDeveloperMetadata('version', version);
        sheet.getRange('A1:G1').setValues([header]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A1:G1').setBackground('#DDDDEE');

        // walk through all sheets in workbook to pick out the coin names & links
        const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
        const ssUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
        const excludedSheetNames = ["HODL Totals","Wallets/Accounts","Categories", "NFT Categories"];
        var rowCount = 1;
        for (var s in allSheets) {
            var coinSheet = allSheets[s];

            // Stop iteration execution if the condition is meet.
            if(excludedSheetNames.indexOf(coinSheet.getName()) == -1) {
                const newCoinName = coinSheet.getName().replace(/ *\([^)]*\) */g, '');
                const newCoinSheetUrl = `${ssUrl}#gid=${coinSheet.getSheetId()}`;
                rowCount++;
                const data = [`=HYPERLINK("${newCoinSheetUrl}","${newCoinName}")`, `=INDIRECT("'"&$A${rowCount}&"'!$C$1")`, newCoinName, `=INDIRECT("'"&$A${rowCount}&"'!$E$1")`,
                    `=INDIRECT("'"&$A${rowCount}&"'!$G$1")`, `=INDIRECT("'"&$A${rowCount}&"'!$S$1")`, `=INDIRECT("'"&$A${rowCount}&"'!$T$1")`];
                sheet.appendRow(data);
            }
        }

        // create filter around all populated coin rows
        sheet.getRange(`A1:G${rowCount}`).createFilter();

        // autosize the columns' widths to fit content
        sheet.autoResizeColumns(1, 7);
        SpreadsheetApp.flush();
        
        return sheet;
    }
    return null;
}
