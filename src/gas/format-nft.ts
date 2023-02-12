/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { resetVersionMetadata } from './sheet';
import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */
/* global SpreadsheetApp */

/**
 * A function that formats the columns and headers of the active spreadsheet as an NFT tracking sheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatNFTSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        // Code to check the previously saved sheet version to see if mutation is required
        // should pop a yes/no confirmation dialog in this event as formatting could be destructive
        // const sheet = SpreadsheetApp.getActiveSheet();
        // const mdFinder = sheet.getRange('1:1').createDeveloperMetadataFinder();
        // const version = mdFinder.withKey('version').find()[0].getValue();
        resetVersionMetadata(sheet);

        // calculate URL to nav user back to the Totals sheet
        const totalsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HODL Totals');
        let totalsSheetUrl = '';
        if (totalsSheet != null) {
            const ssUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
            totalsSheetUrl = `${ssUrl}#gid=${totalsSheet.getSheetId()}`;
        }

        // populate the sheet header
        const headerRow1p1 = `=HYPERLINK("${totalsSheetUrl}"," ↩ Totals ")`;
        const coinTotalFormula = '=CONCATENATE(COUNTA($F$3:F)-COUNTA($V$3:V)," NFT(s)")';
        const headerRow1p2 = ['Acquisition Information', '', '', '', '', '', '', '', '', '', 'Cost Basis', '', '', 'Documentation',
            'Disposal Information', '', '', '', '', '', '', '', '', '', '', '    Last Calculation    ', '', '', '', 'Documentation'];
        // NOTE: spaces are hard coded around header text that help autosizecolumns behave correctly
        const headerRow2 = ['      In Tx ✔      ', '    Collection    ', '     NFT ID     ', '    NFT In Tx(s)    ', '   NFT In Description   ', '    Date & Time    ',
            '       Inflow Category       ', '    Acq Price    ', '    Acq Price (USD)    ', '    Tx Fees    ', '    Tx Fees (USD)    ', '    Cost Basis Adj   ',
            '    Cost Basis Adj (USD)    ', '    Cost Basis    ', '    Cost Basis (USD)    ', '    Inflow Status    ', '      Inflow Tax Doc Link      ',
            '  Out Tx ✔  ', '    NFT Out Tx(s)    ', '   NFT Out Description   ', '       Outflow Category       ', '    Date & Time    ',
            '    Sale Price    ', '    Sale Price (USD)    ', '    Tx Fees    ', '    Tx Fees (USD)    ', '    Selling Fees   ', '    Selling Fees (USD)    ',
            '    Proceeds    ', '    Proceeds (USD)    ', '     Gain (Loss)     ', '       Outflow Status       ', '      Outflow Tax Doc Link      '];

        sheet.getRange('A1').setValue(headerRow1p1);
        sheet.getRange('C1').setValue(coinTotalFormula);
        sheet.getRange('D1:AG1').setValues([headerRow1p2]);
        sheet.getRange('A2:AG2').setValues([headerRow2]);
        sheet.getRange('A1:AG2').setFontWeight('bold').setHorizontalAlignment('center');

        // see if any row data exists beyond the header we just added
        const lastTxInRow = getLastRowWithDataPresent(sheet.getRange('F:F').getValues() as string[][]);
        const lastTxOutRow = getLastRowWithDataPresent(sheet.getRange('V:V').getValues() as string[][]);
        const lastRow = lastTxInRow > lastTxOutRow ? lastTxInRow : lastTxOutRow;

        // add borders to demarcate the row 1 headers into logical groups
        sheet.getRange('N1:P1').setBorder(false, true, false, true, false, false);
        sheet.getRange('AC1:AF1').setBorder(false, true, false, true, false, false);

        // set conditional formatting rules on row 1 cells
        setNFTSheetCFRules(sheet);

        // merge 1st row cell headers
        sheet.getRange('A1:AG1').breakApart();
        sheet.getRange('D1:M1').merge();
        sheet.getRange('N1:P1').merge();
        sheet.getRange('R1:AB1').merge();
        sheet.getRange('AC1:AD1').merge();

        // color background and freeze the header rows
        sheet.getRange('A1:AG1').setBackground('#DDDDEE');
        sheet.getRange('A2:AG2').setBackground('#EEEEEE');
        sheet.setFrozenRows(2);
        sheet.setFrozenColumns(3);

        // set Frozen Left + Tx In Col formats as described here: https://developers.google.com/sheets/api/guides/formats
        sheet.getRange('A3:A').setHorizontalAlignment('center').insertCheckboxes();
        sheet.getRange('B3:D').setFontColor(null).setFontStyle(null);
        sheet.getRange('B3:B').setHorizontalAlignment('right');
        sheet.getRange('C3:C').setHorizontalAlignment('center');
        sheet.getRange('D3:D').setHorizontalAlignment('left');
        sheet.getRange('E3:E').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('left');
        sheet.getRange('F3:F').setNumberFormat('yyyy-mm-dd h:mm:ss').setFontColor(null).setFontStyle(null)
            .setFontFamily('Arial')
            .setFontSize(10)
            .setHorizontalAlignment('center');
        sheet.getRange('G3:G').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');

        // set common properties across ranges of numeric columns
        sheet.getRange('H3:O').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);
        sheet.getRange('W3:AE').setFontColor(null).setFontStyle(null)
            .setFontFamily('Calibri')
            .setFontSize(11);

        // set COIN cols visible numeric persicion to have 8 satoshis showing by default
        sheet.getRange('H3:H').setNumberFormat('0.00000000');
        sheet.getRange('J3:J').setNumberFormat('0.00000000');
        sheet.getRange('L3:L').setNumberFormat('0.00000000');
        sheet.getRange('N3:N').setNumberFormat('0.00000000');
        sheet.getRange('W3:W').setNumberFormat('0.00000000');
        sheet.getRange('Y3:Y').setNumberFormat('0.00000000');
        sheet.getRange('AA3:AA').setNumberFormat('0.00000000');
        sheet.getRange('AC3:AC').setNumberFormat('0.00000000');

        // set USD cols to be formatted into USD value to 2 decimal places
        sheet.getRange('I3:I').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('K3:K').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('M3:M').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('O3:O').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('X3:X').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('Z3:Z').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('AB3:AB').setNumberFormat('$#,##0.00;$(#,##0.00)');
        sheet.getRange('AD3:AE').setNumberFormat('$#,##0.00;$(#,##0.00)');

        // set Tx Out Col formats as described here: https://developers.google.com/sheets/api/guides/formats
        sheet.getRange('R3:R').setHorizontalAlignment('center').insertCheckboxes();
        sheet.getRange('S3:S').setFontColor(null).setFontStyle(null).setHorizontalAlignment('left');
        sheet.getRange('T3:U').setFontColor('#424250').setFontStyle('italic');
        sheet.getRange('T3:T').setHorizontalAlignment('left');
        sheet.getRange('U3:U').setHorizontalAlignment('center');
        sheet.getRange('V3:V').setNumberFormat('yyyy-mm-dd h:mm:ss').setFontColor(null).setFontStyle(null)
            .setFontFamily('Arial')
            .setFontSize(10)
            .setHorizontalAlignment('center');

        // set col styles for calculated columns and separator columns
        sheet.getRange('N3:P').setBackground('#EEEEEE');
        sheet.getRange('P3:P').setHorizontalAlignment('center');
        sheet.getRange('Q1:Q').setBorder(false, false, false, true, false, false, 'dark gray 3', SpreadsheetApp.BorderStyle.SOLID_THICK);
        sheet.getRange('AC3:AF').setBackground('#EEEEEE');
        sheet.getRange('AF3:AF').setHorizontalAlignment('center');
        sheet.getRange('AF1').setFontWeight('normal');

        // create filter around all transactions
        sheet.getFilter()?.remove();
        sheet.getRange(`A2:AG${lastRow}`).createFilter();

        // lookup allowed categories from the "Categories sheet" to avoid hard-coding them
        const categoriesInList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories')?.getRange('A2:A20').getValues() as unknown as string[];
        const categoriesOutList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories')?.getRange('A21:A35').getValues() as unknown as string[];
        setNFTDropdownOptions(sheet, categoriesInList, categoriesOutList);

        // autosize columns' widths to fit content, but ignore tx ID & descrip columns
        sheet.autoResizeColumns(1, 3);
        sheet.autoResizeColumns(5, 13);
        sheet.autoResizeColumns(20, 14);
        SpreadsheetApp.flush();

        return sheet;
    }
    return null;
}

function setNFTDropdownOptions(sheet: GoogleAppsScript.Spreadsheet.Sheet, categoriesInList: string[], categoriesOutList: string[]): void {
    // limit Category entries to loosely adhere to known categories
    const categoriesInRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoriesInList)
        .setAllowInvalid(true)
        .build();
    const categoriesOutRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoriesOutList)
        .setAllowInvalid(true)
        .build();
    sheet.getRange('G3:G').setDataValidation(categoriesInRule);
    sheet.getRange('U3:U').setDataValidation(categoriesOutRule);
}

function setNFTSheetCFRules(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // Color the success/failure cell to indicate health of the last calculation
    const calcStatusRange = sheet.getRange('AF1');

    // extract the conditional rules set on all other cells on this sheet
    const rules = SpreadsheetApp.getActiveSheet().getConditionalFormatRules();
    const newRules = [] as GoogleAppsScript.Spreadsheet.ConditionalFormatRule [];
    for (const rule of rules) {
        const ruleRange = rule.getRanges()?.[0].getA1Notation();
        if (ruleRange !== calcStatusRange.getA1Notation()) {
            newRules.push(rule);
        }
    }
    // add back the rules for the cells we are formatting
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextStartsWith('Succeeded')
        .setBackground('#B7E1CD') // green success
        .setRanges([calcStatusRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextStartsWith('Failed')
        .setBackground('#F4C7C3') // red failure
        .setRanges([calcStatusRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=1')
        .setBackground('#F4C7C3') // red failure
        .setRanges([calcStatusRange])
        .build());
    sheet.setConditionalFormatRules(newRules);
}
