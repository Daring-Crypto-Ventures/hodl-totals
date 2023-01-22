/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import resetTotalSheet from './totals';
import { newCoinSheet } from './new-coin';
import { newNFTSheet } from './new-nft';
import { formatSheet } from './format';
import { updateFMVFormulas } from './fmv';
import { calculateCoinGainLoss } from './calculate';
import { formatNFTSheet } from './format-nft';
import { sheetContainsNFTData, sheetContainsCoinData } from './sheet';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Browser */
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
        .addItem('Track NFTs...', 'newNFTSheet_')
        .addSeparator()
        .addItem('-- FOR THIS SHEET --', 'dummyMenuItem_')
        .addItem('Format sheet', 'formatSheet_')
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
 * A function that adds a coin tracking spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCoinSheet_(coinName?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newCoinSheet(coinName);
}

/**
 * A function that adds a sheet to track the NFTs held in a given address
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newNFTSheet_(address?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newNFTSheet(address);
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the sheet that was formatted, for function chaining purposes.
 */
export function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsNFTData(sheet)) {
        formatNFTSheet(sheet);
    } else {
        formatSheet(sheet);
    }
    return sheet;
}

/**
 * A function that formats the FMV Value Rows of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the sheet that was updated, for function chaining purposes.
 */
export function updateFMVFormulas_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsCoinData(sheet)) {
        updateFMVFormulas(SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
    } else {
        Browser.msgBox('FMV Formulas Not Supported', 'The active sheet does not have any Fair Market Value Formulas to update', Browser.Buttons.OK);
    }
    return sheet;
}

/**
 * Triggers the cost basis calculation
 *
 */
export function calculateCoinGainLoss_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return calculateCoinGainLoss(SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
}
