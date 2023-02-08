/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import { getCoinFromSheetName } from './sheet';
import validateNFTSheet from './validate-nft';
import { CompleteDataRow, CompleteDataRowAsStrings, LooselyTypedDataValidationRow } from '../types';
import getLastRowWithDataPresent from '../last-row';
import { calculateFIFO, datePlusNYears } from '../calc-fifo';
import { setFMVStrategyOnRow } from './formulas-coin';
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
        const coinName = getCoinFromSheetName(sheet);
        const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);

        // sanity check the data in the sheet. only proceed if data is good
        Logger.log('Validating the data before starting calculations.');
        const dateNotes = sheet.getRange(`E3:E${lastRow}`).getNotes().map(d => d[0]);
        const validationErrMsg = validate(sheet.getRange(`E3:L${lastRow}`).getValues() as LooselyTypedDataValidationRow[], dateNotes);

        if (validationErrMsg === '') {
            const data = sheet.getRange(`A1:U${lastRow}`).getValues() as CompleteDataRow[];
            const formulaData = sheet.getRange(`A1:U${lastRow}`).getFormulasR1C1() as CompleteDataRowAsStrings[];
            const dateValues = sheet.getRange(`E1:E${lastRow}`).getValues().map(d => d[0] as Date);

            // clear previously calculated values
            sheet.getRange('P3:T').setValue('');
            sheet.getRange('K3:K').setNote('');

            const lots = getOrderList(dateValues, sheet.getRange(`I1:J${lastRow}`).getValues() as [number, number][]);
            Logger.log(`Detected ${lots.length} purchases of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);

            const sales = getOrderList(dateValues, sheet.getRange(`K1:L${lastRow}`).getValues() as [number, number][]);
            Logger.log(`Detected ${sales.length} sales of ${sheet.getName().replace(/ *\([^)]*\) */g, '')}.`);

            const annotations = calculateFIFO(coinName, data, lots, sales);

            // augment the formula array to account for split rows added to the data array by calculateFIFO
            let firstRowOfTheSplit = true;
            annotations.forEach(annotatedRow => {
                if (annotatedRow?.[2]?.startsWith('Split')) {
                    const splitRowIdx = annotatedRow?.[0] - 1; // convert 1-based row that Google Sheet expects into 0-based js data array
                    const modifiedColumnsIdxs = [6, 10, 11]; // net change, outflow coin disposed, outflow coin USD value

                    // if first row of split, create an extra row in the formula array so that its shape matches the data array shape
                    if (firstRowOfTheSplit) {
                        // copy formula data from the split row into the newly created row
                        formulaData.splice(splitRowIdx + 1, 0, [...formulaData[splitRowIdx]]);

                        const nonModifiedColumnsIdxs = [1, 2, 3, 4, 12, 13, 14, 20]; // wallets/accounts, tx id, descrip, date, High, Low, Price
                        // for nonmodified cells, copy cell formatting (bkgnd color, text styling, number/date styling, attached notes) from old row to new row
                        nonModifiedColumnsIdxs.forEach(colIdx => {
                            // convert 0-based js data array into 1-based row that Google Sheet expects
                            sheet.getRange(splitRowIdx + 2, colIdx + 1).setBackground(sheet.getRange(splitRowIdx + 1, colIdx + 1).getBackground());
                            sheet.getRange(splitRowIdx + 2, colIdx + 1).setFontWeight(sheet.getRange(splitRowIdx + 1, colIdx + 1).getFontWeight());
                            sheet.getRange(splitRowIdx + 2, colIdx + 1).setFontStyle(sheet.getRange(splitRowIdx + 1, colIdx + 1).getFontStyle());
                            sheet.getRange(splitRowIdx + 2, colIdx + 1).setNumberFormat(sheet.getRange(splitRowIdx + 1, colIdx + 1).getNumberFormat());
                            sheet.getRange(splitRowIdx + 2, colIdx + 1).setNote(sheet.getRange(splitRowIdx + 1, colIdx + 1).getNote());
                        });
                    } else {
                        // apply the Valuation Strategy and its formatting rules to the added row
                        const acquired = sheet.getRange(splitRowIdx + 1, 9).getValue() as number;
                        const disposed = sheet.getRange(splitRowIdx + 1, 11).getValue() as number;
                        setFMVStrategyOnRow(sheet, splitRowIdx, data, data[splitRowIdx][7], acquired, disposed);
                        SpreadsheetApp.flush();
                    }
                    firstRowOfTheSplit = !firstRowOfTheSplit;

                    // on split rows and the newly created rows, don't overwrite calculated values with formulas
                    // splitRow formulas as Note on that cell so that the user data isnt lost
                    modifiedColumnsIdxs.forEach(colIdx => {
                        if (formulaData[splitRowIdx][colIdx] !== '') {
                            // convert 0-based js data array into 1-based row that Google Sheet expects
                            annotations.push([splitRowIdx + 1, colIdx + 1, `Value used in place of formula:\n${formulaData[splitRowIdx][colIdx]}`]);
                        }
                        formulaData[splitRowIdx][colIdx] = '';
                    });
                }
            });

            // scan just the inflow & outflow data of the row we're about to write
            // avoid writing zeroes to previously empty cells (but write zeros to the Calculated columns)
            // avoid overwriting any formulas used to calculate the values
            data.forEach((row, rowIdx) => {
                if (rowIdx > 1) { // Skip past the header rows
                    for (let j = 0; j < 21; j++) {
                        if ((j < 15) && (Number(row[j]) === 0)) {
                            row[j] = '';
                        }
                        if (formulaData[rowIdx][j] !== '') {
                            row[j] = formulaData[rowIdx][j];
                        }
                    }
                }
            });

            // Create tax status lookup table for categories from the Categories sheet
            const txCategoryRows = getTxCategoryData();

            // Make another pass on data array to augment it with Taxable or Not Taxable Statuses
            updateTaxableStatusAndAcqDates(data, txCategoryRows);

            // Apply all the batched up edits to the sheet
            data.forEach((row, rowIdx) => {
                if (rowIdx > 1) { // Skip past the header rows
                    sheet.getRange(rowIdx + 1, 1, 1, row.length).setValues([row]);
                }
            });
            SpreadsheetApp.flush();

            // Iterate through the annotations and add them as Notes to the sheet
            annotations.forEach(annotation => {
                sheet.getRange(annotation[0], annotation[1]).setNote(annotation[2]);
            });

            // output the current date and time as the time last completed
            const now = Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm');
            sheet.getRange('S1').setValue(`${now}`);
            sheet.getRange('T1').setValue('Succeeded');
            Logger.log(`Last calculation succeeded ${now}`);
        } else {
            // notify the user of the data validation error
            const msg = validationErrMsg.split(':');
            Browser.msgBox(msg?.[0], msg?.[1], Browser.Buttons.OK);

            // record the failure in the sheet as well
            const now = Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm');
            sheet.getRange('S1').setValue(`${now}`);
            sheet.getRange('T1').setValue('Failed');
            Logger.log(`Data validation failed ${now}`);
        }
        return sheet;
    }
    return null;
}

function updateTaxableStatusAndAcqDates(data: CompleteDataRow[], txCategoryRows: string[][]): void {
    const txCategoryCol = data.map(d => d[5]); // extract the Category column as a 1D string array
    const txLotInfoCol = data.map(d => d[15]); // extract the Lot Info column as a 1D string array
    txLotInfoCol.forEach((txLotInfo, rowIdx) => {
        // Check the row's Tx category's Taxable status, append that and move on
        const txCategory = txCategoryCol[rowIdx];
        txCategoryRows.every(categoryRow => {
            const taxableStatus = (categoryRow?.[0] === txCategory) ? categoryRow?.[2] : '';
            if (taxableStatus.startsWith('Not Taxable')) {
                data[rowIdx][17] = 'Not Taxable';
                return false; // stop iterating thru categories list if found status
            }
            if (taxableStatus.startsWith('Taxable') && !(txLotInfo.startsWith('Sold'))) {
                data[rowIdx][16] = data[rowIdx][4]; // copy tx's Date & Time into Acquired Date
                data[rowIdx][17] = 'Taxable';
                data[rowIdx][19] = data[rowIdx][9]; // copy tx inflow value into Gain(Loss)
                return false; // stop iterating thru categories list if found taxable status
            }
            return true;
        });
    });
}

function getTxCategoryData(): string[][] {
    const categoriesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories');
    let txCategoryRows: string[][] = [];
    if (categoriesSheet !== null) {
        txCategoryRows = categoriesSheet.getRange('A2:C35').getDisplayValues();
    }
    return txCategoryRows;
}

/**
 * iterate through the rows in the sheet to determine short-term or long-term gains status for each disposed NFT
 *
 * @return the sheet, for function chaining purposes.
 */
export function calculateNFTGainLossStatus(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        // sanity check the data in the sheet. only proceed if data is good
        Logger.log('Validating the NFT data before starting calculation.');
        const validationErrMsg = validateNFTSheet(sheet);

        if (validationErrMsg === '') {
            const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
            const lastTxInRow = getLastRowWithDataPresent(sheet.getRange('F:F').getDisplayValues());
            const lastTxOutRow = getLastRowWithDataPresent(sheet.getRange('V:V').getDisplayValues());
            const lastRow = lastTxInRow > lastTxOutRow ? lastTxInRow : lastTxOutRow;

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

            // TODO performance fix for this section: calculate arrays for txInStatus and txOutStatus
            // and then call setValues in twice given each array; much more performant operation

            // walk through all rows and fill in Status
            for (let i = 3; i <= lastRow; i++) {
                // Set Status on Tx In
                const acquisitionDateString = sheet.getRange(`F${i}`).getValue() as Date;

                // Check to see if row's Tx In category is Taxable or Not Taxable thing, list that and move on
                const txInCategory = sheet.getRange(`G${i}`).getValue() as string;
                txInCategoryRows.every(categoryRow => {
                    const taxableStatus = (categoryRow?.[0] === txInCategory) ? categoryRow?.[2] : '';
                    if (taxableStatus.startsWith('Not Taxable')) {
                        sheet.getRange(`P${i}`).setValue('Not Taxable');
                        return false; // stop iterating thru categories list if found a taxable/not taxable status
                    }
                    if (taxableStatus.startsWith('Taxable')) {
                        sheet.getRange(`P${i}`).setValue('Taxable');
                        return false; // stop iterating thru categories list if found a taxable/not taxable status
                    }
                    return true; // continue iterating thru categories list looking for a match
                });

                // Set status on Tx Out
                const dispositionValue = sheet.getRange(`V${i}`).getValue() as string;
                if (dispositionValue === '') {
                    sheet.getRange(`AF${i}`).setValue('Unsold');
                } else {
                    const dispositionDate = dispositionValue as unknown as Date;
                    const oneYrAfterAcquisitionDate = datePlusNYears(acquisitionDateString, 1);

                    // Check to see if row's Tx Out category is a Not Taxable thing, if yes set as such and move on
                    const txOutCategory = sheet.getRange(`U${i}`).getValue() as string;
                    let txOutIsTaxable = true;
                    txOutCategoryRows.every(categoryRow => {
                        const taxableStatus = (categoryRow?.[0] === txOutCategory) ? categoryRow?.[2] : '';
                        if (taxableStatus.startsWith('Not Taxable')) {
                            sheet.getRange(`AF${i}`).setValue('Not Taxable');
                            txOutIsTaxable = false;
                            return false; // stop iterating thru categories list if found not taxable status
                        }
                        if (taxableStatus.startsWith('Taxable')) {
                            return false; // stop iterating thru categories list if found taxable status
                        }
                        return true; // continue iterating thru categories list looking for a match
                    });

                    if (txOutIsTaxable) {
                        if ((dispositionDate.getTime() - oneYrAfterAcquisitionDate.getTime()) / MILLIS_PER_DAY > 0) {
                            sheet.getRange(`AF${i}`).setValue('Long-term');
                        } else {
                            sheet.getRange(`AF${i}`).setValue('Short-term');
                        }
                    }
                }
            }

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
        return sheet;
    }
    return null;
}
