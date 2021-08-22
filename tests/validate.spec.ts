import { UnitTestWrapper, assert, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { SevenPackDataRow, SevenPackLooselyTypedDataRow } from '../src/types';
import validate from '../src/validate';

/**
 * test1 for validate()
 *
 */
export function test1DataValidation(): UnitTestWrapper {
    return (): void => {
        const coinName = 'VAL_TEST1';
        const sheet = createTempSheet(coinName);
        const initialData: SevenPackDataRow[] = [
            ['', '', '', 0, 0, 0, 0],
            ['', '', '', 0, 0, 0, 0],
            ['2017-01-01', '', '', 1.0, 1000, 0, 0],
            ['2017-01-02', '', '', 1.0, 1000, 0, 0],
            ['2017-01-02', '', '', 0, 0, 0.5, 2000],
            ['2017-01-01', '', '', 0, 0, 1.0, 2000]];

        const testRun = function (): void {
            let result = '';
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                result = validate(sheet.getRange('A:G').getValues() as SevenPackLooselyTypedDataRow[]);
            }
            assert((result === ''), false, 'Test for Date Out of Order Validation : Validation Error : expected validation to fail');
        };

        fillInTempSheet(sheet, initialData as string[][]);
        testRun();

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function validate(sheet)
 */
export function test2DataValidation(): UnitTestWrapper {
    return (): void => {
        const coinName = 'VAL_TEST2';
        const sheet = createTempSheet(coinName);
        const initialData: SevenPackDataRow[] = [
            ['', '', '', 0, 0, 0, 0],
            ['', '', '', 0, 0, 0, 0],
            ['2017-01-01', '', '', 1.0, 1000, 0, 0],
            ['2017-01-02', '', '', 1.0, 1000, 0, 0],
            ['2017-01-03', '', '', 0, 0, 0.5, 2000],
            ['2017-01-04', '', '', 0, 0, 2.0, 2000]];

        const testRun = function (): void {
            let result = '';
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                result = validate(sheet.getRange('A:G').getValues() as SevenPackLooselyTypedDataRow[]);
            }
            assert((result === ''), false, 'Test for Coin Oversold Condition : Validation Error : expected validation to fail');
        };

        fillInTempSheet(sheet, initialData as string[][]);
        testRun();

        deleteTempSheet(sheet);
    };
}

/**
 * test3 for function validate(sheet)
 */
export function test3DataValidation(): UnitTestWrapper {
    return (): void => {
        const coinName = 'VAL_TEST3';
        const sheet = createTempSheet(coinName);
        const initialData: SevenPackDataRow[] = [
            ['', '', '', 0, 0, 0, 0],
            ['', '', '', 0, 0, 0, 0],
            ['2017-01-01', '', '', 1.0, 1000, 0, 0],
            ['2017-01-02', '', '', 1.0, 1000, 0.5, 0],
            ['2017-01-03', '', '', 0, 0, 0.5, 2000]];

        const testRun = function (): void {
            let result = '';
            if (typeof ScriptApp === 'undefined') {
                result = validate(initialData);
            } else if (sheet !== null) {
                // QUnit unit test
                result = validate(sheet.getRange('A:G').getValues() as SevenPackLooselyTypedDataRow[]);
            }
            assert((result === ''), false, 'Test for Buy and Sell on Same Line : Validation Error : expected validation to fail');
        };

        fillInTempSheet(sheet, initialData as string[][]);
        testRun();

        deleteTempSheet(sheet);
    };
}
