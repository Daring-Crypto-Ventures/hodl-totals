/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

import { newNFTCategorySheet } from './categories';
import { formatNFTSheet } from './format-nft';
import { getCoinFromSheetName } from './sheet';

/* global SpreadsheetApp */
/* global GoogleAppsScript */

export function showNewNFTAddrPrompt(): string | null {
    if (typeof ScriptApp !== 'undefined') {
        const ui = SpreadsheetApp.getUi();

        const result = ui.prompt(
            'Track NFTs',
            'Enter the address or shortened address ("0xa1b2...y25z26", "Yourname.eth", etc). If your address holds NFTs on multiple networks consider appending a network name to the adddress ("0xe5d4... Polygon").',
            ui.ButtonSet.OK_CANCEL
        );

        // Process the user's response.
        const button = result.getSelectedButton();
        const text = result.getResponseText();
        if (button === ui.Button.OK) {
            // show alerts and cancel the command if the user provided text has issues
            if (text === '') {
                ui.alert('Invalid Address', 'The address cannot be left blank.', ui.ButtonSet.OK);
                return null;
            }
            if (/ *\([^)]*\) */g.test(text)) {
                ui.alert('Invalid Address', 'The address text cannot end with text in parenthesis.', ui.ButtonSet.OK);
                return null;
            }
            if (/Copy of */g.test(text)) {
                ui.alert('Invalid Address', 'The address cannot start with "Copy of ".', ui.ButtonSet.OK);
                return null;
            }
            if (/ * [1234567890]+/g.test(text)) {
                ui.alert('Invalid Address', 'The address cannot end with space followed by a number.', ui.ButtonSet.OK);
                return null;
            }
            // walk through all sheets in workbook to compare suggested new coin name with existing sheet names
            const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
            if (allSheets.every(sheet => text !== getCoinFromSheetName(sheet))) {
                return text;
            }
            ui.alert('Address Conflict', `A sheet named ${text} already exists in this workbook.`, ui.ButtonSet.OK);
            return null;
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
export function newNFTSheet(address = ''): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        // ask user what the name of the new currency will be
        let newNFTAddress: string | null = null;
        if (address === '') {
            newNFTAddress = showNewNFTAddrPrompt();
        } else {
            newNFTAddress = address;
        }

        // indicates that the user canceled, so abort without making a new sheet
        if (newNFTAddress === null) return null;

        // if no Categories sheet previously exists, create one
        if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories') == null) {
            newNFTCategorySheet();
        }

        const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`${newNFTAddress} NFTs`);
        SpreadsheetApp.setActiveSheet(newSheet);
        newSheet.getRange('B1').setValue(`Address ${newNFTAddress}`);

        return formatNFTSheet(newSheet);
    }
    return null;
}
