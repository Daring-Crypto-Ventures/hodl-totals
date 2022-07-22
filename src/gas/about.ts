/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * About dialog that shows information about where these tools came from.
 *
 */
import { version } from '../version';

export default function showAboutDialog_(): void {
    if (typeof ScriptApp !== 'undefined') {
        const html = HtmlService.createHtmlOutputFromFile('assets/About')
            .setWidth(540)
            .setHeight(300);
        SpreadsheetApp.getUi().showModalDialog(html, `About HODL Totals ${version}`);
    }
}
