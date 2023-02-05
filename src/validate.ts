import { LooselyTypedDataValidationRow } from './types';
import { dateFromString } from './calc-fifo';

/**
 * Spreadsheet satisifes some specific data validation rules which are PREREQs for FIFO calculation
 *
 * @param dateToLotAndSaleValues subset of columns to validate excluding the 2 row header, including only rows with data present
 * @return empty string if sheet validated successfully, non-empty string describing the validation error if validation failed
 */
export default function validate(dateToLotAndSaleValues: LooselyTypedDataValidationRow[], dateNotes?: string[]): string {
    let errMsg = '';

    // inner function to check the date column for a number of key issues:
    // 1) ensure dates are not earlier than any possible crypto tx nor set in the future
    // 2) ensure dates are valid and listed in chronological order sorted from past to present
    // 3) look for previous Split Row events and offer the user a choice on how to proceed
    let latestDate: Date;
    if (dateToLotAndSaleValues[0][0] instanceof Date) {
        latestDate = dateToLotAndSaleValues[0][0];
    } else {
        latestDate = dateFromString(dateToLotAndSaleValues[0][0]);
    }
    function validateDateInRow(row: LooselyTypedDataValidationRow, note: string | undefined, rowIdx: number): string {
        const now = new Date();
        const oldestPossibleDate = new Date(2009, 0, 3); // date of the bitcoin genesis block (month is 0-based in js)
        let date: Date;

        if (row[0] instanceof Date) {
            date = row[0];
        } else {
            date = dateFromString(row[0]);
        }
        if ((date.getTime() < oldestPossibleDate.getTime()) || (date.getTime() > now.getTime())) {
            return `Data Validation Error: Date is too old or too new on row ${rowIdx + 3}.`;
        }
        if (date.getTime() >= latestDate.getTime()) {
            latestDate = date;
        } else {
            return `Data Validation Error: Date out of order in row ${rowIdx + 3}.`;
        }
        if (note?.startsWith('Split')) {
            // TODO prompt the user
            // to ether Proceed (User agrees no edits happened before split), Unsplit the rows and Proceed, or Cancel
            return `TEMPORARY: Detected previous Short-Term, Long-Term split at row ${rowIdx + 3}`;
        }
        return ''; // no error message
    }

    // inner function to keep a running coin total to make sure outflows are valid and there is no extra data on each row
    let runningCoinTotal = 0;
    function validateCoinsInRow(rowData: LooselyTypedDataValidationRow, rowIdx: number): string {
        const netChange = Number(rowData[2]);
        const acquired = Number(rowData[4]);
        const acquiredValue = Number(rowData[5]);
        const disposed = Number(rowData[6]);
        const disposedValue = Number(rowData[7]);

        if (((acquired > 0) && (disposed !== 0 || disposedValue !== 0)) || ((disposed > 0) && (acquired !== 0 || acquiredValue !== 0))) {
            return `Data Validation Error: Invalid data in row ${rowIdx + 3}. Cannot list coin inflows and outflows on the same line.`;
        }

        if ((acquired > 0) || (disposed > 0)) {
            if ((acquired > 0) && (netChange !== acquired)) {
                return `Data Validation Error: Reported net change ${netChange} does not match inflow of ${acquired} coin(s) on row ${rowIdx + 3}.\\n`;
            }
            if ((disposed > 0) && (netChange !== -disposed)) {
                return `Data Validation Error: Reported net change ${netChange} does not match outflow of ${disposed} coin(s) on row ${rowIdx + 3}.\\n`;
            }
            if ((runningCoinTotal - disposed) < 0) {
                return `Data Validation Error: Not enough coin inflows to support your coin outflow on row ${rowIdx + 3}.\\n`
                    + `Current coin total is ${runningCoinTotal} but reported outflow is ${disposed} coin(s).\\n`
                    + 'Ensure that you have recorded all of your coin inflows and outflows accurately.';
            }
            runningCoinTotal += acquired - disposed;
        }
        return ''; // no error message
    }

    // Make the actual pass through the data to call the inner functions and validate the data
    dateToLotAndSaleValues.forEach((dateToLotAndSaleRow, rowIdx) => {
        // if errMsg is ever set, skip further searching for issues
        errMsg = (errMsg === '') ? validateDateInRow(dateToLotAndSaleRow, dateNotes?.[rowIdx], rowIdx) : errMsg;
        errMsg = (errMsg === '') ? validateCoinsInRow(dateToLotAndSaleRow, rowIdx) : errMsg;
    });

    return errMsg;
}
