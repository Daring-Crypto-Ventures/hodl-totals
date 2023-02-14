/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import validateNFTSheet from './validate-nft';
import { CompleteDataRowAsStrings, CompleteNFTDataRow } from '../types';
import getLastRowWithDataPresent from '../last-row';
import { dateFromString, datePlusNYears } from '../calc-fifo';
import { newNFTCategorySheet } from './categories';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Utilities */
/* global Browser */
/* global Logger */
/* global LockService */

/**
 * iterate through the rows in the sheet to determine short-term or long-term gains status for each disposed NFT
 *
 * @return the sheet, for function chaining purposes.
 */
export function calculateNFTGainLossStatus(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        try {
            const lock = LockService.getDocumentLock();
            if (lock?.tryLock(1200000)) { // spend no more than 120 sec trying to get the lock
                actuallyCalculateNFTGainLossStatus(sheet);
                SpreadsheetApp.flush();
                lock.releaseLock();
            } else {
                Logger.log('calculateNFTGainLossStatus could not obtain lock.');
            }
        } catch (exc: unknown) {
            if (exc instanceof Error) {
                Logger.log(`calculateNFTGainLossStatus Exception - ${exc.message}`);
            }
        }
        return sheet;
    }
    return null;
}

/**
 * Private function that does the work of calculateNFTGainLossStatus()
 * Assumption: can only be invoked within the context of a Google Sheet
 * Assumption: secure a Lock before calling this function
 *
 * @param sheet Google Sheet that has been verified to be an NFT sheet
 *
 * @return the newly created sheet, for function chaining purposes.
 */
function actuallyCalculateNFTGainLossStatus(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // if no Categories sheet previously exists, create one
    if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories') == null) {
        newNFTCategorySheet();
    }

    // sanity check the data in the sheet. only proceed if data is good
    Logger.log('Validating the NFT data before starting calculation.');
    const validationErrMsg = validateNFTSheet(sheet);

    if (validationErrMsg === '') {
        const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
        const lastTxInRow = getLastRowWithDataPresent(sheet.getRange('F:F').getDisplayValues());
        const lastTxOutRow = getLastRowWithDataPresent(sheet.getRange('V:V').getDisplayValues());
        const lastRow = (lastTxInRow) > lastTxOutRow ? lastTxInRow : lastTxOutRow;
        const data = sheet.getRange(`A1:AG${lastRow}`).getValues() as CompleteNFTDataRow[];
        const formulaData = sheet.getRange(`A1:AG${lastRow}`).getFormulasR1C1() as CompleteDataRowAsStrings[];

        // Create tax status lookup table for categories from the Categories sheet
        const nftCategoriesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NFT Categories');
        let txInCategoryRows: string[][] = [];
        let txOutCategoryRows: string[][] = [];
        if (nftCategoriesSheet !== null) {
            txInCategoryRows = nftCategoriesSheet.getRange('A2:C20').getValues() as string[][];
            txOutCategoryRows = nftCategoriesSheet.getRange('A21:C35').getValues() as string[][];
        }

        // clear previously filled-in values
        sheet.getRange('P3:P').setValue('');
        sheet.getRange('AF3:AF').setValue('');

        // walk through all rows and fill in Status
        data.forEach((row, rowIdx) => {
            if (rowIdx > 1) { // Skip past the header rows
                // Check to see if row's Tx In category is Taxable or Not Taxable thing, list that and move on
                const txInCategory = row[6]; // Inflow Category
                txInCategoryRows.every(categoryRow => {
                    const taxableStatus = (categoryRow?.[0] === txInCategory) ? categoryRow?.[2] : '';
                    if (taxableStatus.startsWith('Not Taxable')) {
                        row[15] = 'Not Taxable'; // In Tx Status
                        return false; // stop iterating
                    }
                    if (taxableStatus.startsWith('Already Taxed')) {
                        row[15] = 'Already Taxed'; // In Tx Status
                        return false; // stop iterating
                    }
                    if (taxableStatus.startsWith('Taxable')) {
                        row[15] = 'Taxable'; // In Tx Status
                        return false; // stop iterating
                    }
                    return true; // continue iterating thru categories list looking for a match
                });

                // Check to see if row's Tx Out was sold and if so determine its status
                let acqDate: Date;
                if (row[5] instanceof Date) {
                    acqDate = row[5]; // In Tx's Date & Time
                } else {
                    acqDate = dateFromString(row[5]); // In Tx's Date & Time
                }
                const dispValue = row[21]; // Out Tx's Date & Time
                if (dispValue === '') {
                    row[31] = 'Unsold'; // Out Tx Status
                } else {
                    let dispDate: Date;
                    if (row[21] instanceof Date) {
                        dispDate = row[21]; // Out Tx's Date & Time
                    } else {
                        dispDate = dateFromString(row[21]); // Out Tx's Date & Time
                    }
                    const oneYrAfterAcqDate = datePlusNYears(acqDate, 1);

                    // If row's Tx Out category is a Not Taxable thing, if yes set as such and move on
                    const txOutCategory = row[20];
                    let txOutIsTaxable = true;
                    txOutCategoryRows.every(categoryRow => {
                        const taxableStatus = (categoryRow?.[0] === txOutCategory) ? categoryRow?.[2] : '';
                        if (taxableStatus.startsWith('Not Taxable')) {
                            row[31] = 'Not Taxable'; // Out Tx Status
                            txOutIsTaxable = false;
                            return false; // stop iterating
                        }
                        if (taxableStatus.startsWith('Already Taxed')) {
                            row[31] = 'Already Taxed'; // Out Tx Status
                            txOutIsTaxable = false;
                            return false; // stop iterating
                        }
                        if (taxableStatus.startsWith('Taxable')) {
                            return false; // stop iterating
                        }
                        return true; // continue iterating thru categories list looking for a match
                    });

                    if (txOutIsTaxable) {
                        if ((dispDate.getTime() - oneYrAfterAcqDate.getTime()) / MILLIS_PER_DAY > 0) {
                            row[31] = 'Long-term'; // Out Tx Status
                        } else {
                            row[31] = 'Short-term'; // Out Tx Status
                        }
                    }
                }
            }
        });

        // scan just the inflow & outflow data of the row we're about to write
        // avoid writing zeroes to previously empty cells (but write zeros to the Calculated columns)
        // avoid overwriting any formulas used to calculate the values
        data.forEach((row, rowIdx) => {
            if (rowIdx > 1) { // Skip past the header rows
                row.forEach((cell, colIdx) => {
                    if (((colIdx < 13) || ((colIdx > 15) && (colIdx < 28))) && (Number(cell) === 0)) {
                        row[colIdx] = '';
                    }
                    if (formulaData[rowIdx][colIdx] !== '') {
                        row[colIdx] = formulaData[rowIdx][colIdx];
                    }
                });
            }
        });

        // Apply all the batched up edits to the sheet
        data.forEach((row, rowIdx) => {
            if (rowIdx > 1) { // Skip past the header rows
                sheet.getRange(rowIdx + 1, 1, 1, row.length).setValues([row]);
            }
        });
        SpreadsheetApp.flush();

        const now = Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm');
        sheet.getRange('AE1').setValue(`${now}`);
        sheet.getRange('AF1').setValue('Succeeded');
        Logger.log(`Last NFT calculation succeeded ${now}`);
    } else {
        // notify the user of the data validation error
        const msgPrefix = validationErrMsg.substring(0, validationErrMsg.indexOf(':'));
        const msg = Utilities.formatString(validationErrMsg);
        Browser.msgBox(msgPrefix, msg, Browser.Buttons.OK);

        const now = Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm');
        sheet.getRange('AE1').setValue(`${now}`);
        sheet.getRange('AF1').setValue('Failed');
        Logger.log(`NFT Data validation failed ${now}`);
    }
}
