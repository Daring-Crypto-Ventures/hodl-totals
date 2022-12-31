/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { getCoinFromSheetName } from './sheet';
import { CompleteDataRow } from '../types';
import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */
/* global Browser */

/**
 * iterate through the rows in the sheet to
 * set Cost Fiat Received based on other cells in the sheet
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function updateFMVFormulas(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        const desiredCurrency = getCoinFromSheetName(sheet);

        // simple check to verify that formatting actions only happen on coin tracking sheets
        if ((sheet.getRange('H1').getValue() as string).trim() !== desiredCurrency) {
            Browser.msgBox('Fair Market Value Formula Update Error', 'The active sheet does not look like a coin tracking sheet, only update the Fair Market Value Formulas on existing coin sheets originally created using HODL Totals commands', Browser.Buttons.OK);
            return null;
        }

        const lastRow = getLastRowWithDataPresent(sheet.getRange('E:E').getValues() as string[][]);

        // code split out into its own function from fromat() because it can take awhile to run
        const strategyCol = sheet.getRange('H:H').getValues() as string[][];
        const acquiredCol = sheet.getRange('I:I').getValues() as string[][];
        const disposedCol = sheet.getRange('K:K').getValues() as string[][];
        setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);
        return sheet;
    }
    return null;
}

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
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, true);
        drawCellDisabled(sheet, data, row, 14, true);
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row); // restore any prev acquired/disposed values
    } else if (strategy === 'Price Known') {
        if (typeof oldStrategy !== 'undefined') {
            clearStrategyValuesFromRow(sheet, data, oldStrategy, row);
        }
        drawCellDisabled(sheet, data, row, 12, true);
        drawCellDisabled(sheet, data, row, 13, true);
        drawCellDisabled(sheet, data, row, 14, false);
        setFormulasInAcquiredDisposedCells(acquired, oldStrategy, sheet, data, row, errorValues, disposed);
        restoreValueAssociatedWithStrategy(sheet, data, strategy, row); // restore any prev stashed price value
    } else if (strategy === 'Avg Daily Price Variation') {
        if (typeof oldStrategy !== 'undefined') {
            clearStrategyValuesFromRow(sheet, data, oldStrategy, row);
        }
        setFormulasInAcquiredDisposedCells(acquired, oldStrategy, sheet, data, row, errorValues, disposed);
        if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Price Known')) {
            const oldVal = getCellValue(sheet, data, row, 14);
            if (!errorValues.includes(oldVal)) {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 14);
            }
        }
        fillInCell(sheet, data, row, 14, `=AVERAGE(M${row + 1},N${row + 1})`);
        // no need to restore values for Avg Daily Price Variation, since fields are filled in
        drawCellDisabled(sheet, data, row, 12, false);
        drawCellDisabled(sheet, data, row, 13, false);
        drawCellDisabled(sheet, data, row, 14, false);
    }
}

function setFormulasInAcquiredDisposedCells(
    acquired: string,
    oldStrategy: string | undefined,
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    data: CompleteDataRow[] | null,
    row: number,
    errorValues: string[],
    disposed: string
): void {
    if (acquired) {
        if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
            const oldVal = getCellValue(sheet, data, row, 9);
            if (!errorValues.includes(oldVal)) {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 9);
            }
        }
        fillInCell(sheet, data, row, 9, `=I${row + 1}*O${row + 1}`);
    } else if (disposed) {
        if ((typeof oldStrategy !== 'undefined') && (oldStrategy === 'Value Known')) {
            const oldVal = getCellValue(sheet, data, row, 11);
            if (!errorValues.includes(oldVal)) {
                associateValueWithStrategy(sheet, data, oldStrategy, row, 11);
            }
        }
        fillInCell(sheet, data, row, 11, `=K${row + 1}*O${row + 1}`);
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
        const val = sheet.getRange(posX + 1, posY + 1).getValue() as string;
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
        const val = range.getValue() as string;
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
