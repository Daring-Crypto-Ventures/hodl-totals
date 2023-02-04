import { LooselyTypedDataValidationRow } from './types';
import getLastRowWithDataPresent from './last-row';
import { dateFromString } from './calc-fifo';

/**
 * Spreadsheet satisifes some specific data validation rules which are PREREQs for FIFO calculation
 *
 * @param dateToLotAndSaleValues subset of columns to validate that include a 2 row header
 * @return empty string if sheet validated successfully, non-empty string describing the validation error if validation failed
 */
export default function validate(dateToLotAndSaleValues: LooselyTypedDataValidationRow[]): string {
    const lastRow = getLastRowWithDataPresent(dateToLotAndSaleValues as string[][]);
    let coinCheck = 0;

    // ensure dates are valid and listed in chronological order sorted from past to present
    const now = new Date();
    const oldestPossibleDate = new Date(2009, 0, 3); // date of the bitcoin genesis block (month is 0-based in js)
    let lastDate: Date;
    if (dateToLotAndSaleValues[2][0] instanceof Date) {
        lastDate = dateToLotAndSaleValues[2][0];
    } else {
        lastDate = dateFromString(dateToLotAndSaleValues[2][0]);
    }

    for (let row = 2; row < lastRow; row++) {
        let date: Date;
        if (dateToLotAndSaleValues[row][0] instanceof Date) {
            date = dateToLotAndSaleValues[row][0] as Date;
        } else {
            date = dateFromString(dateToLotAndSaleValues[row][0] as string);
        }
        if ((date.getTime() < oldestPossibleDate.getTime()) || (date.getTime() > now.getTime())) {
            return `Data Validation Error: Date is too old or too new on row ${row + 1}.`;
        }
        if (date.getTime() >= lastDate.getTime()) {
            lastDate = date;
        } else {
            return `Data Validation Error: Date out of order in row ${row + 1}.`;
        }
    }

    // Iterate thru the rows to ensure there are enough inflows to support the outflows
    // and that there is no extra data in the row that doesn't belong
    for (let row = 2; row < lastRow; row++) {
        const netChange = Number(dateToLotAndSaleValues[row][2]);
        const acquired = Number(dateToLotAndSaleValues[row][4]);
        const acquiredValue = Number(dateToLotAndSaleValues[row][5]);
        const disposed = Number(dateToLotAndSaleValues[row][6]);
        const disposedValue = Number(dateToLotAndSaleValues[row][7]);

        if (((acquired > 0) && (disposed !== 0 || disposedValue !== 0)) || ((disposed > 0) && (acquired !== 0 || acquiredValue !== 0))) {
            return `Data Validation Error: Invalid data in row ${row + 1}. Cannot list coin inflows and outflows on the same line.`;
        }

        if ((acquired > 0) || (disposed > 0)) {
            if ((acquired > 0) && (netChange !== acquired)) {
                return `Data Validation Error: Reported net change ${netChange} does not match inflow of ${acquired} coin(s) on row ${row + 1}.\\n`;
            }
            if ((disposed > 0) && (netChange !== -disposed)) {
                return `Data Validation Error: Reported net change ${netChange} does not match outflow of ${disposed} coin(s) on row ${row + 1}.\\n`;
            }
            if ((coinCheck - disposed) < 0) {
                return `Data Validation Error: Not enough coin inflows to support your coin outflow on row ${row + 1}.\\n`
                    + `Current coin total is ${coinCheck} but reported outflow is ${disposed} coin(s).\\n`
                    + 'Ensure that you have recorded all of your coin inflows and outflows accurately.';
            }
            coinCheck += acquired - disposed;
        }
    }

    return ''; // no error message
}
