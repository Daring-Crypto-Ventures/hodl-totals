// import { expect, test } from '@jest/globals';
// import { strictEqual } from 'qunitjs' (v1.12.0-pre)

// TODO - explore using other Qunit features as seen in GAS testing
// https://script.google.com/home/projects/1cmwYQ6H7k6v3xNoFhhcASR8K2_JBJcgJ2W0WFNE8Sy3fAJzfE2Kpbh_M/edit

/* global strictEqual */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * wrapper for asserting a value that works in any test environment
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
 * helper function to create temp sheet
 *
 * @return refernece to sheet if running in GAS, null if running locally
 */
export function createTempSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // only if running in GAS environment, create a temp sheet
    if (typeof ScriptApp !== 'undefined') {
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST1(${currentdate.getMonth() + 1}/${
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
