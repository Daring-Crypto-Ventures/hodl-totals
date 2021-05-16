// TODO - explore using other Qunit features as seen in GAS testing
// https://script.google.com/home/projects/1cmwYQ6H7k6v3xNoFhhcASR8K2_JBJcgJ2W0WFNE8Sy3fAJzfE2Kpbh_M/edit

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
 * Algo described here:
 * https://yagisanatode.com/2019/05/11/google-apps-script-get-the-last-row-of-a-data-range-
 * when-other-columns-have-content-like-hidden-formulas-and-check-boxes/
 *
 * Gets the last row number based on a selected column range values
 *
 * @param {array} range : takes a 2d array of a single column's values
 * @returns {number} : the last row number with a value.
 *
 */
function getLastRowWithDataPresent(range) {
    let rowNum = 0;
    let blank = false;
    for (let row = 0; row < range.length; row++) {
        if (range[row][0] === '' && !blank) {
            rowNum = row;
            blank = true;
        } else if (range[row][0] !== '') {
            blank = false;
        }
    }
    return rowNum;
}

/**
 *
 *
 */
function validate(sheet) {
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

    return true;
}

/**
 * test1 for function validate(sheet)
 *
 */
function test1DataValidation() {
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.QUnit.test('Cost Basis test1 - Data Validation - Date Out of Order', assert => {
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
            assert.strictEqual(result, false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }
        SpreadsheetApp.flush();

        // run the test
        assert.expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}

/**
 * test2 for function validate(sheet)
 */
function test2DataValidation() {
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.QUnit.test('Cost Basis test2 - Data Validation - Coin Oversold', assert => {
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
            assert.strictEqual(result, false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the test
        assert.expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}

/**
 * test3 for function validate(sheet)
 */
function test3DataValidation() {
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.QUnit.test('Cost Basis test3 - Data Validation - Buy and Sell on Same Line', assert => {
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
            assert.strictEqual(result, false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }
        SpreadsheetApp.flush();

        // run the test
        assert.expect(1);
        TestRun();

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}
