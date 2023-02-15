import { version } from '../version';

/* global SpreadsheetApp */
/* global HtmlService */

/**
 * Opens up a custom HTML-based dialog with information about HODL Totals
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export function showAboutDialog_(): void {
    if (typeof ScriptApp !== 'undefined') {
        const html = HtmlService.createHtmlOutputFromFile('assets/About')
            .setWidth(540)
            .setHeight(300);
        SpreadsheetApp.getUi().showModalDialog(html, `About HODL Totals ${version}`);
    }
}

/**
 * Opens up a custom HTML-based dialog with instructions on how to use HODL Totals
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export function showInstructionsDialog_(): void {
    if (typeof ScriptApp !== 'undefined') {
        const html = HtmlService.createHtmlOutputFromFile('assets/Instructions')
            .setWidth(860)
            .setHeight(380);
        SpreadsheetApp.getUi().showModalDialog(html, 'HODL Totals Getting Started Guide');
    }
}
