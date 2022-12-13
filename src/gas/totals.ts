/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { version } from '../version';

/* global GoogleAppsScript */
/* global SpreadsheetApp */

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function resetTotalSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        // delete the previous HODL Totals sheet, if any
        let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HODL Totals')?.clear();
        if (sheet != null) {
            sheet.clear();
            sheet.getFilter()?.remove();
            sheet.getDeveloperMetadata().forEach(x => x.remove());
            sheet.getRange('1:1').getDeveloperMetadata().forEach(x => x.remove());
        } else {
            sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('HODL Totals', 0);
        }

        sheet.addDeveloperMetadata('version', version);

        // Initial set of categories provided out of the box
        const header = ['   Unique Wallet/Account Name   ', '     Balance     ', '       Coin       ', '       on Date       ', '=CONCATENATE(COUNT(E2:E)," Coins")',
            '      ↩ Sheet     ', '   Recorded Holdings   ', '       Off By       ', '    Last Calculation    ', '     Calc Status     ', '    Last Reconciliation    '];
        sheet.getRange('A1:K1').setValues([header]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A1:K1').setBackground('#DDDDEE');

        // walk through all sheets in workbook to pick out the coin names & links
        const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
        const ssUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
        const excludedSheetNames = ['HODL Totals', 'Categories'];
        let rowCount = 1;
        for (const coinSheet of allSheets) {
            // Stop iteration execution if the condition is meet.
            if (!excludedSheetNames.includes(coinSheet.getName())) {
                const newCoinName = coinSheet.getName().replace(/ *\([^)]*\) */g, '');
                const newCoinSheetUrl = `${ssUrl}#gid=${coinSheet.getSheetId()}`;
                rowCount += 1;

                // pull out wallet names from each coins sheet, if they exist
                const walletData: string[][] = coinSheet.getRange('B3:B').getValues() as string[][];
                const uniqueWallets: string[] = [];
                walletData.forEach(wallet => {
                    if (!uniqueWallets.includes(wallet[0])) {
                        uniqueWallets.push(wallet[0]);
                    }
                });

                if (uniqueWallets.length === 0) {
                    uniqueWallets.push('Wallets/Accounts Not Set');
                }

                const data = [`${uniqueWallets?.[0]} (${newCoinName})`, '', newCoinName, '', `=SUMIF($C$${rowCount}:$C,$C${rowCount},$B$${rowCount}:$B)`, `=HYPERLINK("${newCoinSheetUrl}","${newCoinName}")`,
                    `=SUM(INDIRECT("'"&$F${rowCount}&"'!$G$3:G"))`, `=$G${rowCount}-$E${rowCount}`, `=INDIRECT("'"&$C${rowCount}&"'!$S$1")`, `=INDIRECT("'"&$C${rowCount}&"'!$T$1")`, ''];
                sheet.appendRow(data);
                /*
                if (uniqueWallets.length > 1) {
                    // skip past the one we've already dealt with
                    uniqueWallets.shift();

                    // insert mostly empty rows to account for the other detected uniqueWallets holding that same coin
                    uniqueWallets.forEach(wallet => {
                        const walletOnlydata = [`${wallet} (${newCoinName})`, '', newCoinName, '', '', '', '', '', '', '', ''];
                        sheet?.appendRow(walletOnlydata);
                    });
                    rowCount += uniqueWallets.length;
                }
                */
            }
        }

        if (rowCount > 1) {
            // format all populated coin rows
            sheet.getRange(`D2:D${rowCount}`).setNumberFormat('yyyy-mm-dd');
            sheet.getRange(`I2:I${rowCount}`).setNumberFormat('yyyy-mm-dd h:mm:ss').setHorizontalAlignment('right');

            // create filter around all populated coin rows
            sheet.getRange(`A1:K${rowCount}`).createFilter();
        }

        // set calculated columns to be grayed background
        sheet.getRange('E2:J').setBackground('#EEEEEE');

        // autosize the columns' widths, add conditional formatting
        sheet.autoResizeColumns(1, 11);
        setTotalsSheetCFRules(sheet, rowCount);
        SpreadsheetApp.flush();

        return sheet;
    }
    return null;
}

/**
 *
 * @param sheet
 * @param rowCount assumes that rowCount >= 1
 */
function setTotalsSheetCFRules(sheet: GoogleAppsScript.Spreadsheet.Sheet, rowCount: number): void {
    // Color the cell that displays the off by amount
    // to help users see if their sheet totals overall are in a healthy state
    const offByRange = sheet.getRange(`H2:H${rowCount}`);
    // and Color the success/failure cell to indicate health of the last calculation
    const calcStatusRange = sheet.getRange(`J2:J${rowCount}`);

    // extract the conditional rules set on all other cells on this sheet
    const rules = sheet.getConditionalFormatRules();
    const newRules = [] as GoogleAppsScript.Spreadsheet.ConditionalFormatRule [];
    for (const rule of rules) {
        const ruleRange = rule.getRanges()?.[0].getA1Notation();
        if ((ruleRange !== offByRange.getA1Notation()) && (ruleRange !== calcStatusRange.getA1Notation())) {
            newRules.push(rule);
        }
    }
    // add back the rules for the cells we are formatting
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(-0.001, 0.001)
        .setBackground('#B7E1CD') // green success
        .setRanges([offByRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberNotBetween(-0.001, 0.001)
        .setBackground('#FFFF00') // yellow success
        .setRanges([offByRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=1')
        .setBackground('#F4C7C3') // red failure
        .setRanges([offByRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextStartsWith('Succeeded')
        .setBackground('#B7E1CD') // green success
        .setRanges([calcStatusRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextStartsWith('Failed')
        .setBackground('#F4C7C3') // red failure
        .setRanges([calcStatusRange])
        .build());
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=1')
        .setBackground('#F4C7C3') // red failure
        .setRanges([calcStatusRange])
        .build());
    sheet.setConditionalFormatRules(newRules);
}
