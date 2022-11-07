/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { version } from '../version';
import { setFMVformulasOnSheet } from './fmv';
import getLastRowWithDataPresent from '../last-row';

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const desiredCurrency = sheet.getName().replace(/ *\([^)]*\) */g, '');

        // populate the two-row-tall header cells
        const header1 = [' ↩ Totals ', 'All Wallets & Accounts','', `${desiredCurrency} balance on `, '<unknown date>','was off by','0.000',
        `${desiredCurrency}`, 'Inflow', '', 'Outflow', '',
        'Fair Mkt Value', '','',
        'Last', 'FIFO Method', 'Calculation on','','', 'Income or Gain/Loss'];
        // NOTE: spaces are hard coded around header text that help autosizecolumns behave correctly
        const header2 = ['   Tx ✔   ','    All Wallet & Accounts    ', '    Transaction ID    ', '   Description   ', '    Date & Time    ', '       Category       ', '    Net Change    ',
        '        Valuation Strategy        ', `   ${desiredCurrency} Acquired   `, '    Value (USD)    ', `   ${desiredCurrency} Disposed   `, '    Value (USD)    ',
        `   ${desiredCurrency} High   `, `     ${desiredCurrency} Low     `, `    ${desiredCurrency} Price    `,
        '     Lot ID     ','    Date Acquired    ','   Status   ','        Cost Basis        ', '    Gain (Loss)    ', '   Summarized In   '];

        sheet.getRange('A1:U1').setValues([header1]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A2:U2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');

        // see if any row data exists beyond the header we just added
        const lastRow = getLastRowWithDataPresent(sheet.getRange('E:E').getValues());

        // set up row 1 cells for reconcilation
        sheet.getRange('1:1').addDeveloperMetadata('version', version);
        sheet.getRange('B1:H1').setBorder(false, true, false, true, false, false);
        sheet.getRange('G1').setValue('=$C$1-SUBTOTAL(109,$G$3:G)').setNumberFormat('+0.000;-0.000;0.000')
        sheet.getRange('H1').setHorizontalAlignment('left');

        // add borders to demarcate the row 1 headers into logical groups
        sheet.getRange('M1:O1').setBorder(false, true, false, true, false, false);
        sheet.getRange('T1').setFontWeight('normal').setBorder(false, true, false, true, false, false);

        // merge 1st row cell headers
        sheet.getRange('I1:J1').merge();
        sheet.getRange('K1:L1').merge();
        sheet.getRange('M1:O1').merge();

        // color background and freeze the header rows
        sheet.getRange('A1:U1').setBackground('#DDDDEE');
        sheet.getRange('A2:U2').setBackground('#EEEEEE');
        sheet.setFrozenRows(2);

        // set numeric formats as described here: https://developers.google.com/sheets/api/guides/formats
        sheet.getRange('A3:A').setHorizontalAlignment('center').insertCheckboxes();
        sheet.getRange('B3:B').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
        sheet.getRange('C3:C').setFontColor(null).setFontStyle(null).setHorizontalAlignment('left');
        sheet.getRange('D3:D').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('left');
        sheet.getRange('E3:E').setNumberFormat('yyyy-mm-dd h:mm:ss').setFontColor(null).setFontStyle(null)
            .setFontFamily('Arial')
            .setFontSize(10)
            .setHorizontalAlignment('center');
        sheet.getRange('F3:F').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
        sheet.getRange('G3:G').setNumberFormat('+0.00000000;-0.00000000;0.00000000').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('H3:H').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');

        // set COIN cols {COIN Acquired, COIN Disposed} visible numeric persicion to have 8 satoshis showing by default
        // set FIAT cols {Fiat Value Inflow, Fiat Value Outflow, Cost Basis, Gain(Loss)} type to be a Currency type
        sheet.getRange('I3:I').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('J3:J').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('K3:K').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('L3:L').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('S3:T').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('U3:U').setFontColor(null).setFontStyle(null).setHorizontalAlignment('center');

        // create filter around all transactions
        sheet.getFilter()?.remove();
        sheet.getRange(`A2:U${lastRow}`).createFilter();

        // iterate through the rows in the sheet to
        // set col {Fiat Cost} and col {Fiat Received} to be calculated based on other cells in the sheet
        const strategyCol = sheet.getRange('H:H').getValues();
        const acquiredCol = sheet.getRange('I:I').getValues();
        const disposedCol = sheet.getRange('K:K').getValues();
        setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);

        // set cols {COIN High, Low, Price} to be formatted into USD value but to 6 decimal places
        sheet.getRange('M3:O').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null)
            .setHorizontalAlignment('right')
            .setFontFamily('Calibri')
            .setFontSize(11);

        // set col styles for {Lot IDs}, {Date Acquired} and {Status}
        sheet.getRange('P3:R').setFontColor('#424250').setHorizontalAlignment('center');

        // lookup allowed categories from the "Categories sheet" to avoid hard-coding them
        const categoriesList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories')?.getRange('A2:A35').getValues();

        // Prevent the user from entering bad inputs in the first place which removes
        // the need to check data in the validate() function during a calculation
        setValidationRules(sheet, categoriesList);

        // set cols {Status, Cost Basis, Gain(Loss)} to be grayed background
        sheet.getRange('P3:T').setBackground('#EEEEEE');

        // autosize columns' widths to fit content
        sheet.autoResizeColumns(1, 21);
        SpreadsheetApp.flush();

        return sheet;
    }
    return null;
}

function setValidationRules(sheet: GoogleAppsScript.Spreadsheet.Sheet, categoriesList): void {
    // ensure we only accept valid date values
    const dateRule = SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(false)
    // .setHelpText('Must be a valid date.')
        .build();
    sheet.getRange('E3:E').setDataValidation(dateRule);

    // limit Category entries to loosely adhere to known categories
    const categoriesRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoriesList)
        .setAllowInvalid(true)
        .build();
    sheet.getRange('F3:F').setDataValidation(categoriesRule);

    // limit FMV Strategy entries to adhere to supported strategies
    const fmvStrategyRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Value Known', 'Price Known', 'Avg Daily Price Variation', 'n/a'])
        .setAllowInvalid(true)
        .build();
    sheet.getRange('H3:H').setDataValidation(fmvStrategyRule);

    // ensure we only accept positive Coin/Fiat amounts
    const notNegativeRule = SpreadsheetApp.newDataValidation()
        .requireNumberGreaterThanOrEqualTo(0)
        .setAllowInvalid(false)
    // .setHelpText('Value cannot be negative.')
        .build();
    sheet.getRange('I3:L').setDataValidation(notNegativeRule);
}
