/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { completeDataRow } from '../types';

export function setFMVformulasOnSheet(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    data: completeDataRow[] | null,
    strategyCol: string[][],
    acquiredCol: string[][],
    disposedCol: string[][],
    lastRow: number
): void {
    for (let row = 2; row < lastRow; row++) {
        setFMVStrategyOnRow(sheet, row, data, strategyCol[row][0], acquiredCol[row][0], disposedCol[row][0]);
    }
}

export function setFMVStrategyOnRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    row: number,
    data: completeDataRow[] | null,
    strategy: string,
    acquired: string,
    disposed: string,
    oldStrategy?: string
): void {
    if ((strategy === 'Price Known') || (strategy === 'Avg Daily Price Variation')) {
        if (acquired) {
            // save off any Fiat Value saved in this cell before overwriting it
            if (typeof oldStrategy !== 'undefined') {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 4);
            }
            fillInCell(sheet, data, row, 4, `=D${row + 1}*N${row + 1}`);
        } else if (disposed) {
            // save off any Fiat Value saved in this cell before overwriting it
            if (typeof oldStrategy !== 'undefined') {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 6);
            }
            fillInCell(sheet, data, row, 6, `=F${row + 1}*N${row + 1}`);
        }
    }
    if (strategy === 'Value Known') {
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row);
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, true);
    } else if (strategy === 'Price Known') {
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row);
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, false);
    } else if (strategy === 'Avg Daily Price Variation') {
        drawCellDisabled(sheet, data, row, 11, false);
        drawCellDisabled(sheet, data, row, 12, false);
        drawCellDisabled(sheet, data, row, 13, false);
        // save off any Price saved in this cell before overwriting it
        if (typeof oldStrategy !== 'undefined') {
            associateValueWithStrategy(sheet, data, oldStrategy, row, 13);
        }
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
            sheet.getRange(posX + 1, posY + 1).setFontLine('line-through');
        } else {
            sheet.getRange(posX + 1, posY + 1).setFontLine('none');
        }
    }
}

/**
 * wrapper for adding metadata to a cell in either sheet or data table
 *
 */
function associateValueWithStrategy(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: completeDataRow[] | null, strategy: string, posX: number, posY: number): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        const range = sheet.getRange(posX + 1, posY + 1);
        const rowRange = sheet.getRange(`${posX + 1}:${posX + 1}`);
        rowRange.addDeveloperMetadata(strategy, `${posY},${range.getValue()}`);
    }
}

/**
 * wrapper for retoring a cell value from metadata associated with a cell
 *
 */
function restoreValueAssociatedWithStrategy(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: completeDataRow[] | null, strategy: string, posX: number): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        const rowRange = sheet.getRange(`${posX + 1}:${posX + 1}`);
        const metadata = rowRange.getDeveloperMetadata();

        // loop thru all the metadata and push restore data to the right cells
        const matchingMetadata = metadata.filter(x => x.getKey() === strategy);
        matchingMetadata.forEach(match => {
            const valueAsArray = match.getValue()?.split(',');
            const posY = Number(valueAsArray?.[0]);
            const value = valueAsArray?.[1];
            if (posY) {
                sheet.getRange(posX + 1, posY + 1).setValue(value);
            }
        });
    }
}
