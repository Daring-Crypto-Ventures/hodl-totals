import validate from '../src/validate';

// TODO - explore using other Qunit features as seen in GAS testing
// https://script.google.com/home/projects/1cmwYQ6H7k6v3xNoFhhcASR8K2_JBJcgJ2W0WFNE8Sy3fAJzfE2Kpbh_M/edit

/* global QUnit, strictEqual */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * Tests for Cost Basis columns, cacluations, term-splitting and formatting.
 *
 */
export default function testValidationFunctions(): void {
    test1DataValidation();
    test2DataValidation();
    test3DataValidation();
}

/**
 * test1 for function validate(sheet)
 *
 */
function test1DataValidation() {
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('Cost Basis test1 - Data Validation - Date Out of Order', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', ''],
            ['2017-01-02', '', '1.0', '1000', '', ''],
            ['2017-01-02', '', '', '', '0.5', '2000'],
            ['2017-01-01', '', '', '', '1.0', '2000']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST1(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function () {
            const result = validate(sheet);
            // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
            strictEqual(result, false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }
        SpreadsheetApp.flush();

        // run the test
        expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}

/**
 * test2 for function validate(sheet)
 */
function test2DataValidation() {
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('Cost Basis test2 - Data Validation - Coin Oversold', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', ''],
            ['2017-01-02', '', '1.0', '1000', '', ''],
            ['2017-01-03', '', '', '', '0.5', '2000'],
            ['2017-01-04', '', '', '', '2.0', '2000']];

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
            const result = validate(sheet);
            // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
            strictEqual(result, false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the test
        expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}

/**
 * test3 for function validate(sheet)
 */
function test3DataValidation() {
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('Cost Basis test3 - Data Validation - Buy and Sell on Same Line', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', ''],
            ['2017-01-02', '', '1.0', '1000', '0.5', ''],
            ['2017-01-03', '', '', '', '0.5', '2000']];

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
            const result = validate(sheet);
            // @ts-expect-error Cannot find QUnit assertions as no type declarations exist for this library, names are present when loaded in GAS
            strictEqual(result, false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }
        SpreadsheetApp.flush();

        // run the test
        expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}
