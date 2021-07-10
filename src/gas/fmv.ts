/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { completeDataRow } from '../types';

export function setFMVformulasOnSheet(
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

export function setFMVStrategyOnRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    row: number,
    strategy: string,
    data: completeDataRow[] | null,
    acquiredCol: string,
    disposedCol: string
): void {
    // TODO load value when swapping back to a strategy

    if ((strategy === 'Price Known') || (strategy === 'Avg Daily Price Variation')) {
        if (acquiredCol) {
            // save off any Fiat Value saved in this cell before overwriting it
            writeCellValueToNote(sheet, data, row, 4);
            fillInCell(sheet, data, row, 4, `=D${row + 1}*N${row + 1}`);
        } else if (disposedCol) {
            // save off any Fiat Value saved in this cell before overwriting it
            writeCellValueToNote(sheet, data, row, 6);
            fillInCell(sheet, data, row, 6, `=F${row + 1}*N${row + 1}`);
        }
    }
    if (strategy === 'Value Known') {
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, true);
    } else if (strategy === 'Price Known') {
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, false);
    } else if (strategy === 'Avg Daily Price Variation') {
        drawCellDisabled(sheet, data, row, 11, false);
        drawCellDisabled(sheet, data, row, 12, false);
        drawCellDisabled(sheet, data, row, 13, false);
        // save off any Price saved in this cell before overwriting it
        // TODO record the prev strategy used to calc the value
        writeCellValueToNote(sheet, data, row, 13);
        fillInCell(sheet, data, row, 13, `=AVERAGE(L${row + 1},M${row + 1})`);
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

/**
 * wrapper for disabling a cell in either sheet or data table
 *
 */
function drawCellDisabled(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: completeDataRow[] | null, posX: number, posY: number, disable: boolean): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        if (disable) {
            sheet.getRange(posX + 1, posY + 1).setBackground('#EEEEEE');
        } else {
            sheet.getRange(posX + 1, posY + 1).clearFormat();
        }
    }
}

/**
 * wrapper for adding note to a cell in either sheet or data table
 *
 */
function writeCellValueToNote(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: completeDataRow[] | null, posX: number, posY: number): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        const range = sheet.getRange(posX + 1, posY + 1);
        // TODO - don't record #DIV/0 sorts of values?
        range.setNote(`Previous value: ${range.getValue()}`);
    }
}
