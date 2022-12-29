/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import resetTotalSheet from './totals';
import { newCoinSheet } from './new-coin';
import { formatSheet } from './format';
import { updateFMVFormulas } from './fmv';
import { calculateCoinGainLoss } from './calculate';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Logger */
/* global HtmlService */
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

    // TODO 0 on first launch only have one command
    // menu.addItem('Setup HODL Totals', 'loadExample_')

    menu.addItem('Reset totals sheet', 'resetTotalSheet_')
        .addItem('Track new coin...', 'newCoinSheet_')
        .addItem('Insert example "pretendCOINs"', 'loadExample_')
        .addSeparator()
        .addItem('-- FOR THIS SHEET --', 'dummyMenuItem_')
        .addItem('Format as a coin sheet', 'formatSheet_')
        .addItem('Update FMV formulas', 'updateFMVFormulas_')
        .addItem('Calculate gain/loss (FIFO method)', 'calculateCoinGainLoss_')
        .addSeparator()
        .addItem('About HODL Totals', 'showAboutDialog_')
        .addItem('Join our Discord server', 'openDiscordLink_')
        .addItem('Show debug sidebar', 'showSheetActionsSidebar_');
    menu.addToUi();
}

/**
 * A function that does TODO
 *
 */
export function showSheetActionsSidebar_(): void {
    const sidebarUi = HtmlService.createHtmlOutputFromFile('assets/CoinSidebar')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle('HODL Totals Debugging Tools');
    SpreadsheetApp.getUi().showSidebar(sidebarUi);
}

/**
 * Returns the active row.
 *
 * @return {Object[]} The headers & values of all cells in row.
 */
export function pullDataFromActiveSheet(): unknown[] {
    // Retrieve and return the information requested by the sidebar.
    const sheet = SpreadsheetApp.getActiveSheet();
    // const coinName = sheet.getName().replace(/ *\([^)]*\) */g, '');
    const record = new Array(0);
    const sheetMetadata = sheet.getDeveloperMetadata();
    const metadata = sheet.getRange('1:1').getDeveloperMetadata();

    // record.push({ heading: 'coin', cellval: coinName });
    sheetMetadata.forEach(md => {
        record.push({ heading: md.getKey(), cellval: md.getValue() });
    });
    metadata.forEach(md => {
        record.push({ heading: `Row 1:${md.getKey()}`, cellval: md.getValue() });
    });

    return record;
}

/**
 * A no-op function that is required to show a dummy Menu Item
 * best I can do since Google Apps Script Menus don't support header text
 *
 */
export function dummyMenuItem_(): null {
    return null;
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
export function newCoinSheet_(coinName?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newCoinSheet(coinName);
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return formatSheet(SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
}

/**
 * A function that formats the FMV Value Rows of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function updateFMVFormulas_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return updateFMVFormulas(SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
}

/**
 * Triggers the cost basis calculation
 *
 */
export function calculateCoinGainLoss_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return calculateCoinGainLoss(SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
}
