import getLastRowWithDataPresent from './last-row';

/**
 * Spreadsheet satisifes some specific data validation rules which are PREREQs for FIFO calculation
 *
 * @param sheet which Google Spreadsheet to validate
 * @return true if sheet validated successfully, false if an error was encountered
 */
export default function validate(sheet: GoogleAppsScript.Spreadsheet.Sheet): boolean {
    if (typeof ScriptApp !== 'undefined') {
        let lastDate;
        let coinCheck;
        lastDate = 0;
        coinCheck = 0;
        const dateLotAndSaleValues = sheet.getRange('A:E').getValues();
        const lastRow = getLastRowWithDataPresent(dateLotAndSaleValues);

        // ensure dates are in chronological order sorted from past to present
        lastDate = dateLotAndSaleValues[2][0];
        for (let row = 2; row < lastRow; row++) {
            if (dateLotAndSaleValues[row][0] >= lastDate) {
                lastDate = dateLotAndSaleValues[row][0];
            } else {
                Browser.msgBox('Data Validation Error', Utilities.formatString(`Date out of order in row ${row + 1}.`), Browser.Buttons.OK);
                return false;
            }
        }

        // Iterate thru the rows to ensure there are enough inflows to support the outflows
        // and that there is no extra data in the row that doesn't belong
        for (let row = 2; row < lastRow; row++) {
            const bought = dateLotAndSaleValues[row][1];
            const boughtPrice = dateLotAndSaleValues[row][2];
            const sold = dateLotAndSaleValues[row][3];
            const soldPrice = dateLotAndSaleValues[row][4];

            if ((bought > 0) || (sold > 0)) {
                if ((coinCheck - sold) < 0) {
                    const msg = Utilities.formatString(
                        `There were not enough coin inflows to support your coin outflow on row ${row + 1}.\\n`
                        + 'Ensure that you have recorded all of your coin inflows correctly.'
                    );
                    Browser.msgBox('Data Validation Error', msg, Browser.Buttons.OK);
                    return false;
                }
                coinCheck += bought - sold;
            }

            if (((bought > 0) && (sold !== 0 || soldPrice !== 0)) || ((sold > 0) && (bought !== 0 || boughtPrice !== 0))) {
                const msg = Utilities.formatString(`Invalid data in row ${row + 1}.\\n`
                    + 'Cannot list coin purchase and coin sale on same line.');
                Browser.msgBox('Data Validation Error', msg, Browser.Buttons.OK);
                return false;
            }
        }
    }
    return true;
}
