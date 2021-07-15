/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import newCategorySheet from './categories';
import { setFMVformulasOnSheet } from './fmv';
import calculateFIFO from '../calc-fifo';
import getOrderList from '../orders';
import validate from '../validate';
import getLastRowWithDataPresent from '../last-row';
import { completeDataRow, sevenPackLooselyTypedDataRow } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * A special function that runs when the this is installed as an addon
 */
export function onInstall(e: GoogleAppsScript.Events.AddonOnInstall): void {
    onOpen(e as GoogleAppsScript.Events.AppsScriptEvent);
}

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
export function onOpen(e: GoogleAppsScript.Events.AppsScriptEvent): void {
    // https://developers.google.com/apps-script/reference/script/auth-mode
    // typically should see AuthMode.LIMITED, implying the add-on is executing
    // when bound to a document and launched from a simple Trigger
    Logger.log(`onOpen called with AuthMode: ${e?.authMode}`);

    const ui = SpreadsheetApp.getUi();
    const menu = ui.createAddonMenu(); // createsMenu('HODL Totals')

    menu.addItem('Track new coin...', 'newCurrencySheet_')
        .addSeparator()
        .addItem('Apply formatting', 'formatSheet_')
        .addItem('Calculate (FIFO method)', 'calculateFIFO_')
        .addSeparator()
        .addSubMenu(ui.createMenu('Examples')
            .addItem('Cost basis', 'loadCostBasisExample_')
            .addItem('Fair market value', 'loadFMVExample_'))
        .addSeparator()
        .addItem('Join our Discord Server', 'openDiscordLink_')
        .addItem('About HODL Totals', 'showAboutDialog_');

    menu.addToUi();
}

export function showNewCurrencyPrompt(): string | null {
    if (typeof ScriptApp !== 'undefined') {
        const ui = SpreadsheetApp.getUi();

        const result = ui.prompt(
            'New Currency',
            'Please enter the coin\'s trading symbol ("BTC", "ETH", "XRP"):',
            ui.ButtonSet.OK_CANCEL
        );

        // Process the user's response.
        const button = result.getSelectedButton();
        const text = result.getResponseText();
        if (button === ui.Button.OK) {
            return text;
        }
        // if ((button === ui.Button.CANCEL) || (button === ui.Button.CLOSE))
    }
    return null;
}

/**
 * A function that adds columns and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCurrencySheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // ask user what the name of the new currency will be
    const desiredCurrency = showNewCurrencyPrompt();

    // indicates that the user canceled, so abort without making a new sheet
    if (desiredCurrency === null) return null;

    // if no Categories sheet previously exists, create one
    if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null) {
        newCategorySheet();
    }
    SpreadsheetApp.getActiveSpreadsheet().insertSheet(desiredCurrency);

    return formatSheet_();
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const desiredCurrency = sheet.getName().replace(/ *\([^)]*\) */g, '');

    // populate the two-row-tall header cells
    const header1part1 = ['', '', 'Fair Mkt Value', 'Inflow', '', 'Outflow', '', 'Calculated', '', ''];
    const header1part2 = ['Fair Mkt Value', '', '', 'Transaction Details', '', ''];

    // NOTE: spaces are hard coded around header text that help autosizecolumns behave correctly
    const header2 = ['       Date       ', '       Category       ', '              Strategy             ', `   ${desiredCurrency} Acquired   `, '   Fiat Value   ', `   ${desiredCurrency} Disposed   `, '   Fiat Value   ', '   Status   ', '   Cost Basis   ', '   Gain (Loss)   ', '   Notes   ',
        `   ${desiredCurrency} High   `, `   ${desiredCurrency} Low   `, `   ${desiredCurrency} Price   `, '   Transaction ID   ', '   Wallet/Account   ', '   Address   '];
    sheet.getRange('A1:J1').setValues([header1part1]).setFontWeight('bold').setHorizontalAlignment('center');
    if (!(sheet.getRange('K1').getValue().startsWith('Last calculation succeeded'))) {
        sheet.getRange('K1').setValue('"Add-ons > HODL Totals > Calculate" to update calculated cells.');
    }
    sheet.getRange('L1:Q1').setValues([header1part2]).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.getRange('A2:Q2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');

    // see if any row data exists beyond the header we just added
    const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());

    // At-a-glance total added to upper left corner
    sheet.getRange('A1').setValue('=SUM(D:D)-SUM(F:F)');
    sheet.getRange('B1').setValue(desiredCurrency).setHorizontalAlignment('left');
    sheet.getRange('A1:B1').setBorder(false, false, true, true, false, false);
    sheet.getRange('K1').setFontWeight('normal');

    // merge 1st row cell headers
    sheet.getRange('D1:E1').merge();
    sheet.getRange('F1:G1').merge();
    sheet.getRange('H1:J1').merge();
    sheet.getRange('L1:N1').merge();
    sheet.getRange('O1:Q1').merge();

    // color background and freeze the header rows
    sheet.getRange('A1:Q1').setBackground('#DDDDEE');
    sheet.getRange('A2:Q2').setBackground('#EEEEEE');
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(1);

    // set numeric formats as described here: https://developers.google.com/sheets/api/guides/formats
    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11)
        .setHorizontalAlignment('center');
    sheet.getRange('B3:C').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');

    // set COIN cols {COIN Acquired, COIN Disposed} visible numeric persicion to have 8 satoshis showing by default
    sheet.getRange('D3:D').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('F3:F').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);

    // set FIAT cols {Fiat Value Inflow, Fiat Value Outflow, Cost Basis, Gain(Loss)} type to be a Currency type
    sheet.getRange('E3:E').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('G3:G').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('I3:I').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('J3:J').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null)
        .setFontFamily('Calibri')
        .setFontSize(11);

    // create filter around all transactions, only if no filter previously exists
    if (sheet.getFilter() === null) {
        sheet.getRange(`A2:Q${lastRow}`).createFilter();
    }

    // iterate through the rows in the sheet to
    // set col {Fiat Cost} and col {Fiat Received} to be calculated based on other cells in the sheet
    const acquiredCol = sheet.getRange('D:D').getValues();
    const disposedCol = sheet.getRange('F:F').getValues();
    const firstFMVcol = sheet.getRange('L:L').getValues();
    setFMVformulasOnSheet(sheet, null, acquiredCol, disposedCol, firstFMVcol, lastRow);

    // set col styles for {Status}, {Notes} and {transaction ID}
    sheet.getRange('H3:H').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
    sheet.getRange('K3:K').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('left');
    sheet.getRange('O3:O').setFontColor(null).setFontStyle(null).setHorizontalAlignment('left');

    // set cols {COIN High, Low, Price} to be formatted into USD value but to 6 decimal places
    sheet.getRange('L3:L').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null)
        .setHorizontalAlignment('right')
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('M3:M').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null)
        .setHorizontalAlignment('right')
        .setFontFamily('Calibri')
        .setFontSize(11);
    sheet.getRange('N3:N').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null)
        .setHorizontalAlignment('right')
        .setFontFamily('Calibri')
        .setFontSize(11);

    // lookup allowed categories from the "Categories sheet" to avoid hard-coding them
    const categoriesList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories')?.getRange('A2:A35').getValues();

    // Prevent the user from entering bad inputs in the first place which removes
    // the need to check data in the validate() function during a calculation
    setValidationRules(sheet, categoriesList);

    // set cols {Status, Cost Basis, Gain(Loss)} to be grayed background
    sheet.getRange('H3:J').setBackground('#EEEEEE');

    // autosize columns' widths to fit content
    sheet.autoResizeColumns(1, 17);
    SpreadsheetApp.flush();

    return sheet;
}

function setValidationRules(sheet: GoogleAppsScript.Spreadsheet.Sheet, categoriesList): void {
    // ensure we only accept valid date values
    const dateRule = SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(false)
    // .setHelpText('Must be a valid date.')
        .build();
    sheet.getRange('A3:A').setDataValidation(dateRule);

    // limit Category entries to loosely adhere to known categories
    const categoriesRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoriesList)
        .setAllowInvalid(true)
        .build();
    sheet.getRange('B3:B').setDataValidation(categoriesRule);

    // limit FMV Strategy entries to adhere to supported strategies
    const fmvStrategyRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Value Known', 'Price Known', 'Avg Daily Price Variation'])
        .setAllowInvalid(true)
        .build();
    sheet.getRange('C3:C').setDataValidation(fmvStrategyRule);

    // ensure we only accept positive Coin/Fiat amounts
    const notNegativeRule = SpreadsheetApp.newDataValidation()
        .requireNumberGreaterThanOrEqualTo(0)
        .setAllowInvalid(false)
    // .setHelpText('Value cannot be negative.')
        .build();
    sheet.getRange('D3:G').setDataValidation(notNegativeRule);
}

/**
 * Creates a new sheet containing step-by-step directions between the two
 * addresses on the "Settings" sheet that the user selected.
 *
 */
export function calculateFIFO_(): void {
    const sheet = SpreadsheetApp.getActive().getActiveSheet();
    const coinName = sheet.getName().replace(/ *\([^)]*\) */g, '');

    // sanity check the data in the sheet. only proceed if data is good
    Logger.log('Validating the data before starting calculations.');
    const validationErrMsg = validate(sheet.getRange('A:G').getValues() as sevenPackLooselyTypedDataRow[]);

    if (validationErrMsg === '') {
        const data = sheet.getRange('A:Q').getValues() as completeDataRow[];
        const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);

        // clear previously calculated values
        Logger.log('Clearing previously calculated values and notes.');
        sheet.getRange('H3:J').setValue('');
        sheet.getRange('F3:F').setNote('');

        const lots = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('D:E').getValues() as [number, number][]);
        Logger.log(`Detected ${lots.length} purchases of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('F:G').getValues() as [number, number][]);
        Logger.log(`Detected ${sales.length} sales of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);

        const annotations = calculateFIFO(coinName, data, lots, sales);

        for (let i = 2; i < data.length; i++) {
            // scan just the inflow & outlfow data of the row we're about to write, to avoid writing zeroes to previously empty cells
            for (let j = 0; j < 6; j++) {
                if (Number(data[i][j]) === 0) {
                    data[i][j] = '';
                }
            }
            sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
        }
        SpreadsheetApp.flush();

        // iterate through annotations and add to the Sheet
        for (const annotation of annotations) {
            sheet.getRange(`${annotation[0]}`).setNote(annotation[1]);
        }

        // output the current date and time as the time last completed
        const now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
        sheet.getRange('K1').setValue(`Last calculation succeeded ${now}`);
        Logger.log(`Last calculation succeeded ${now}`);
    } else {
        // notify the user of the data validation error
        const msgPrefix = validationErrMsg.substr(0, validationErrMsg.indexOf(':'));
        const msg = Utilities.formatString(validationErrMsg);
        Browser.msgBox(msgPrefix, msg, Browser.Buttons.OK);

        // record the failure in the sheet as well
        const now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
        sheet.getRange('K1').setValue(`Data validation failed ${now}`);
        Logger.log(`Data validation failed ${now}`);
    }
}
