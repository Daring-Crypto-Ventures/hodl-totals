/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { completeDataRow } from '../types';

export default function calcFiatValuesFromFMV(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    data: completeDataRow[] | null,
    acquiredCol: string[][],
    disposedCol: string[][],
    firstFMVcol: string[][],
    lastRow: number
): void {
    for (let row = 2; row < lastRow; row++) {
        const highValue = firstFMVcol[row][0] || 'value known';

        // if value known don't include formulas to calculate the price from FMV columns
        if (highValue !== 'value known') {
            // calculate fiat price based on other columns
            if (acquiredCol[row][0]) {
                fillInCell(sheet, data, row, 4, `=D${row + 1}*N${row + 1}`);
            } else if (disposedCol[row][0]) {
                fillInCell(sheet, data, row, 6, `=F${row + 1}*N${row + 1}`);
            }

            // unless the price is known, calculate via averaging high/low price for that date
            if (highValue !== 'price known') {
                fillInCell(sheet, data, row, 13, `=AVERAGE(L${row + 1},M${row + 1})`);
            } else {
                // copy the price known sentinel value to any cells to the right
                fillInCell(sheet, data, row, 12, 'price known');
            }
        } else {
            // copy the price known sentinel value to any cells to the right
            fillInCell(sheet, data, row, 11, 'value known'); // if was empty, need to fill it in here
            fillInCell(sheet, data, row, 12, 'value known');
            fillInCell(sheet, data, row, 13, 'value known');
        }
    }
}

/**
 * wrapper for asserting a value that could come from either sheet or data table
 *
 */
function fillInCell(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: completeDataRow[] | null, posX: number, posY: number, value: string): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        data[posX][posY] = value;
    } else if (sheet !== null) {
        sheet.getRange(posX + 1, posY + 1).setValue(value);
    }
}