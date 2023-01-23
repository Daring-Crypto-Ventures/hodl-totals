/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 */
import getLastRowWithDataPresent from '../last-row';

/* global GoogleAppsScript */

/**
 * Set the formulas that apply for any NFT and fill those down for the whole sheet
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function updateNFTFormulas(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): GoogleAppsScript.Spreadsheet.Sheet | null {
    if ((sheet !== null) && (typeof ScriptApp !== 'undefined')) {
        const txInCostBasisFormulas = ['=SUM(H3, J3, L3)', '=SUM(I3, K3, M3)'];
        const txOutProceedsFormulas = ['=IF(ISNUMBER(V3),IF(ISNUMBER(W3),W3,0)-SUM(Y3,AA3),)', '=IF(ISNUMBER(V3),X3-SUM(Z3,AB3),)', '=IF(ISNUMBER(V3),AD3-O3,)'];

        const lastTxInRow = getLastRowWithDataPresent(sheet.getRange('F:F').getValues() as string[][]);
        const lastTxOutRow = getLastRowWithDataPresent(sheet.getRange('V:V').getValues() as string[][]);
        const lastRow = lastTxInRow > lastTxOutRow ? lastTxInRow : lastTxOutRow;

        // if there's at least one data row present, add the first row of formulas
        if (lastRow > 2) {
            sheet.getRange('N3:O3').setValues([txInCostBasisFormulas]);
            sheet.getRange('AC3:AE3').setValues([txOutProceedsFormulas]);
        }

        // if there are two or more data rows present, fill those formulas down
        if (lastRow > 3) {
            // fill N3:O3 down to the last row that has data in it
            const txInCBFormulaRow = sheet.getRange('N3:O3').getFormulasR1C1();
            const txInCBFormulasToFill = Array(lastRow - 3).fill(txInCBFormulaRow[0]) as string[][];
            sheet.getRange(`N4:O${lastRow}`).setFormulasR1C1(txInCBFormulasToFill);

            // fill AC3:AE3 down to the last row that has data in it
            const txOutProceedsFormulaRow = sheet.getRange('AC3:AE3').getFormulasR1C1();
            const txOutProceedsFormulasToFill = Array(lastRow - 3).fill(txOutProceedsFormulaRow[0]) as string[][];
            sheet.getRange(`AC4:AE${lastRow}`).setFormulasR1C1(txOutProceedsFormulasToFill);
        }
    }
    return null;
}
