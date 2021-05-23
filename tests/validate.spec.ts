// import { expect, test } from '@jest/globals';
// import { strictEqual } from 'qunitjs' (v1.12.0-pre)
import validate from '../src/validate';

// TODO - explore using other Qunit features as seen in GAS testing
// https://script.google.com/home/projects/1cmwYQ6H7k6v3xNoFhhcASR8K2_JBJcgJ2W0WFNE8Sy3fAJzfE2Kpbh_M/edit

/* global strictEqual */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * test1 for validate()
 *
 */
export function test1DataValidation(): () => void {
    return () => {
        const sheet = createTempSheet();
        const initialData: [string, number, number, number, number][] = [
            ['', 0, 0, 0, 0],
            ['', 0, 0, 0, 0],
            ['2017-01-01', 1.0, 1000, 0, 0],
            ['2017-01-02', 1.0, 1000, 0, 0],
            ['2017-01-02', 0, 0, 0.5, 2000],
            ['2017-01-01', 0, 0, 1.0, 2000]];

        if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
            // fill the in the test data
            for (let i = 0; i < initialData.length; i++) {
                sheet.getRange(`A${i + 1}:E${i + 1}`).setValues([initialData[i]]);
            }
            SpreadsheetApp.flush();

            expect(1); // tell QUnit how many times this test ought to run
        }

        const TestRun = function (): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                const result = validate(initialData);
                expect(result).toBeFalsy();
            } else if (sheet !== null) {
                // QUnit unit test
                // TODO - find a way to avoid using as keyword here
                const result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
                // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
                strictEqual(result, false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
            }
        };
        TestRun();

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function validate(sheet)
 */
export function test2DataValidation(): () => void {
    return () => {
        if (typeof ScriptApp === 'undefined') {
            // test data for this test case
            const initialData: [string, number, number, number, number][] = [
                ['', 0, 0, 0, 0],
                ['', 0, 0, 0, 0],
                ['2017-01-01', 1.0, 1000, 0, 0],
                ['2017-01-02', 1.0, 1000, 0, 0],
                ['2017-01-03', 0, 0, 0.5, 2000],
                ['2017-01-04', 0, 0, 2.0, 2000]];

            const TestRun = function (): void {
                const result = validate(initialData);
                expect(result).toBeFalsy();
            };
            TestRun();
        } else {
            // test data for this test case
            const initialData: [string, number, number, number, number][] = [
                ['2017-01-01', 1.0, 1000, 0, 0],
                ['2017-01-02', 1.0, 1000, 0, 0],
                ['2017-01-03', 0, 0, 0.5, 2000],
                ['2017-01-04', 0, 0, 2.0, 2000]];

            // create temp sheet
            const currentdate = new Date();
            const uniqueSheetName = `CB_TEST2(${currentdate.getMonth() + 1}/${
                currentdate.getDate()}/${
                currentdate.getFullYear()}@${
                currentdate.getHours()}:${
                currentdate.getMinutes()}:${
                currentdate.getSeconds()})`;
            const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

            const TestRun = function () {
                // TODO - find a way to avoid using as keyword here
                const result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
                // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
                strictEqual(result, false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
            };

            // fill the in the test data
            for (let i = 0; i < initialData.length; i++) {
                sheet.getRange(`A${i + 3}:E${i + 3}`).setValues([initialData[i]]);
            }

            // run the test
            expect(1);
            TestRun();

            // clean up temp sheet
            SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
        }
    };
}

/**
 * test3 for function validate(sheet)
 */
export function test3DataValidation(): () => void {
    return () => {
        if (typeof ScriptApp === 'undefined') {
            // test data for this test case
            const initialData: [string, number, number, number, number][] = [
                ['', 0, 0, 0, 0],
                ['', 0, 0, 0, 0],
                ['2017-01-01', 1.0, 1000, 0, 0],
                ['2017-01-02', 1.0, 1000, 0.5, 0],
                ['2017-01-03', 0, 0, 0.5, 2000]];

            const TestRun = function (): void {
                const result = validate(initialData);
                expect(result).toBeFalsy();
            };
            TestRun();
        } else {
            // test data for this test case
            const initialData: [string, number, number, number, number][] = [
                ['2017-01-01', 1.0, 1000, 0, 0],
                ['2017-01-02', 1.0, 1000, 0.5, 0],
                ['2017-01-03', 0, 0, 0.5, 2000]];

            // create temp sheet
            const currentdate = new Date();
            const uniqueSheetName = `CB_TEST3(${currentdate.getMonth() + 1}/${
                currentdate.getDate()}/${
                currentdate.getFullYear()}@${
                currentdate.getHours()}:${
                currentdate.getMinutes()}:${
                currentdate.getSeconds()})`;
            const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

            const TestRun = function () {
                // TODO - find a way to avoid using as keyword here
                const result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
                // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
                strictEqual(result, false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
            };

            // fill the in the test data
            for (let i = 0; i < initialData.length; i++) {
                sheet.getRange(`A${i + 3}:E${i + 3}`).setValues([initialData[i]]);
            }
            SpreadsheetApp.flush();

            // run the test
            expect(1);
            TestRun();

            // clean up temp sheet
            SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
        }
    };
}

/**
 * helper function to create temp sheet
 *
 * @return refernece to sheet if running in GAS, null if running locally
 */
function createTempSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
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
function deleteTempSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | null) {
    // only if running in GAS environment, clean up by removing the temp sheet
    if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    }
}
