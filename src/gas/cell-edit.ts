/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

import { setFMVStrategyOnRow } from './fmv';
import { completeDataRow } from '../types';

/**
 * A special function that runs when a user changes the value of any cell in a spreadsheet
 */
export default function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
    const sheet = e.range.getSheet();
    const currency = sheet.getName().replace(/ *\([^)]*\) */g, '');

    // simple check to verify that onEdit actions only happen on coin tracking sheets
    if (sheet.getRange('B1').getValue() === currency) {
        // edit events triggered by the FMV Strategy column
        const rowFMVstrategyChange = e.range.getRow();
        if ((e.range.getColumn() === 3) && (rowFMVstrategyChange >= 3)) {
            // update the FMV columns
            const newStrategy = e.value;
            const data = sheet.getRange('A:N').getValues() as completeDataRow[];
            const acquired = sheet.getRange(`D${rowFMVstrategyChange}`).getValue();
            const disposed = sheet.getRange(`F${rowFMVstrategyChange}`).getValue();
            setFMVStrategyOnRow(sheet, rowFMVstrategyChange - 1, newStrategy, data, acquired, disposed);
        }
    }
}
