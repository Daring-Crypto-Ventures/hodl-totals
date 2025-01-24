// import { expect, test } from '@jest/globals';
// import { strictEqual } from 'qunitjs' (v1.12.0-pre)

/* global strictEqual */
/* global GoogleAppsScript */
/* global SpreadsheetApp */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable jest/no-export */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/no-conditional-expect */

/**
 * types used when writing HODL Totals unit tests
 *
 */
export type UnitTestWrapper = () => void;

/**
 * wrapper for asserting a value that works in both jest and QUnit test environments
 *
 */
export function assert(value: boolean | number | string, expected: boolean | number | string, detail = ''): void {
    if (typeof ScriptApp === 'undefined') {
        // jest unit test
        it(detail, () => {
            expect(value).toBe(expected);
        });
    } else {
        // QUnit unit test
        strictEqual(value, expected, detail);
    }
}

/**
 * wrapper for asserting a value that could come from either sheet or data table
 *
 */
export function assertCell(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
    dataTable: string[][],
    rowIdx: number,
    colIdx: number,
    expected: boolean | number | string,
    detail = '',
    digitsAfterDecimal = 0
): void {
    if (typeof ScriptApp === 'undefined') {
        // jest unit test
        it(detail, () => {
            if (digitsAfterDecimal !== 0) {
                expect(Number(dataTable[rowIdx][colIdx]).toFixed(digitsAfterDecimal)).toBe(expected);
            } else {
                expect(dataTable[rowIdx][colIdx]).toBe(expected);
            }
        });
    } else if (sheet !== null) {
        // QUnit unit test
        if (digitsAfterDecimal !== 0) {
            strictEqual(Number(sheet.getRange(rowIdx + 1, colIdx + 1).getValue()).toFixed(digitsAfterDecimal), expected, detail);
        } else {
            strictEqual(sheet.getRange(rowIdx + 1, colIdx + 1).getDisplayValue(), expected, detail);
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
