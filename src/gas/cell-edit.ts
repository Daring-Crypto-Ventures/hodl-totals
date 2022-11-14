/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

import { setFMVStrategyOnRow } from './fmv';
import { CompleteDataRow } from '../types';
import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */

/**
 * A special function that runs when a user changes the value of any cell in a spreadsheet
 */
export default function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
    const sheet = e.range.getSheet();
    const currency = sheet.getName().replace(/ *\([^)]*\) */g, '');

    // simple check to verify that onEdit actions only happen on coin tracking sheets
    if (sheet.getRange('H1').getValue().trim() === currency) {
        const editedRow = e.range.getRow();
        // edit events triggered by the Tx column
        if ((e.range.getColumn() === 1) && (editedRow >= 3)) {
            const lastRow = getLastRowWithDataPresent(sheet.getRange('E:E').getValues());
            if (editedRow > lastRow) {
                // create filter around all transactions
                sheet.getFilter()?.remove();
                sheet.getRange(`A2:U${editedRow}`).createFilter();
            }
        }
        // edit events triggered by the FMV Strategy column
        if ((e.range.getColumn() === 8) && (editedRow >= 3)) {
            // update the FMV columns
            const newStrategy = e.value;
            const oldStrategy = e.oldValue;
            const data = sheet.getRange('A:U').getValues() as CompleteDataRow[];
            const acquired = sheet.getRange(`I${editedRow}`).getValue();
            const disposed = sheet.getRange(`K${editedRow}`).getValue();
            setFMVStrategyOnRow(sheet, editedRow - 1, data, newStrategy, acquired, disposed, oldStrategy);
        }
    }
}
