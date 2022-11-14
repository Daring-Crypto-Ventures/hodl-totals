/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

/* global SpreadsheetApp */

export default function showNewCoinPrompt(): string | null {
    if (typeof ScriptApp !== 'undefined') {
        const ui = SpreadsheetApp.getUi();

        const result = ui.prompt(
            'New Currency',
            'Please enter the coin\'s trading symbol ("BTC", "ETH", "XRP"):',
            ui.ButtonSet.OK_CANCEL
        );

        // Process the user's response.
        const button = result.getSelectedButton();
        const text = result.getResponseText();
        if (button === ui.Button.OK) {
            return text;
        }
        // if ((button === ui.Button.CANCEL) || (button === ui.Button.CLOSE))
    }
    return null;
}
