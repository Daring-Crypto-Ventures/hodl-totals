/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Open a URL to get user to join the HODL Totals Discord server without requiring additional user interaction
 *
 */

/* global SpreadsheetApp */
/* global HtmlService */

/**
 * Opens up a new tab in the browser, in such a way that something happens even if a popup blocker is engaged.
 *
 * Appended with underscore as this is a utility function that can only be called from other server scripts
 *
 */
export default function openDiscordLink_(): void {
    // Invite link to the HODL Totals Discord that never expires
    if (typeof ScriptApp !== 'undefined') {
        openUrlFromGoogleSheet('https://discord.gg/TWuA9DzZth');
    }
}

/**
 * Open a URL in a new tab.
 */
function openUrlFromGoogleSheet(url: string): void {
    // Credit for this regular expression: https://regex101.com/library/jN6kU2
    const re = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm; // eslint-disable-line no-useless-escape
    const hostname = re.exec(url)?.[1] ?? 'a';

    const html = HtmlService.createHtmlOutput('<html>'
      + '<body style="word-break:break-word;font-family:sans-serif;">'
      + `<p><a href="${url}" target="_blank" onclick="window.close()">Click here to proceed</a> to</p><p>${url}</p></body>`
      + '</html>')
        .setWidth(410).setHeight(80);

    SpreadsheetApp.getUi().showModalDialog(html, `Open ${hostname}`);
}
