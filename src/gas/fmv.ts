/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { CompleteDataRow } from '../types';

export function setFMVformulasOnSheet(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    data: CompleteDataRow[] | null,
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
    data: CompleteDataRow[] | null,
    strategy: string,
    acquired: string,
    disposed: string,
    oldStrategy?: string
): void {
    const errorValues = ['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#ERROR!'];
    if (strategy === 'Value Known') {
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, true);
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row); // restore any prev acquired/disposed values
    } else if (strategy === 'Price Known') {
        if (typeof oldStrategy !== 'undefined') {
            clearStrategyValuesFromRow(sheet, data, oldStrategy, row);
        }
        drawCellDisabled(sheet, data, row, 11, true);
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, false);
        if (acquired) {
            if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
                const oldVal = getCellValue(sheet, data, row, 4);
                if (!errorValues.includes(oldVal)) {
                    associateValueWithStrategy(sheet, data, oldStrategy, row, 4);
                }
            }
            fillInCell(sheet, data, row, 4, `=D${row + 1}*N${row + 1}`);
        } else if (disposed) {
            if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
                const oldVal = getCellValue(sheet, data, row, 6);
                if (!errorValues.includes(oldVal)) {
                    associateValueWithStrategy(sheet, data, oldStrategy, row, 6);
                }
            }
            fillInCell(sheet, data, row, 6, `=F${row + 1}*N${row + 1}`);
        }
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row); // restore any prev stashed price value
    } else if (strategy === 'Avg Daily Price Variation') {
        if (typeof oldStrategy !== 'undefined') {
            clearStrategyValuesFromRow(sheet, data, oldStrategy, row);
        }
        drawCellDisabled(sheet, data, row, 11, false);
        drawCellDisabled(sheet, data, row, 12, false);
        drawCellDisabled(sheet, data, row, 13, false);
        if (acquired) {
            if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
                const oldVal = getCellValue(sheet, data, row, 4);
                if (!errorValues.includes(oldVal)) {
                    associateValueWithStrategy(sheet, data, oldStrategy, row, 4);
                }
            }
            fillInCell(sheet, data, row, 4, `=D${row + 1}*N${row + 1}`);
        } else if (disposed) {
            if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
                const oldVal = getCellValue(sheet, data, row, 6);
                if (!errorValues.includes(oldVal)) {
                    associateValueWithStrategy(sheet, data, oldStrategy, row, 6);
                }
            }
            fillInCell(sheet, data, row, 6, `=F${row + 1}*N${row + 1}`);
        }
        if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Price Known')) {
            const oldVal = getCellValue(sheet, data, row, 13);
            if (!errorValues.includes(oldVal)) {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 13);
            }
        }
        fillInCell(sheet, data, row, 13, `=AVERAGE(L${row + 1},M${row + 1})`);
        // no need to restore values for Avg Daily Price Variation, since fields are filled in
    }
}

/**
 * wrapper for asserting a value that could come from either sheet or data table
 *
 */
function getCellValue(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, posX: number, posY: number): string {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        return `${data[posX][posY]}`;
    }
    if (sheet !== null) {
        const val = sheet.getRange(posX + 1, posY + 1).getValue();
        const formula = sheet.getRange(posX + 1, posY + 1).getFormula();
        if (formula !== '') {
            return formula;
        }
        return val;
    }
    return '';
}

/**
 * wrapper for asserting a value that could come from either sheet or data table
 *
 */
function fillInCell(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, posX: number, posY: number, value: string): void {
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
function drawCellDisabled(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, posX: number, posY: number, disable: boolean): void {
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
 * wrapper for removing all metadata from a row
 *
 */
function clearStrategyValuesFromRow(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, strategy: string, posX: number): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        const rowRange = sheet.getRange(`${posX + 1}:${posX + 1}`);
        const metadata = rowRange.getDeveloperMetadata();
        const matchingMetadata = metadata.filter(x => x.getKey() === strategy);
        matchingMetadata.forEach(match => {
            match.remove();
        });
    }
}

/**
 * wrapper for adding metadata to a cell in either sheet or data table
 *
 */
function associateValueWithStrategy(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, strategy: string, posX: number, posY: number): void {
    if ((typeof ScriptApp === 'undefined') && (data !== null)) {
        // no data table representation of this
    } else if (sheet !== null) {
        const range = sheet.getRange(posX + 1, posY + 1);
        const rowRange = sheet.getRange(`${posX + 1}:${posX + 1}`);
        const val = range.getValue();
        const formula = range.getFormula();
        if (formula !== '') {
            rowRange.addDeveloperMetadata(strategy, `${posY},${formula}`);
        }
        rowRange.addDeveloperMetadata(strategy, `${posY},${val}`);
    }
}

/**
 * wrapper for retoring a cell value from metadata associated with a cell
 *
 */
function restoreValueAssociatedWithStrategy(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: CompleteDataRow[] | null, strategy: string, posX: number): void {
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
