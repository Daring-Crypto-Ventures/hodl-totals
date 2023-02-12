/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * About dialog that shows information about where these tools came from.
 *
 */
import { version } from '../version';

/* global SpreadsheetApp */
/* global HtmlService */

export function showAboutDialog_(): void {
    if (typeof ScriptApp !== 'undefined') {
        const html = HtmlService.createHtmlOutputFromFile('assets/About')
            .setWidth(540)
            .setHeight(300);
        SpreadsheetApp.getUi().showModalDialog(html, `About HODL Totals ${version}`);
    }
}

export function showWelcomeDialog_(): void {
    if (typeof ScriptApp !== 'undefined') {
        const html = HtmlService.createHtmlOutputFromFile('assets/Welcome')
            .setWidth(840)
            .setHeight(340);
        SpreadsheetApp.getUi().showModalDialog(html, 'HODL Totals Instructions');
    }
}
