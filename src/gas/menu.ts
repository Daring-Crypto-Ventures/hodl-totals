/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import resetTotalSheet from './totals';
import { newCoinSheet } from './new-coin';
import { newNFTSheet } from './new-nft';
import { formatSheet } from './format';
import { updateFMVFormulas } from './fmv';
import { calculateCoinGainLoss, calculateNFTGainLossStatus } from './calculate';
import { formatNFTSheet } from './format-nft';
import { sheetContainsNFTData, sheetContainsCoinData } from './sheet';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Browser */
/* global Logger */
/* global HtmlService */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_$" }] */

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
        .addSubMenu(ui.createMenu('Track new')
            .addItem('Example "pretendCOINs"', 'loadExample_')
            .addItem('Coin (FIFO method)', 'newCoinTrackedByFIFOMethod_')
            .addItem('Coin (Specific ID method)', 'newCoinTrackedBySpecIDMethod_')
            .addItem('NFTs (per Address)', 'newNFTSheet_'))
        .addSeparator()
        .addItem('-- ON THE ACTIVE SHEET --', 'dummyMenuItem_')
        .addItem('Format columns', 'formatSheet_')
        .addItem('Update formulas', 'updateFormulas_')
        .addItem('Calculate gain/loss', 'calculateGainLoss_')
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
function showSheetActionsSidebar_(): void {
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
function dummyMenuItem_(): null {
    return null;
}

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
function resetTotalSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return resetTotalSheet();
}

/**
 * A function that adds a FIFO-method coin tracking spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
function newCoinTrackedByFIFOMethod_(coinName?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newCoinSheet(coinName);
}

/**
 * A function that adds a SpecificID-method coin tracking spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
function newCoinTrackedBySpecIDMethod_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    Browser.msgBox('Specific ID Tracking Not Supported', 'This capital gains calculation method is not yet supported. Is this something you think should be a top priority for us to add? If yes, please join our Discord and indicate your interest in the #general channel.', Browser.Buttons.OK);
    return null;
}

/**
 * A function that adds a sheet to track the NFTs held in a given address
 *
 * @return the newly created sheet, for function chaining purposes.
 */
function newNFTSheet_(address?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newNFTSheet(address);
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the sheet that was formatted, for function chaining purposes.
 */
function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsNFTData(sheet)) {
        formatNFTSheet(sheet);
    } else if (sheetContainsCoinData(sheet)) {
        formatSheet(sheet);
    } else {
        Browser.msgBox('Active Sheet Does Not Support Formatting', `The active sheet "${sheet.getName()}" does not look like a tracking sheet that can have its column formatting updated using this command.  HODL Totals can only format tracking sheets originally created using HODL Totals commands.`, Browser.Buttons.OK);
    }
    return sheet;
}

/**
 * A function that updates all of the formuala cells of the active spreadsheet.
 *
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * @return the sheet that was updated, for function chaining purposes.
 */
function updateFormulas_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsCoinData(sheet)) {
        updateFMVFormulas(sheet);
    } else if (sheetContainsNFTData(sheet)) {
        Browser.msgBox('NFT Update Formulas', 'TODO', Browser.Buttons.OK);
        // updateNFTFormulas(sheet);
    } else {
        Browser.msgBox('Active Sheet Does Not Support Updating Formulas', `The active sheet "${sheet.getName()}" does not look like a tracking sheet with Formulas that can be updated using this command. HODL Totals can only only update formulas on tracking sheets originally created using HODL Totals commands.`, Browser.Buttons.OK);
    }
    return sheet;
}

/**
 * Triggers the cost basis calculation
 *
 */
function calculateGainLoss_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsCoinData(sheet)) {
        calculateCoinGainLoss(sheet);
    } else if (sheetContainsNFTData(sheet)) {
        calculateNFTGainLossStatus(sheet);
    } else {
        Browser.msgBox('Active Sheet Does Not Support Gain/Loss Calculation', `The active sheet "${sheet.getName()}" does not look like a tracking sheet that supports Gain/Loss Calculation. HODL Totals can only only calculate gains or losses on tracking sheets originally created using HODL Totals commands.`, Browser.Buttons.OK);
    }
    return sheet;
}
