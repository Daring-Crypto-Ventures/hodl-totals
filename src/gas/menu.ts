/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import resetTotalSheet from './totals';
import newCategorySheet from './categories';
import showNewCoinPrompt from './new-coin';
import { formatSheet } from './format';
import calculateFIFO from '../calc-fifo';
import getOrderList from '../orders';
import validate from '../validate';
import getLastRowWithDataPresent from '../last-row';
import { CompleteDataRow, CompleteDataRowAsStrings, LooselyTypedDataValidationRow } from '../types';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Logger */
/* global Utilities */
/* global Browser */
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

    menu.addItem('Reset totals sheet', 'resetTotalSheet_')
        .addSeparator()
        .addItem('Track new coin...', 'newCoinSheet_')
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

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function resetTotalSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return resetTotalSheet();
}

/**
 * A function that adds columns and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCoinSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // ask user what the name of the new currency will be
    const newCoinName = showNewCoinPrompt();

    // indicates that the user canceled, so abort without making a new sheet
    if (newCoinName === null) return null;

    // if no Categories sheet previously exists, create one
    if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null) {
        newCategorySheet();
    }
    const newCoinSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newCoinName);
    resetTotalSheet();
    SpreadsheetApp.setActiveSheet(newCoinSheet);

    return formatSheet_();
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return formatSheet();
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
