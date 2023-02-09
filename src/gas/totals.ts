/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { getCoinFromSheetName, getAdornedCoinFromSheetName, sheetContainsCoinData, sheetContainsNFTData } from './sheet';
import { version } from '../version';

/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* global Utilities */
/* global Browser */

/**
 * A function that deletes, repopulates & formats the Totals page based on the coin sheets that already exist.
 * NOTE: Any sheets that start with "Copy of" or end with space + number will not show up in the totals sheet
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function resetTotalSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        // delete the previous HODL Totals sheet, if any
        let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HODL Totals');
        let prevUserData: [string, string, string, string][] = [['', '', '', '']];
        if (sheet != null) {
            // save off any user entered data before clearing the sheet
            const prevWallets = sheet.getRange('B2:B').getValues().filter(String) as string[][];
            const prevBalances = sheet.getRange('C2:C').getValues() as string[][];
            const prevOnDates = sheet.getRange('E2:E').getValues() as string[][];
            const prevNotes = sheet.getRange('L2:L').getValues() as string[][];
            if ((prevWallets.length > prevBalances.length) || (prevWallets.length > prevOnDates.length) || (prevWallets.length > prevNotes.length)) {
                const msg = Utilities.formatString('User-provided data in HODL Totals not formatted as expected. Aborting to prevent losing user data.');
                Browser.msgBox('', msg, Browser.Buttons.OK);
                return null;
            }
            prevUserData = prevWallets.map((item, index) => {
                return [item?.[0], prevBalances[index]?.[0], prevOnDates[index]?.[0], prevNotes[index]?.[0]] as [string, string, string, string];
            });
            sheet.clear();
            sheet.getFilter()?.remove();
            sheet.getDeveloperMetadata().forEach(x => x.remove());
            sheet.getRange('1:1').getDeveloperMetadata().forEach(x => x.remove());
        } else {
            sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('HODL Totals', 0);
        }

        sheet.addDeveloperMetadata('version', version);

        // Initial set of categories provided out of the box
        const header = ['       #       ', '      All Wallets & Accounts      ', '     Balance     ', '=CONCATENATE(COUNTIF(F2:F, ">0")," Coins")', '       on Date       ', '   Coin Total Reported   ',
            '      ↩ Sheet     ', '   Recorded Holdings   ', '       Off By       ', '    Last Calculation    ', '     Calc Status     ', '        Notes        '];
        sheet.getRange('A1:L1').setValues([header]).setFontWeight('bold').setHorizontalAlignment('center');
        sheet.getRange('A1:L1').setBackground('#DDDDEE');
        sheet.setFrozenRows(1);

        // walk through all sheets in workbook to pick out the coin names & links
        const allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
        const ssUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
        const excludedSheetNames = ['HODL Totals', 'Categories', 'NFT Categories'];
        let rowCount = 1;
        for (const coinSheet of allSheets) {
            // Stop iteration execution if the condition is meet.
            const sheetName = coinSheet.getName();
            if ((!excludedSheetNames.includes(sheetName)) && !(/Copy of */g.test(sheetName)) && !(/ * [1234567890]+/g.test(sheetName))) {
                const newCoinName = getCoinFromSheetName(coinSheet);
                const newCoinNameAdorned = getAdornedCoinFromSheetName(coinSheet);
                const newCoinSheetUrl = `${ssUrl}#gid=${coinSheet.getSheetId()}`;

                if (sheetContainsCoinData(coinSheet)) {
                    // pull out wallet names from each coins sheet, if they exist
                    const walletData: string[][] = coinSheet.getRange('B3:B').getValues().filter(String) as string[][];
                    const uniqueWallets: string[] = [];
                    walletData.forEach(wallet => {
                        if (!uniqueWallets.includes(wallet[0])) {
                            uniqueWallets.push(wallet[0]);
                        }
                    });

                    if (uniqueWallets.length === 0) {
                        uniqueWallets.push('Wallets/Accounts Not Set');
                    }

                    rowCount += 1;
                    const data = [`${rowCount - 1}`, `${uniqueWallets?.[0]} (${newCoinName})`, '', newCoinNameAdorned, '', `=SUMIF($D$2:$D,$D${rowCount},$C$2:$C)`, `=HYPERLINK("${newCoinSheetUrl}","${newCoinName}")`,
                        `=SUM(INDIRECT("'"&$D${rowCount}&"'!$G$3:G"))`, `=$H${rowCount}-$F${rowCount}`, `=INDIRECT("'"&$D${rowCount}&"'!$S$1")`, `=INDIRECT("'"&$D${rowCount}&"'!$T$1")`, ''];
                    sheet.appendRow(data);

                    // Account for secondary wallets/accounts for a given coin
                    if (uniqueWallets.length > 1) {
                        // skip past the one we've already dealt with
                        uniqueWallets.shift();

                        // insert mostly empty rows to account for the other detected uniqueWallets holding that same coin
                        uniqueWallets.forEach((wallet, index) => { // eslint-disable-line @typescript-eslint/no-loop-func
                            const walletOnlydata = [`${rowCount + index}`, `${wallet} (${newCoinName})`, '', newCoinName, '', '', '', '', '', '', '', ''];
                            sheet?.appendRow(walletOnlydata);
                        });

                        // merge across for the mostly empty rows, also prevents conditional formatting from being applied on these rows
                        sheet.getRange(rowCount + 1, 6, uniqueWallets.length, 6).mergeAcross();

                        // update the rowcount for any secondary wallets added
                        rowCount += uniqueWallets.length;
                    }
                } else if (sheetContainsNFTData(coinSheet)) {
                    rowCount += 1;
                    const data = [`${rowCount - 1}`, `${newCoinName}`, '', newCoinNameAdorned, '', '', `=HYPERLINK("${newCoinSheetUrl}","${newCoinName}")`,
                        `=INDIRECT("'"&$D${rowCount}&"'!$C$1")`, `=LEFT($H${rowCount})-LEFT($C${rowCount})`, `=INDIRECT("'"&$D${rowCount}&"'!$AE$1")`, `=INDIRECT("'"&$D${rowCount}&"'!$AF$1")`, ''];
                    sheet.appendRow(data);
                }
            }
        }

        // calculate a list of the wallets currently in the sheet to use for comparison
        const walletList: string[][] = sheet?.getRange('B2:B').getValues().filter(String) as string[][];
        const flatWalletList = ([] as string[]).concat(...walletList);

        // restore user entered data to the correct row if it still exists
        prevUserData?.forEach(entry => {
            const prevWalletName = entry[0]; // prevUserData[index][0] is Unique Wallet Name and goes into B2:B
            const prevBalance = entry[1]; // prevUserData[index][1] is the Balance and goes into C2:C
            const prevOnDate = entry[2]; // prevUserData[index][2] is the Last Balance Date and goes into E2:E
            const prevNotes = entry[3]; // prevUserData[index][3] is the User Notes that go into L2:L

            // search for match of prevWallet in the sheet
            const foundRowIdx = flatWalletList.indexOf(prevWalletName);
            if (foundRowIdx === -1) {
                // restore the the wallet, balance, on date and user data to the last row of the sheet
                const unmatchedUserdata = ['UNTRACKED', prevWalletName, prevBalance, '', prevOnDate, '', '', '', '', '', '', prevNotes];
                sheet?.appendRow(unmatchedUserdata);
            } else {
                // restore balance, on date and user data to that matching row
                sheet?.getRange(`C${foundRowIdx + 2}`).setValue(prevBalance);
                sheet?.getRange(`E${foundRowIdx + 2}`).setValue(prevOnDate);
                sheet?.getRange(`L${foundRowIdx + 2}`).setValue(prevNotes);
            }
        });

        if (rowCount > 1) {
            // format all populated coin rows
            sheet.getRange(`E2:E${rowCount}`).setNumberFormat('yyyy-mm-dd');
            sheet.getRange(`J2:J${rowCount}`).setNumberFormat('yyyy-mm-dd h:mm:ss').setHorizontalAlignment('right');

            // create filter around all populated coin rows
            sheet.getRange(`A1:L${rowCount}`).createFilter();
        }

        // apply other formatting to the filled columns
        sheet.getRange('A2:A').setBackground('#EEEEEE');
        sheet.getRange('A2:A').setHorizontalAlignment('center');
        sheet.getRange('C2:C').setHorizontalAlignment('right');
        sheet.getRange('D2:D').setBackground('#EEEEEE');
        sheet.getRange('F2:K').setBackground('#EEEEEE');
        sheet.getRange('F2:F').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null);
        sheet.getRange('H2:I').setNumberFormat('+0.00000000;-0.00000000;0.00000000').setFontColor(null).setFontStyle(null)
            .setHorizontalAlignment('right');

        // autosize the columns' widths, add conditional formatting
        sheet.autoResizeColumns(1, 12);
        if (rowCount > 1) {
            setTotalsSheetCFRules(sheet, rowCount - 1);
        }
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
    const offByRange = sheet.getRange(`I2:I${rowCount}`);
    // and Color the success/failure cell to indicate health of the last calculation
    const calcStatusRange = sheet.getRange(`K2:K${rowCount}`);

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
