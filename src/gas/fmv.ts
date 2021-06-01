/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */

export default function calcFiatValuesFromFMV(sheet: GoogleAppsScript.Spreadsheet.Sheet, lastRow: number): void {
    const purchasedCol = sheet.getRange('C:C').getValues();
    const soldCol = sheet.getRange('E:E').getValues();
    const firstFMVcol = sheet.getRange('K:K').getValues();

    for (let row = 2; row < lastRow; row++) {
        const highValue = firstFMVcol[row][0] || 'value known';

        // if value known don't include formulas to calculate the price from FMV columns
        if (highValue !== 'value known') {
            // calculate fiat price based on other columns
            if (purchasedCol[row][0]) {
                sheet.getRange(`D${row + 1}`).setValue(`=C${row + 1}*M${row + 1}`);
            } else if (soldCol[row][0]) {
                sheet.getRange(`F${row + 1}`).setValue(`=E${row + 1}*M${row + 1}`);
            }

            // unless the price is known, calculate via averaging high/low price for that date
            if (highValue !== 'price known') {
                sheet.getRange(`M${row + 1}`).setValue(`=AVERAGE(K${row + 1},L${row + 1})`);
            } else {
                // copy the price known sentinel value to any cells to the right
                sheet.getRange(`L${row + 1}`).setValue('price known');
            }
        } else {
        // copy the price known sentinel value to any cells to the right
            sheet.getRange(`K${row + 1}`).setValue('value known'); // if was empty, need to fill it in here
            sheet.getRange(`L${row + 1}`).setValue('value known');
            sheet.getRange(`M${row + 1}`).setValue('value known');

            // when marked 'value known', bold the hard-coded FIAT value entered for buy or for sale
            sheet.getRange(`D${row + 1}`).setFontWeight('bold');
            sheet.getRange(`F${row + 1}`).setFontWeight('bold');
        }
    }
}