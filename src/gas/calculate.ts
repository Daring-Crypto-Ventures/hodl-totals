/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { CompleteDataRow, CompleteDataRowAsStrings, LooselyTypedDataValidationRow } from '../types';
import getLastRowWithDataPresent from '../last-row';
import calculateFIFO from '../calc-fifo';
import getOrderList from '../orders';
import validate from '../validate';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Logger */
/* global Utilities */
/* global Browser */

/**
 * iterate through the rows in the sheet to calculate cost basis
 *
 * @return the sheet, for function chaining purposes.
 */
export function calculateCoinGainLoss(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        const coinName = sheet.getName().replace(/ *\([^)]*\) */g, '');

        // simple check to verify that formatting actions only happen on coin tracking sheets
        if ((sheet.getRange('H1').getValue() as string).trim() !== coinName) {
            Browser.msgBox('Formatting Error', 'The active sheet does not look like a coin tracking sheet, can only only calculate gains or losses on well-formatted coin sheets originally created using HODL Totals commands', Browser.Buttons.OK);
            return null;
        }

        // sanity check the data in the sheet. only proceed if data is good
        Logger.log('Validating the data before starting calculations.');
        const validationErrMsg = validate(sheet.getRange('E:L').getValues() as LooselyTypedDataValidationRow[]);

        if (validationErrMsg === '') {
            const data = sheet.getRange('A:U').getValues() as CompleteDataRow[];
            const formulaData = sheet.getRange('A:U').getFormulas() as CompleteDataRowAsStrings[];
            const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(dateDisplayValues);

            // clear previously calculated values
            Logger.log('Clearing previously calculated values and notes.');
            sheet.getRange('P3:T').setValue('');
            sheet.getRange('K3:K').setNote('');

            const lots = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('I:J').getValues() as [number, number][]);
            Logger.log(`Detected ${lots.length} purchases of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);
            const sales = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('K:L').getValues() as [number, number][]);
            Logger.log(`Detected ${sales.length} sales of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);

            const annotations = calculateFIFO(coinName, data, formulaData, lots, sales);

            for (let i = 2; i < data.length; i++) {
                // scan just the inflow & outflow data of the row we're about to write
                // avoid writing zeroes to previously empty cells (but write zeros to the Calculated columns)
                // avoid overwriting any formulas used to calculate the values
                for (let j = 0; j < 21; j++) {
                    if ((j < 15) && (Number(data[i][j]) === 0)) {
                        data[i][j] = '';
                    }
                    if (formulaData[i][j] !== '') {
                        data[i][j] = formulaData[i][j];
                    }
                }
                sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
            }
            SpreadsheetApp.flush();

            // iterate through annotations and add to the Sheet
            for (const annotation of annotations) {
                sheet.getRange(`${annotation[0]}`).setNote(annotation[1]);
            }

            // output the current date and time as the time last completed
            const now = Utilities.formatDate(new Date(), 'CST', 'yyyy-mm-dd HH:mm');
            sheet.getRange('S1').setValue(`${now}`);
            sheet.getRange('T1').setValue('Succeeded');
            Logger.log(`Last calculation succeeded ${now}`);
        } else {
            // notify the user of the data validation error
            const msgPrefix = validationErrMsg.substr(0, validationErrMsg.indexOf(':'));
            const msg = Utilities.formatString(validationErrMsg);
            Browser.msgBox(msgPrefix, msg, Browser.Buttons.OK);

            // record the failure in the sheet as well
            const now = Utilities.formatDate(new Date(), 'CST', 'yyyy-mm-dd HH:mm');
            sheet.getRange('S1').setValue(`${now}`);
            sheet.getRange('T1').setValue('Failed');
            Logger.log(`Data validation failed ${now}`);
        }
        return sheet;
    }
    return null;
}
