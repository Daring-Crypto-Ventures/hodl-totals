/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

/* global SpreadsheetApp */
/* global GoogleAppsScript */

/**
 * parse the coin name out from the sheet title which is often decorated by things like
 * "Copy of" prefixes, " ###" suffixes and "(user-added-text)"" suffixes,
 *
 * @return string The coin name parsed from the sheet title
 */
export function getCoinFromSheetName(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): string {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return sheet.getName().replace(/ *\([^)]*\) */g, '').replace(/Copy of */g, '').replace(/ * [1234567890]+/g, '');
    }
    return '';
}

/**
 * callback from the sidebar UI code that accesses data from the active sheet
 *
 * @return {Object[]} The headers & values of all cells in row.
 */
export function pullDataFromActiveSheet(): unknown[] {
    // Retrieve and return the information requested by the sidebar.
    const sheet = SpreadsheetApp.getActiveSheet();
    // const coinName =  getCoinFromSheetName(sheet);
    const record = new Array(0);
    const sheetMetadata = sheet.getDeveloperMetadata();
    const metadata = sheet.getRange('1:1').getDeveloperMetadata();

    // record.push({ heading: 'coin', cellval: coinName });
    sheetMetadata.forEach(md => {
        record.push({ heading: md.getKey(), cellval: md.getValue() });
    });
    metadata.forEach(md => {
        record.push({ heading: `Row 1:${md.getKey()}`, cellval: md.getValue() });
    });

    return record;
}
