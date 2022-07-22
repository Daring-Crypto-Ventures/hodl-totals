/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import newCategorySheet from './categories';
import { version } from '../version';
import { setFMVformulasOnSheet } from './fmv';
import calculateFIFO from '../calc-fifo';
import getOrderList from '../orders';
import validate from '../validate';
import getLastRowWithDataPresent from '../last-row';
import { CompleteDataRow, CompleteDataRowAsStrings, LooselyTypedDataValidationRow } from '../types';

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
    const validationErrMsg = validate(sheet.getRange('E:L').getValues() as LooselyTypedDataValidationRow[]);

    if (validationErrMsg === '') {
        const data = sheet.getRange('A:U').getValues() as CompleteDataRow[];
        const formulaData = sheet.getRange('A:U').getFormulas() as CompleteDataRowAsStrings[];
        const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);

        // clear previously calculated values
        Logger.log('Clearing previously calculated values and notes.');
        sheet.getRange('P3:T').setValue('');
        sheet.getRange('K3:K').setNote('');

        const lots = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('I:J').getValues() as [number, number][]);
        Logger.log(`Detected ${lots.length} purchases of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('K:L').getValues() as [number, number][]);
        Logger.log(`Detected ${sales.length} sales of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);

        const annotations = calculateFIFO(coinName, data, formulaData, lots, sales);

        for (let i = 2; i < data.length; i++) {
            // scan just the inflow & outflow data of the row we're about to write
            // avoid writing zeroes to previously empty cells (but write zeros to the Calculated columns)
            // avoid overwriting any formulas used to calculate the values
            for (let j = 0; j < 21; j++) {
                if ((j < 15) && (Number(data[i][j]) === 0)) {
                    data[i][j] = '';
                }
                if (formulaData[i][j] !== '') {
                    data[i][j] = formulaData[i][j];
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
        const now = Utilities.formatDate(new Date(), 'CST', 'yyyy-mm-dd HH:mm');
        sheet.getRange('S1').setValue(`${now}`);
        sheet.getRange('T1').setValue('Succeeded');
        Logger.log(`Last calculation succeeded ${now}`);
    } else {
        // notify the user of the data validation error
        const msgPrefix = validationErrMsg.substr(0, validationErrMsg.indexOf(':'));
        const msg = Utilities.formatString(validationErrMsg);
        Browser.msgBox(msgPrefix, msg, Browser.Buttons.OK);

        // record the failure in the sheet as well
        const now = Utilities.formatDate(new Date(), 'CST', 'yyyy-mm-dd HH:mm');
        sheet.getRange('S1').setValue(`${now}`);
        sheet.getRange('T1').setValue('Failed');
        Logger.log(`Data validation failed ${now}`);
    }
}
