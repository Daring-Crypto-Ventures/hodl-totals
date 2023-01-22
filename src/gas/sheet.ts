/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

import { version } from '../version';

/* global SpreadsheetApp */
/* global GoogleAppsScript */

/**
 * check sheet content ensure its content matches expected HODL Totals coin tracking format
 *
 * @return boolean if content matches the requested HODL Totals format
 */
export function sheetContainsCoinData(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, coin: string): boolean {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return ((sheet.getRange('H1').getValue() as string).trim() === coin);
    }
    return false;
}

/**
 * check sheet content ensure its content matches expected HODL Totals NFT tracking format
 *
 * @return boolean if content matches the requested HODL Totals format
 */
export function sheetContainsNFTData(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, address: string): boolean {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return ((sheet.getRange('B1').getValue() as string).trim() === `Address ${address}`);
    }
    return false;
}

/**
 * parse the coin name out from the sheet title which is often decorated by things like
 * "Copy of" prefixes, " ###" suffixes and "(user-added-text)"" suffixes,
 *
 * @return string The coin name parsed from the sheet title
 */
export function getCoinFromSheetName(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): string {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return sheet.getName()
            .replace(/ *\([^)]*\) */g, '')
            .replace(/Copy of */g, '')
            .replace(/ * [1234567890]+/g, '');
    }
    return '';
}

/**
 * parse the address out from the sheet title which is often decorated by things like
 * "Copy of" prefixes, " ###" suffixes and "(user-added-text)"" suffixes,
 *
 * @return string The address parsed from the sheet title
 */
export function getAddressFromSheetName(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): string {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return sheet.getName()
            .replace(/ *\([^)]*\) */g, '')
            .replace(/Copy of */g, '')
            .replace(/ * [1234567890]+/g, '')
            .replace(/ * NFTs/g, '');
    }
    return '';
}

/**
 * parse the coin name + any trailing "(user-added-text)" from the sheet title
 * but ignore decorations like "Copy of" prefixes, " ###" suffixes
 *
 * @return string The coin name parsed from the sheet title
 */
export function getAdornedCoinFromSheetName(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): string {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        return sheet.getName()
            .replace(/Copy of */g, '')
            .replace(/ * [1234567890]+/g, '');
    }
    return '';
}

/**
 * wrapper for removing all metadata from a row
 *
 */
export function resetVersionMetadata(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): void {
    if (typeof ScriptApp === 'undefined') {
        // no data table representation of this
    } else if (sheet !== null) {
        const sheetMetadata = sheet.getDeveloperMetadata();
        const row1metadata = sheet.getRange('1:1').getDeveloperMetadata(); // can remove this once dev versions with version no longer present
        const metadata = sheetMetadata.concat(row1metadata);
        const matchingMetadata = metadata.filter(x => x.getKey() === 'version');
        matchingMetadata.forEach(match => {
            match.remove();
        });
        sheet.addDeveloperMetadata('version', version);
    }
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
