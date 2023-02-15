import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */

/**
 * Spreadsheet satisifes some specific data validation rules which are PREREQs for the gain/loss calculation
 *
 * @param sheet sheet containing NFT data to validate
 * @return empty string if sheet validated successfully, non-empty string describing the validation error if validation failed
 */
export default function validateNFTSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): string {
    const lastTxInRow = getLastRowWithDataPresent(sheet?.getRange('F3:F').getValues() as string[][]);
    const lastTxOutRow = getLastRowWithDataPresent(sheet?.getRange('V3:V').getValues() as string[][]);
    const lastRow = lastTxInRow > lastTxOutRow ? lastTxInRow : lastTxOutRow;
    const inflowDates = sheet?.getRange(`F1:F${lastRow + 1}`).getValues() as string[][];
    const outflowDates = sheet?.getRange(`V1:V${lastRow + 1}`).getValues() as string[][];

    // Iterate thru the rows to ensure that all NFT dispositions have a matching NFT acquisition
    for (let row = 2; row < lastRow; row++) {
        if ((outflowDates[row][0] !== '') && (inflowDates[row][0] === '')) {
            return `Data Validation Error: There was no record of acquiring the NFT reported as disposed on row ${row + 1}.`;
        }
    }

    return ''; // no error message
}
