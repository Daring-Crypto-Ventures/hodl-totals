import validate from './validate';

/**
 * jest unit tests
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
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
