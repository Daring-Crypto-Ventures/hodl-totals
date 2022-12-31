/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

import newCategorySheet from './categories';
import { formatSheet } from './format';

/* global SpreadsheetApp */
/* global GoogleAppsScript */

export function showNewCoinPrompt(): string | null {
    if (typeof ScriptApp !== 'undefined') {
        const ui = SpreadsheetApp.getUi();

        const result = ui.prompt(
            'Track New Coin',
            'Enter the coin\'s trading symbol ("BTC", "ETH", "XRP"):',
            ui.ButtonSet.OK_CANCEL
        );

        // Process the user's response.
        const button = result.getSelectedButton();
        const text = result.getResponseText();
        if (button === ui.Button.OK) {
            // show alerts and cancel the command if the user provided text has issues
            if (text === '') {
                ui.alert('Invalid Coin Name', 'The new coin\'s trading symbol cannot be left blank.', ui.ButtonSet.OK);
                return null;
            }
            if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName(text) !== null) {
                ui.alert('Coin Name Conflict', `A sheet named ${text} already exists.`, ui.ButtonSet.OK);
                return null;
            }
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
export function newCoinSheet(coinName = ''): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        // ask user what the name of the new currency will be
        let newCoinName: string | null = null;
        if (coinName === '') {
            newCoinName = showNewCoinPrompt();
        } else {
            newCoinName = coinName;
        }

        // indicates that the user canceled, so abort without making a new sheet
        if (newCoinName === null) return null;

        // if no Categories sheet previously exists, create one
        if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null) {
            newCategorySheet();
        }

        const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newCoinName);
        SpreadsheetApp.setActiveSheet(newSheet);
        newSheet.getRange('H1').setValue(newCoinName);

        return formatSheet(newSheet);
    }
    return null;
}
