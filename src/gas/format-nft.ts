/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { resetVersionMetadata, sheetContainsNFTData } from './sheet';
import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Browser */

/**
 * A function that formats the columns and headers of the active spreadsheet as an NFT tracking sheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatNFTSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        // simple check to verify that NFT formatting actions only happen on NFT tracking sheets
        if (!sheetContainsNFTData(sheet)) {
            Browser.msgBox('Formatting Error', 'The active sheet does not look like an NFT tracking sheet, only format existing NFT tracking sheets originally created using HODL Totals commands', Browser.Buttons.OK);
            return null;
        }

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
        const coinTotalFormula = '=CONCATENATE(COUNTA($C$3:C)-COUNTA($U$3:U)," NFT(s)")';
        // const headerRow1p2 = `${desiredCurrency} balance on `;
        // const onDateFormula = '=INDIRECT("\'HODL Totals\'!$"&IF(ISNA(MATCH($B$1,\'HODL Totals\'!$B$2:B, 0)),"E$"&IFNA(MATCH(LEFT(TRIM($I$2),FIND(" ",TRIM($I$2))-1),\'HODL Totals\'!$D$2:$D,0),0)+1,"E$"&MATCH($B$1,\'HODL Totals\'!$B$2:B, 0)+1))';
        // const headerRow1p3 = 'was off by';
        // const headerRow1p4 = [`${desiredCurrency}`, 'Inflow', '', 'Outflow', '', 'Fair Mkt Value', '', '', 'Last Gain/Loss Calculation (FIFO Method)', '', ''];
        // const headerRow1p5 = '';
        // NOTE: spaces are hard coded around header text that help autosizecolumns behave correctly
        const headerRow2 = ['   In Tx ✔   ', '    Collection    ', '    NFT ID    ', '    NFT In Tx(s)    ', '   NFT In Description   ', '    Date & Time    ', '       Inflow Category       ',
            '    Acq Price    ', '    Acq Price (USD)    ', '    Tx Fees    ', '    Tx Fees (USD)    ', '    Cost Basis Adj   ', '    Cost Basis Adj (USD)    ',
            '    Cost Basis    ', '    Cost Basis (USD)    ', '    NFT In Notes    ', ' ',
            '   Out Tx ✔   ', '    NFT Out Tx(s)    ', '   NFT Out Description   ', '       Outflow Category       ', '    Date & Time    ',
            '    Sale Price    ', '    Sale Price (USD)    ', '    Tx Fees    ', '    Tx Fees (USD)    ', '    Selling Fees   ', '    Selling Fees (USD)    ',
            '    Proceeds    ', '    Proceeds (USD)    ', '    Gain (Loss)    ', '    Status    ', '    NFT Out Notes    '];

        sheet.getRange('A1').setValue(headerRow1p1);
        sheet.getRange('C1').setValue(coinTotalFormula);
        // sheet.getRange('D1').setValue(headerRow1p2);
        // sheet.getRange('E1').setValue(onDateFormula);
        // sheet.getRange('F1').setValue(headerRow1p3);
        // sheet.getRange('H1:R1').setValues([headerRow1p4]);
        // sheet.getRange('U1').setValue(headerRow1p5);
        sheet.getRange('A2:AG2').setValues([headerRow2]);
        sheet.getRange('A1:AG2').setFontWeight('bold').setHorizontalAlignment('center');

        // see if any row data exists beyond the header we just added
        const lastRow = getLastRowWithDataPresent(sheet.getRange('F:F').getValues() as string[][]);

        // add borders to demarcate the row 1 headers into logical groups
        // sheet.getRange('M1:O1').setBorder(false, true, false, true, false, false);
        // sheet.getRange('T1').setFontWeight('normal').setBorder(false, false, false, true, false, false);

        // set conditional formatting rules on row 1 cells
        // setFormatSheetCFRules(sheet);

        // merge 1st row cell headers
        // sheet.getRange('I1:J1').merge();
        // sheet.getRange('K1:L1').merge();
        // sheet.getRange('M1:O1').merge();
        // sheet.getRange('P1:R1').merge();

        // color background and freeze the header rows
        sheet.getRange('A1:AG1').setBackground('#DDDDEE');
        sheet.getRange('A2:AG2').setBackground('#EEEEEE');
        sheet.setFrozenRows(2);
        sheet.setFrozenColumns(3);

        // create filter around all transactions
        sheet.getFilter()?.remove();
        sheet.getRange(`A2:AG${lastRow}`).createFilter();

        // set cols {COIN High, Low, Price} to be formatted into USD value but to 6 decimal places
        // sheet.getRange('M3:O').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null)
        //    .setHorizontalAlignment('right')
        //    .setFontFamily('Calibri')
        //    .setFontSize(11);

        // set col styles for calculated columns {Cost Basis}, {Proceeds}, {Gain (Loss)} and {Status}
        sheet.getRange('N3:O').setFontColor('#424250').setBackground('#EEEEEE');
        sheet.getRange('AC3:AF').setFontColor('#424250').setBackground('#EEEEEE');
        sheet.getRange('AF3:AF').setHorizontalAlignment('center');

        // Prevent the user from entering bad inputs in the first place which removes
        // the need to check data in the validate() function during a calculation
        // setValidationRules(sheet);

        // lookup allowed categories from the "Categories sheet" to avoid hard-coding them
        const categoriesList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories')?.getRange('A2:A35').getValues() as unknown as string[];

        setNFTDropdownOptions(sheet, categoriesList);

        // autosize columns' widths to fit content
        sheet.autoResizeColumns(1, 32);
        SpreadsheetApp.flush();

        return sheet;
    }
    return null;
}

function setNFTDropdownOptions(sheet: GoogleAppsScript.Spreadsheet.Sheet, categoriesList: string[]): void {
    // limit Category entries to loosely adhere to known categories
    const categoriesRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoriesList)
        .setAllowInvalid(true)
        .build();
    sheet.getRange('G3:G').setDataValidation(categoriesRule);
    sheet.getRange('U3:U').setDataValidation(categoriesRule);
}
