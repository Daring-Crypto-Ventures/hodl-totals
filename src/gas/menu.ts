import resetTotalSheet from './totals';
import { newCoinSheet } from './new-coin';
import { newNFTSheet } from './new-nft';
import { formatSheet } from './format';
import { updateFMVFormulas } from './formulas-coin';
import { updateNFTFormulas } from './formulas-nft';
import { calculateCoinGainLoss } from './calculate';
import { calculateNFTGainLossStatus } from './calculate-nft';
import { formatNFTSheet } from './format-nft';
import { sheetContainsNFTData, sheetContainsCoinData } from './sheet';
import { showInstructionsDialog, showAboutDialog } from './dialogs';
import { loadExample } from './examples';
import openDiscordLink from './discord';

// NOTE: should not include QUnit tests in the build for production builds
import { doGet } from '../../e2e/qunit-test-runner';

/* global GoogleAppsScript */
/* global ScriptApp */
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

    //  on first launch only have one command (works with all authorization modes)
    if ((e && e.authMode === ScriptApp.AuthMode.NONE) || (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HODL Totals') === null)) {
        menu.addItem('Get started with HODL Totals', 'freshLaunch_');
        menu.addToUi();
    } else {
        setupFullMenu(ui, menu);
    }
}

/**
 * Install the full set of menu commands
 *
 * @param menu
 */
function setupFullMenu(ui: GoogleAppsScript.Base.Ui, menu: GoogleAppsScript.Base.Menu): void {
    menu.addItem('Reset totals sheet', 'resetTotalSheet_')
        .addSubMenu(ui.createMenu('Track new')
            .addItem('Coin (FIFO method)', 'newCoinTrackedByFIFOMethod_')
            .addItem('Coin (Specific ID method)', 'newCoinTrackedBySpecIDMethod_')
            .addItem('NFTs (per Address)', 'newNFTSheet_'))
        .addSeparator()
        .addItem('-- ON THE ACTIVE SHEET --', 'dummyMenuItem_')
        .addItem('Format columns', 'formatSheet_')
        .addItem('Update formulas', 'updateFormulas_')
        .addItem('Calculate gain/loss', 'calculateGainLoss_')
        .addSeparator()
        .addItem('View getting started guide', 'showInstructionsDialog_')
        .addItem('Join our Discord server', 'openDiscordLink_')
        .addItem('About HODL Totals', 'showAboutDialog_');
    // .addItem('Show debug sidebar', 'showSheetActionsSidebar_');
    menu.addToUi();
}

/**
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @param e
 */
export function freshLaunch_(): void {
    const ui = SpreadsheetApp.getUi();

    // Show some getting started guidance if detected a fresh workbook
    showInstructionsDialog();

    // after dismissing that, go ahead and expose all HODL Totals commands
    const menu = ui.createAddonMenu();
    setupFullMenu(ui, menu);
}

/**
 * A function that does TODO
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export function showSheetActionsSidebar_(): void {
    const sidebarUi = HtmlService.createHtmlOutputFromFile('CoinSidebar')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle('HODL Totals Debugging Tools');
    SpreadsheetApp.getUi().showSidebar(sidebarUi);
}

/**
 * A no-op function that is required to show a dummy Menu Item
 * best I can do since the menu API doesn't support header text
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export function dummyMenuItem_(): null {
    return null;
}

export function showInstructionsDialog_(): void {
    if (typeof loadExample !== 'undefined') {
        showInstructionsDialog();
    }
}

export function openDiscordLink_(): void {
    openDiscordLink();
}

export function showAboutDialog_(): void {
    showAboutDialog();
}

/**
 * Not intended to be called; function causes unit tests for HODL Totals
 * to be included in the rollup bundle.
 */
export function runUnitTests_(): void {
    if (typeof (doGet) !== 'undefined') {
        doGet({});
    }
}

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function resetTotalSheet_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return resetTotalSheet();
}

/**
 * A function that adds a FIFO-method coin tracking spreadsheet.
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCoinTrackedByFIFOMethod_(coinName?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newCoinSheet(coinName);
}

/**
 * A function that adds a SpecificID-method coin tracking spreadsheet.
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCoinTrackedBySpecIDMethod_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    Browser.msgBox('Specific ID Tracking Not Supported', 'This capital gains calculation method is not yet supported. Is this something you think should be a top priority for us to add? If yes, please join our Discord and indicate your interest in the #general channel.', Browser.Buttons.OK);
    return null;
}

/**
 * A function that adds a sheet to track the NFTs held in a given address
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newNFTSheet_(address?: string): GoogleAppsScript.Spreadsheet.Sheet | null {
    return newNFTSheet(address);
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the sheet that was formatted, for function chaining purposes.
 */
export function formatSheet_(): GoogleAppsScript.Spreadsheet.Sheet {
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
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 * @return the sheet that was updated, for function chaining purposes.
 */
export function updateFormulas_(): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheetContainsCoinData(sheet)) {
        updateFMVFormulas(sheet);
    } else if (sheetContainsNFTData(sheet)) {
        updateNFTFormulas(sheet);
    } else {
        Browser.msgBox('Active Sheet Does Not Support Updating Formulas', `The active sheet "${sheet.getName()}" does not look like a tracking sheet with Formulas that can be updated using this command. HODL Totals can only only update formulas on tracking sheets originally created using HODL Totals commands.`, Browser.Buttons.OK);
    }
    return sheet;
}

/**
 * Triggers a cost basis calculation
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export function calculateGainLoss_(): GoogleAppsScript.Spreadsheet.Sheet | null {
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
