/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { version } from '../version';

/**
 * A function that adds columns and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function newTotalsSheet(newCoinName: string | null, newCoinSheetUrl: string | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    // Initial set of categories provided out of the box
    const header = ['      ↩ Sheet     ', '     Holdings     ', '      Coin      ', '    Last Reconciliation    ', '       Off By       ', '    Last Calculation    ', '     Calc Status     '];

    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('HODL Totals', 0);

        // populate the header cells
        sheet.getRange('1:1').addDeveloperMetadata('version', version);
        sheet.getRange('A1:G1').setValues([header]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A1:G1').setBackground('#DDDDEE');

        // create data for the new coin
        const data = [`=HYPERLINK("${newCoinSheetUrl}","${newCoinName}")`, `=INDIRECT("'"&$A2&"'!$C$1")`, newCoinName,
            `=INDIRECT("'"&$A2&"'!$E$1")`, `=INDIRECT("'"&$A2&"'!$G$1")`, `=INDIRECT("'"&$A2&"'!$S$1")`, `=INDIRECT("'"&$A2&"'!$T$1")`];
        sheet.appendRow(data);

        // create filter around all transactions
        sheet.getFilter()?.remove();
        sheet.getRange('A1:G2').createFilter();

        // autosize the columns' widths to fit content
        sheet.autoResizeColumns(1, 7);
        SpreadsheetApp.flush();
        
        return sheet;
    }
    return null;
}
