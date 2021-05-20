import { expect, test } from '@jest/globals';
import validate from './validate';

/**
 *  unit test1
 *
 */
test('Cost Basis test1 - Data Validation - Date Out of Order', () => {
    if (typeof ScriptApp === 'undefined') {
        // test data for this test case
        const initialData: [string, number, number, number, number][] = [
            ['', 0, 0, 0, 0],
            ['', 0, 0, 0, 0],
            ['2017-01-01', 1.0, 1000, 0, 0],
            ['2017-01-02', 1.0, 1000, 0, 0],
            ['2017-01-02', 0, 0, 0.5, 2000],
            ['2017-01-01', 0, 0, 1.0, 2000]];

        const TestRun = function (): void {
            const result = validate(initialData);
            expect(result).toBeFalsy();
        };
        TestRun();
    }
});

/**
 *  unit test2
 *
 */
test('Cost Basis test2 - Data Validation - Coin Oversold', () => {
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
    }
});

/**
 *  unit test3
 *
 */
test('Cost Basis test3 - Data Validation - Buy and Sell on Same Line', () => {
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
    }
});
