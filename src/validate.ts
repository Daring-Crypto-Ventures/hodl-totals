import getLastRowWithDataPresent from './last-row';

/**
 * Spreadsheet satisifes some specific data validation rules which are PREREQs for FIFO calculation
 *
 * @param dateLotAndSaleValues data from Google Sheet to validate, rows are 1-based and include space for 2 row header
 * @return empty string if sheet validated successfully, non-empty string describing the validation error if validation failed
 */
export default function validate(dateLotAndSaleValues: [string, string | number, string | number, string | number, string | number][]): string {
    let lastDate;
    let coinCheck;
    lastDate = 0;
    coinCheck = 0;
    // TODO - find a way to avoid using as keyword here
    const lastRow = getLastRowWithDataPresent(dateLotAndSaleValues as string[][]);

    // ensure dates are in chronological order sorted from past to present
    lastDate = dateLotAndSaleValues[2][0];
    for (let row = 2; row < lastRow; row++) {
        if (dateLotAndSaleValues[row][0] >= lastDate) {
            lastDate = dateLotAndSaleValues[row][0];
        } else {
            return `Data Validation Error: Date out of order in row ${row + 1}.`;
        }
    }

    // Iterate thru the rows to ensure there are enough inflows to support the outflows
    // and that there is no extra data in the row that doesn't belong
    for (let row = 2; row < lastRow; row++) {
        const bought = Number(dateLotAndSaleValues[row][1]);
        const boughtPrice = Number(dateLotAndSaleValues[row][2]);
        const sold = Number(dateLotAndSaleValues[row][3]);
        const soldPrice = Number(dateLotAndSaleValues[row][4]);

        if ((bought > 0) || (sold > 0)) {
            if ((coinCheck - sold) < 0) {
                return `Data Validation Error: There were not enough coin inflows to support your coin outflow on row ${row + 1}.`
                    + 'Ensure that you have recorded all of your coin inflows correctly.';
            }
            coinCheck += bought - sold;
        }

        if (((bought > 0) && (sold !== 0 || soldPrice !== 0)) || ((sold > 0) && (bought !== 0 || boughtPrice !== 0))) {
            return `Data Validation Error: Invalid data in row ${row + 1}. Cannot list coin inflows and outflows on the same line.`;
        }
    }

    return ''; // no error message
}
