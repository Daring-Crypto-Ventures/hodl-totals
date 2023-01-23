/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

/* global GoogleAppsScript */
/* global Browser */

/**
 * xxxxx
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function updateNFTFormulas(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        Browser.msgBox('NFT Update Formulas', 'TODO', Browser.Buttons.OK);
    }
    return null;
}
