import calculateFIFO from '../src/calc-fifo';
import getOrderList from '../src/orders';

// requires npm install "@types/google-apps-script": "^1.0.32",
// but cannot leave it installed due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/32585

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * Tests for Cost Basis columns, cacluations, term-splitting and formatting.
 *
 */

function testCostBasisFunctions() {
    // test1DataValidation();
    // test2DataValidation();
    // test3DataValidation();
    test4CostBasis();
    // test5CostBasis();
    // test6CostBasis();
    // test7CostBasis();
    // test8CostBasis();
    // test9CostBasis();
}

/**
 * test1 for function validate(sheet)
 *
function test1DataValidation() {
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
            equal(result, false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
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
} */

/**
 * test2 for function validate(sheet)

function test2DataValidation() {
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
            equal(result, false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
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
} */

/**
 * test3 for function validate(sheet)

function test3DataValidation() {
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
            equal(result, false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
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
} */

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
 * test4 for function calculateFIFO(sheet, lots, sales)
 */
function test4CostBasis() {
    QUnit.test('Cost Basis test4 - Simple Partial Short-Term Sale - Two Rounds', () => {
    // test data for this test case
        const initialData: [string, string, string, number, number, string, number, number, string ][] = [
            ['2017-01-01', '1.0', '1000', 0, 0, '', 0, 0, ''],
            ['2017-01-03', '', '', 0.5, 1000, '', 0, 0, '']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST4(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const data = initialData;
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues().slice(2);

            const lastRow = getLastRowWithDataPresent(dateDisplayValues);
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C3:D').getValues() as [number, number][]);
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E3:F').getValues() as [number, number][]);

            // TODO - lots[i][3] and sales[i][3] need to be incremented by 1 to match up to
            // google sheet cell rows which start numbering at 1, unlike the array which
            // is zero index based
            calculateFIFO(data, lots, sales);
            Logger.log(data);
            // TODO - write a function that flushes data values back to the Sheet

            // output the current date and time as the time last completed
            // var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            // sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //     var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //     sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            equal(sheet.getRange('G3').getValue(), '50% Sold', `Round ${round} Test for Partial Short-Term Sale : Row 3 Status : expected half sold`);
            equal(sheet.getRange('H3').getValue(), '', `Round ${round} Test for Partial Short-Term Sale : Row 3 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I3').getValue(), '', `Round ${round} Test for Partial Short-Term Sale : Row 3 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('E4').getNote(), 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold : expected sold from row 3`);
            equal(sheet.getRange('G4').getValue(), 'Short-term', `Round ${round} Test for Partial Short-Term Sale : Row 4 Status : expected short-term cost basis`);
            equal(sheet.getRange('H4').getValue().toFixed(2), 500.00, `Round ${round} Test for Partial Short-Term Sale : Row 4 Cost Basis : expected 500 cost basis`);
            equal(sheet.getRange('I4').getValue().toFixed(2), 500.00, `Round ${round} Test for Partial Short-Term Sale : Row 4 Gain(Loss) : expected 500 gain`);
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:I${i + 3}`).setValues([initialData[i]]);
        }

        // run the 7 assumption checks twice, to make sure we get same result each time
        expect(14);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
}

/**
 * test5 for function calculateFIFO(sheet, lots, sales)

function test5CostBasis() {
    QUnit.test('Cost Basis test5 - Simple Whole Long-Term Sale - Two Rounds', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', ''],
            ['2018-01-02', '', '', '', '1.0', '2000']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST5(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C:D').getValues());
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E:F').getValues());

            calculateFIFO(sheet, lots, sales);

            // output the current date and time as the time last completed
            var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //    sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            equal(sheet.getRange('G3').getValue(), '100% Sold', `Round ${round} Test for Whole Long-Term Sale : Row 3 Status : expected all coin sold`);
            equal(sheet.getRange('H3').getValue(), '', `Round ${round} Test for Whole Long-Term Sale : Row 3 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I3').getValue(), '', `Round ${round} Test for Whole Long-Term Sale : Row 3 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('E4').getNote(), 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold : expected sold from row 3`);
            equal(sheet.getRange('G4').getValue(), 'Long-term', `Round ${round} Test for Whole Long-Term Sale : Row 4 Status : expected long-term cost basis`);
            equal(sheet.getRange('H4').getValue().toFixed(2), 1000.00, `Round ${round} Test for Whole Long-Term Sale : Row 4 Cost Basis : expected 1000 cost basis`);
            equal(sheet.getRange('I4').getValue().toFixed(2), 1000.00, `Round ${round} Test for Whole Long-Term Sale : Row 4 Gain(Loss) : expected 1000 gain`);
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the 7 assumption checks twice, to make sure we get same result each time
        expect(14);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
} */

/**
 * test6 for function calculateFIFO(sheet, lots, sales)

function test6CostBasis() {
    QUnit.test('Cost Basis test6 - Simple Term Split - Two Rounds', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', ''],
            ['2018-01-01', '', '1.0', '1000', '', ''],
            ['2018-07-01', '', '', '', '2.0', '4000']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST6(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C:D').getValues());
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E:F').getValues());

            calculateFIFO(sheet, lots, sales);

            // output the current date and time as the time last completed
            var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //    sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            equal(sheet.getRange('G3').getValue(), '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            equal(sheet.getRange('H3').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I3').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('G4').getValue(), '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            equal(sheet.getRange('H4').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I4').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);
*/
//            equal(sheet.getRange('A5').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 2.00000000 CB_TEST6 was sold for $4000.00 and split into rows 5 and 6.', `Round ${round} Test for Term Split Note : Row 5 Date : expected split into rows 5 and 6`);
//            equal(sheet.getRange('E5').getNote(), 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
//            equal(sheet.getRange('G5').getValue(), 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 5 Status : expected long-term cost basis`);
//            equal(sheet.getRange('H5').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`);
//            equal(sheet.getRange('I5').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`);

//            equal(sheet.getRange('A6').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 2.00000000 CB_TEST6 was sold for $4000.00 and split into rows 5 and 6.', `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 5 and 6`);
//            equal(sheet.getRange('E6').getNote(), 'Sold lot from row 4 on 2018-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 4`);
//            equal(sheet.getRange('G6').getValue(), 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 6 Status : expected short-term cost basis`);
//            equal(sheet.getRange('H6').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Short-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`);
//            equal(sheet.getRange('I6').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Short-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`);
//        };
/*
        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the 16 assumption checks twice, as there are two code paths to test when a row split is involved
        expect(32);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
} */

/**
 * test7 for function calculateFIFO(sheet, lots, sales)

function test7CostBasis() {
    QUnit.test('Cost Basis test7 - No Sale - Two Rounds', () => {
    // test data for this test case
        const initialData = [['2017-01-01', '', '1.0', '1000', '', '']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST7(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C:D').getValues());
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E:F').getValues());

            calculateFIFO(sheet, lots, sales);

            // output the current date and time as the time last completed
            var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //    sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            equal(sheet.getRange('G3').getValue(), '0% Sold', `Round ${round} Test for No Sale : Row 3 Status : expected no coin sold`);
            equal(sheet.getRange('H3').getValue(), '', `Round ${round} Test for No Sale : Row 3 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I3').getValue(), '', `Round ${round} Test for No Sale : Row 3 Gain(Loss) : expected no gain`);
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the 3 assumption checks twice, to make sure we get same result each time
        expect(6);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
} */

/**
 * test8 for function calculateFIFO(sheet, lots, sales)

function test8CostBasis() {
    QUnit.test('Cost Basis test8 - Example Dataset - Two Rounds', initialData => {
    // test data for this test case
        var initialData = [['2017-01-01', '', '0.2', '2000', '', ''],
            ['2018-02-01', '', '0.6', '6000', '', ''],
            ['2018-02-01', '', '', '', '0.1', '2000'],
            ['2018-03-01', '', '', '', '0.4', '8000'],
            ['2018-03-02', '', '0.4', '4000', '', ''],
            ['2018-03-03', '', '0.8', '8000', '', ''],
            ['2018-03-04', '', '0.6', '6000', '', ''],
            ['2018-03-05', '', '', '', '0.1', '500'],
            ['2018-03-06', '', '', '', '0.1', '1000'],
            ['2018-03-07', '', '', '', '0.1', '2000']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST8(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C:D').getValues());
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E:F').getValues());

            calculateFIFO(sheet, lots, sales);

            // output the current date and time as the time last completed
            var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //    sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            equal(sheet.getRange('G3').getValue(), '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            equal(sheet.getRange('H3').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I3').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('G4').getValue(), '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            equal(sheet.getRange('H4').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I4').getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);

            equal(sheet.getRange('E5').getNote(), 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
            equal(sheet.getRange('G5').getValue(), 'Long-term', `Round ${round} Test for Long-Term Sale : Row 5 Status : expected long-term cost basis`);
            equal(sheet.getRange('H5').getValue().toFixed(2), 1000.00, `Round ${round} Test for Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`);
            equal(sheet.getRange('I5').getValue().toFixed(2), 1000.00, `Round ${round} Test for Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`);
*/
//            equal(sheet.getRange('A6').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 0.40000000 CB_TEST8 was sold for $8000.00 and split into rows 6 and 7.', `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 6 and 7`);
//            equal(sheet.getRange('E6').getNote(), 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 3`);
//            equal(sheet.getRange('G6').getValue(), 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 6 Status : expected long-term cost basis`);
//            equal(sheet.getRange('H6').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Long-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`);
//            equal(sheet.getRange('I6').getValue().toFixed(2), 1000.00, `Round ${round} Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`);

//            equal(sheet.getRange('A7').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 0.40000000 CB_TEST8 was sold for $8000.00 and split into rows 6 and 7.', `Round ${round} Test for Term Split Note : Row 7 Date : expected split into rows 6 and 7`);
//            equal(sheet.getRange('E7').getNote(), 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 7 Sold : expected sold from row 4`);
//            equal(sheet.getRange('G7').getValue(), 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 7 Status : expected short-term cost basis`);
//            equal(sheet.getRange('H7').getValue().toFixed(2), 3000.00, `Round ${round} Test for Split into Short-Term Sale : Row 7 Cost Basis : expected 3000 cost basis`);
//            equal(sheet.getRange('I7').getValue().toFixed(2), 3000.00, `Round ${round} Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected 3000 gain`);
/*
            equal(sheet.getRange('G8').getValue(), '0% Sold', `Round ${round} Test for First Unsold Lot : Row 8 Status : expected 0% sold`);
            equal(sheet.getRange('H8').getValue(), '', `Round ${round} Test for First Unsold Lot : Row 8 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I8').getValue(), '', `Round ${round} Test for First Unsold Lot : Row 8 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('G9').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Status : expected no message`);
            equal(sheet.getRange('H9').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I9').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Gain(Loss) : expected no gain`);
            equal(sheet.getRange('G10').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Status : expected no message`);
            equal(sheet.getRange('H10').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Cost Basis : expected no cost basis`);
            equal(sheet.getRange('I10').getValue(), '', `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Gain(Loss) : expected no gain`);

            equal(sheet.getRange('E11').getNote(), 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 11 Sold : expected sold from row 4`);
            equal(sheet.getRange('G11').getValue(), 'Short-term', `Round ${round} Test for Short-Term Sale : Row 11 Status : expected short-term cost basis`);
            equal(sheet.getRange('H11').getValue().toFixed(2), 1000.00, `Round ${round} Test for Short-Term Sale : Row 11 Cost Basis : expected 1000 cost basis`);
            equal(sheet.getRange('I11').getValue().toFixed(2), -500.00, `Round ${round} Test for Short-Term Sale : Row 11 Gain(Loss) : expected 500 loss`);

            equal(sheet.getRange('E12').getNote(), 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 12 Sold : expected sold from row 4`);
            equal(sheet.getRange('G12').getValue(), 'Short-term', `Round ${round} Test for Short-Term Sale : Row 12 Status : expected short-term cost basis`);
            equal(sheet.getRange('H12').getValue().toFixed(2), 1000.00, `Round ${round} Test for Short-Term Sale : Row 12 Cost Basis : expected 1000 cost basis`);
            equal(sheet.getRange('I12').getValue().toFixed(2), 0.00, `Round ${round} Test for Short-Term Sale : Row 12 Gain(Loss) : expected 0 gain`);

            equal(sheet.getRange('E13').getNote(), 'Sold lots from row 4 on 2018-02-01 to row 8 on 2018-03-02.', `Round ${round} Test for Lot Sold Hint : Row 13 Sold : expected sold from row 4 to 8`);
            equal(sheet.getRange('G13').getValue(), 'Short-term', `Round ${round} Test for Short-Term Sale : Row 13 Status : expected short-term cost basis`);
            equal(sheet.getRange('H13').getValue().toFixed(2), 1000.00, `Round ${round} Test for Short-Term Sale : Row 13 Cost Basis : expected 1000 cost basis`);
            equal(sheet.getRange('I13').getValue().toFixed(2), 1000.00, `Round ${round} Test for Short-Term Sale : Row 13 Gain(Loss) : expected 1000 gain`);
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the 41 assumption checks twice, as there are two code paths to test when a row split is involved
        expect(82);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
} */

/**
 * test9 for function calculateFIFO(sheet, lots, sales)

function test9CostBasis() {
    QUnit.test('Cost Basis test9 - Real Data with Term Split - Two Rounds', () => {
    // test data for this test case
        const initialData = [['2019-02-14', '', '201.89592700', '25.30', '', ''],
            ['2019-03-13', '', '104.50000000', '20.25', '', ''],
            ['2019-03-13', '', '5.55555600', '1.00', '', ''],
            ['2019-03-13', '', '5.55555600', '1.00', '', ''],
            ['2019-03-13', '', '5.55555600', '1.00', '', ''],
            ['2019-03-13', '', '38.88888900', '7.00', '', ''],
            ['2019-03-30', '', '3.55968800', '1.00', '', ''],
            ['2019-03-30', '', '3.56238300', '1.00', '', ''],
            ['2019-03-30', '', '3.56293500', '1.00', '', ''],
            ['2019-03-30', '', '24.93663400', '6.98', '', ''],
            ['2019-04-09', '', '14.25000000', '4.14', '', ''],
            ['2019-05-09', '', '14.25000000', '4.22', '', ''],
            ['2019-06-10', '', '19.00000000', '6.19', '', ''],
            ['2019-09-08', '', '7.60000000', '1.34', '', ''],
            ['2019-10-09', '', '49.40000000', '10.18', '', ''],
            ['2019-11-08', '', '25.65000000', '6.20', '', ''],
            ['2019-12-07', '', '43.46250000', '8.40', '', ''],
            ['2020-01-07', '', '4.50000000', '0.88', '', ''],
            ['2020-02-01', '', '61.91077800', '13.76', '', ''],
            ['2020-02-09', '', '23.51250000', '6.24', '', ''],
            ['2020-02-09', '', '20.35000000', '5.40', '', ''],
            ['2020-03-06', '', '22.05640000', '5.23', '', ''],
            ['2020-03-09', '', '75.76250000', '14.54', '', ''],
            ['2020-04-06', '', '24.21220000', '3.73', '', ''],
            ['2020-04-08', '', '25.65000000', '4.23', '', ''],
            ['2020-05-04', '', '', '', '829.14000000', '151.26'],
            ['2020-05-06', '', '16.37960000', '', '', ''],
            ['2020-05-09', '', '26.60000000', '', '', ''],
            ['2020-06-05', '', '6.30000000', '', '', ''],
            ['2020-06-10', '', '37.78054500', '', '', ''],
            ['2020-07-07', '', '5.09400000', '', '', '']];

        // create temp sheet
        const currentdate = new Date();
        const uniqueSheetName = `CB_TEST9(${currentdate.getMonth() + 1}/${
            currentdate.getDate()}/${
            currentdate.getFullYear()}@${
            currentdate.getHours()}:${
            currentdate.getMinutes()}:${
            currentdate.getSeconds()})`;
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

        const TestRun = function (round) {
            // mimic calculateFIFO_()
            // if (validate(sheet)) {
            const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
            const lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());
            const lots = getOrderList(dateDisplayValues, lastRow, sheet.getRange('C:D').getValues());
            const sales = getOrderList(dateDisplayValues, lastRow, sheet.getRange('E:F').getValues());

            calculateFIFO(sheet, lots, sales);

            // output the current date and time as the time last completed
            var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            sheet.getRange('J1').setValue(`Last calculation succeeded ${now}`);
            // } else {
            //    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
            //    sheet.getRange('J1').setValue(`Data validation failed ${now}`);
            // }

            // check if test passed or failed
            for (let j = 3; j < 28; j++) {
                equal(sheet.getRange(`G${j}`).getValue(), '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Status : expected 100% sold`);
                equal(sheet.getRange(`H${j}`).getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Cost Basis : expected no cost basis`);
                equal(sheet.getRange(`I${j}`).getValue(), '', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Gain(Loss) : expected no gain`);
            }
*/
//            equal(sheet.getRange('A28').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 829.14000000 CB_TEST9 was sold for $151.26 and split into rows 28 and 29.', `Round ${round} Test for Term Split Note : Row 28 Date : expected split into rows 28 and 29`);
//            equal(sheet.getRange('E28').getNote(), 'Sold lots from row 3 on 2019-02-14 to row 13 on 2019-04-09.', `Round ${round} Test for Lot Sold Hint : Row 28 Sold : expected sold from row 3 to 13`);
//            equal(sheet.getRange('G28').getValue(), 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 28 Status : expected long-term cost basis`);
//            equal(sheet.getRange('H28').getValue().toFixed(2), 69.67, `Round ${round} Test for Split into Long-Term Sale : Row 28 Cost Basis : expected $69.67 cost basis`);
//            equal(sheet.getRange('I28').getValue().toFixed(2), 5.46, `Round ${round} Test for Split into Long-Term Sale : Row 28 Gain(Loss) : expected $5.46 gain`);

//            equal(sheet.getRange('A29').getNote().replace(/ *\([^)]*\) */g, ' '), 'Originally 829.14000000 CB_TEST9 was sold for $151.26 and split into rows 28 and 29.', `Round ${round} Test for Term Split Note : Row 29 Date : expected split into rows 28 and 29`);
//            equal(sheet.getRange('E29').getNote(), 'Sold lots from row 14 on 2019-05-09 to row 27 on 2020-04-08.', `Round ${round} Test for Lot Sold Hint : Row 29 Sold : expected sold from row 14 to 27`);
//            equal(sheet.getRange('G29').getValue(), 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 29 Status : expected short-term cost basis`);
//            equal(sheet.getRange('H29').getValue().toFixed(2), 90.54, `Round ${round} Test for Split into Short-Term Sale : Row 29 Cost Basis : expected $90.54 cost basis`);
//            equal(sheet.getRange('I29').getValue().toFixed(2), -14.41, `Round ${round} Test for Split into Short-Term Sale : Row 29 Gain(Loss) : expected $(14.41) gain`);
/*
            for (let k = 30; k < 35; k++) {
                equal(sheet.getRange(`G${k}`).getValue(), '', `Round ${round} Test for Unsold Lot : Row ${k} Status : expected no message`);
                equal(sheet.getRange(`H${k}`).getValue(), '', `Round ${round} Test for Unsold Lot : Row ${k} Cost Basis : expected no cost basis`);
                equal(sheet.getRange(`I${k}`).getValue(), '', `Round ${round} Test for Unsold Lot : Row ${k} Gain(Loss) : expected no gain`);
            }
        };

        // fill the in the test data
        for (let i = 0; i < initialData.length; i++) {
            sheet.getRange(`A${i + 3}:F${i + 3}`).setValues([initialData[i]]);
        }

        // run the 100 assumption checks twice, as there are two code paths to test when a row split is involved
        expect(200);
        TestRun(1);
        TestRun(2);

        // clean up temp sheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    });
} */
