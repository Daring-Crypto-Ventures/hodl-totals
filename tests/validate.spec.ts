import { assert, createTempSheet, deleteTempSheet } from './test-utils';
import validate from '../src/validate';

/**
 * test1 for validate()
 *
 */
export function test1DataValidation(): () => void {
    return (): void => {
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
            let result;
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                // TODO - find a way to avoid using as keyword here
                result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
            }
            assert(result, false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
        };
        TestRun();

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function validate(sheet)
 */
export function test2DataValidation(): () => void {
    return (): void => {
        const sheet = createTempSheet();
        const initialData: [string, number, number, number, number][] = [
            ['', 0, 0, 0, 0],
            ['', 0, 0, 0, 0],
            ['2017-01-01', 1.0, 1000, 0, 0],
            ['2017-01-02', 1.0, 1000, 0, 0],
            ['2017-01-03', 0, 0, 0.5, 2000],
            ['2017-01-04', 0, 0, 2.0, 2000]];

        if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
            // fill the in the test data
            for (let i = 0; i < initialData.length; i++) {
                sheet.getRange(`A${i + 1}:E${i + 1}`).setValues([initialData[i]]);
            }

            SpreadsheetApp.flush();
            expect(1); // tell QUnit how many times this test ought to run
        }

        const TestRun = function (): void {
            let result;
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                // TODO - find a way to avoid using as keyword here
                result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
            }
            assert(result, false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
        };
        TestRun();

        deleteTempSheet(sheet);
    };
}

/**
 * test3 for function validate(sheet)
 */
export function test3DataValidation(): () => void {
    return (): void => {
        const sheet = createTempSheet();
        const initialData: [string, number, number, number, number][] = [
            ['', 0, 0, 0, 0],
            ['', 0, 0, 0, 0],
            ['2017-01-01', 1.0, 1000, 0, 0],
            ['2017-01-02', 1.0, 1000, 0.5, 0],
            ['2017-01-03', 0, 0, 0.5, 2000]];

        if ((typeof ScriptApp !== 'undefined') && (sheet !== null)) {
            // fill the in the test data
            for (let i = 0; i < initialData.length; i++) {
                sheet.getRange(`A${i + 1}:E${i + 1}`).setValues([initialData[i]]);
            }

            SpreadsheetApp.flush();
            expect(1); // tell QUnit how many times this test ought to run
        }

        const TestRun = function (): void {
            let result;
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                // TODO - find a way to avoid using as keyword here
                result = validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]);
            }
            assert(result, false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
        };
        TestRun();

        deleteTempSheet(sheet);
    };
}
