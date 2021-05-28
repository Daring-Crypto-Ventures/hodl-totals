// import { expect, test } from '@jest/globals';
// import { strictEqual } from 'qunitjs' (v1.12.0-pre)

// TODO - explore using other Qunit features as seen in GAS testing
// https://script.google.com/home/projects/1cmwYQ6H7k6v3xNoFhhcASR8K2_JBJcgJ2W0WFNE8Sy3fAJzfE2Kpbh_M/edit

/* global strictEqual */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * types used when writing HODL Totals unit tests
 *
 */
export type unitTestWrapper = () => void;

/**
 * wrapper for asserting a value that works in both jest and QUnit test environments
 *
 */
export function assert(value: boolean | number | string, expected: boolean | number | string, detail = ''): void {
    if (typeof ScriptApp === 'undefined') {
        // jest unit test
        test(detail, () => {
            expect(value).toBe(expected);
        });
    } else {
        // QUnit unit test
        // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
        strictEqual(value, expected, detail);
    }
}

/**
 * wrapper for asserting a value that could come from either sheet or data table
 *
 */
export function assertCell(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    dataTable: [string, number, number, number, number, string, number, number, string][],
    rowIdx: number, colIdx: number,
    expected: boolean | number | string,
    detail = '', digitsAfterDecimal = 0
): void {
    if (typeof ScriptApp === 'undefined') {
        // jest unit test
        test(detail, () => {
            if (digitsAfterDecimal !== 0) {
                expect(Number(dataTable[rowIdx][colIdx]).toFixed(digitsAfterDecimal)).toBe(expected);
            } else {
                expect(dataTable[rowIdx][colIdx]).toBe(expected);
            }
        });
    } else if (sheet !== null) {
        // QUnit unit test
        if (digitsAfterDecimal !== 0) {
            // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
            strictEqual(sheet.getRange(rowIdx + 1, colIdx + 1).getValue().toFixed(digitsAfterDecimal), expected, detail);
        } else {
            // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
            strictEqual(sheet.getRange(rowIdx + 1, colIdx + 1).getValue(), expected, detail);
        }
    }
}

/**
 * helper function to create temp sheet
 *
 * @return refernece to sheet if running in GAS, null if running locally
 */
export function createTempSheet(coinName = 'CB_TEST'): GoogleAppsScript.Spreadsheet.Sheet | null {
    // only if running in GAS environment, create a temp sheet
    if (typeof ScriptApp !== 'undefined') {
        const currentdate = new Date();
        const uniqueSheetName = `${coinName}(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        return SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);
    }
    return null;
}

/**
 * helper function to fill data into temp sheet when running in GAS environment
 *
 */
export function fillInTempSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, data: string[][]): void {
    // only if running in GAS environment, fill in columns of temp sheet
    if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
        // fill the in the test data
        // TODO - better/faster use of google APIs to batch set 2D array?
        for (let i = 2; i < data.length; i++) {
            sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
        }
        SpreadsheetApp.flush();
    }
}

/**
 * helper function to create temp sheet when running in GAS environment
 *
 */
export function deleteTempSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null): void {
    // only if running in GAS environment, clean up by removing the temp sheet
    if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    }
}
