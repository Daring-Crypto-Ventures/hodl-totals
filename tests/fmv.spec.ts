import { UnitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { DataValidationRow, CompleteDataRow } from '../src/types';
import { setFMVformulasOnSheet } from '../src/gas/formulas-coin';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * test1 for function setFMVformulasOnSheet()
 */
export function test1FMV(): UnitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST1';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2015-12-01', '', 1, 'Avg Daily Price Variation', 1.00000000, 0, 0, 0, '1.111100', '0.992222', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2016-02-29', '', 1, 'Value Known', 1.00000000, 1, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2016-03-01', '', -1, 'Value Known', 0, 0, 1.00000000, 5, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-02-28', '', 23, 'Price Known', 23.00000000, 0, 0, 0, '', '', '34', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-04-01', '', -2, 'Avg Daily Price Variation', 0, 0, 2.00000000, 0, '2.312002', '1.8222', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-04-02', '', -20, 'Avg Daily Price Variation', 0, 0, 20.00000000, 0, '=0.0003561*7088.25', '=0.0003561*6595.92', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-05-31', '', 26.92, 'Avg Daily Price Variation', 26.92000000, 0, 0, 0, '=0.0069319*9700.34/I9', '=0.0069319*9432.3/I9', '', '', '', '', 0, 0, '']
        ];

        const testRun = function (round: number): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(15, row.length - 15)); // remove rightmost calculation columns and summarized in column
                validationData.forEach(row => row.splice(0, 4)); // remove leftmost Tx ✔, wallets, Tx ID and description columns

                assert((validate(validationData as unknown as DataValidationRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = validationData.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const strategyCol = [...validationData as string[][]];
                strategyCol.forEach((row, rowIdx) => { strategyCol[rowIdx] = [...row]; });
                strategyCol.forEach(row => row.splice(0, 3)); // remove leftmost date, category, net change columns
                strategyCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const acquiredCol = [...validationData as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 4)); // remove leftmost date, category, net change, FMV strategy columns
                acquiredCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const disposedCol = [...validationData as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 6)); // remove leftmost date, category, net change, FMV strategy, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                setFMVformulasOnSheet(null, data, strategyCol, acquiredCol, disposedCol, lastRow);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('E:L').getValues() as DataValidationRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const strategyCol = sheet.getRange('H:H').getValues() as string[][];
                const acquiredCol = sheet.getRange('I:I').getValues() as string[][];
                const disposedCol = sheet.getRange('K:K').getValues() as string[][];
                setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);
                // these assertions aren't checked locally becasue they require cell formula calcs to happen
                assertCell(sheet, data as string[][], 2, 9, '1.05', 'Test for Fiat Cost calculated from FMV data : Row 3 Inflow Value(USD) : expected fiat cost calc from FMV average', 2);
                assertCell(sheet, data as string[][], 2, 14, '1.05', 'Test for FMV average formula inserted : Row 3 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 5, 9, '782.00', 'Test for Fiat Cost with known FMV price : Row 6 Inflow Value(USD) : expected fiat cost calc from known FMV price', 2);
                assertCell(sheet, data as string[][], 6, 11, '4.13', 'Test for Fiat Received calculated from FMV data : Row 7 Outflow Value(USD) : expected fiat received calc from FMV average', 2);
                assertCell(sheet, data as string[][], 6, 14, '2.07', 'Test for FMV average formula inserted : Row 7 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 7, 11, '48.73', 'Test for Fiat Received calculated from FMV data : Row 8 Outflow Value(USD) : expected fiat received calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 7, 14, '2.44', 'Test for FMV average formula inserted : Row 8 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 8, 9, '66.31', 'Test for Fiat Cost calculated from FMV data : Row 9 Inflow Value(USD) : expected fiat cost calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 8, 14, '2.46', 'Test for FMV average formula inserted : Row 9 Price : expected FMV calc averaged from supplied high/low prices', 2);
            }
            assertCell(sheet, data as string[][], 3, 9, '1.00', 'Test for Fiat Cost with no FMV data : Row 4 Fiat Cost : expected user supplied number', 2);
            assertCell(sheet, data as string[][], 4, 11, '5.00', 'Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number', 2);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function setFMVformulasOnSheet(sheet)
 */
export function test2FMV(): UnitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST2';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'Pool mining on BSOD', '2018-10-27', 'Mining', +0.10348353, 'Avg Daily Price Variation', 0.10348353, 0, 0, 0, '2.32', '2.07', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'CryptoBridge traded for 99.8 VRSC @ 0.0000259 BTC-VRSC', '2019-02-15', 'Traded', +99.8, 'Avg Daily Price Variation', 99.8, 0, 0, 0, '=0.0000259*3647.8', '=0.0000259*3608.21', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'Trezor BTC Outgoing Transfer', '2019-06-02', 'Tx Fee', -0.00006253, 'Price Known', 0, 0, 0.00006253, 0, '', '', '8685.27', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'barterly traded 940 ARR for 1200 VRSC, 12.0001 VRSC fee', '2019-06-24', 'Tx Fee', -12.0001, 'Price Known', 0, 0, 12.0001, 0, '', '', '=0.00001916*10838.17', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'binance.com traded for 51.19 KMD for 0.00627589 BTC', '2019-07-08', 'Traded', -51.19, 'Avg Daily Price Variation', 51.19, 0, 0, 0, '=0.00627589/51.19*12345.83', '=0.00627589/51.19*11393.37', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'BTC recieved at Pretentious Party', '2019-10-04', 'Gift Received', +0.00491033, 'Value Known', 0.00491033, 46.02, 0, 0, '', '', '', '', '', '', 0, 0, '']
        ];
        const testRun = function (): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(15, row.length - 15)); // remove rightmost calculation columns and summarized in column
                validationData.forEach(row => row.splice(0, 4)); // remove leftmost Tx ✔, wallets, Tx ID and description columns

                assert((validate(validationData as unknown as DataValidationRow[]) === ''), true, 'Data validated');
                const dateDisplayValues = data.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const strategyCol = [...validationData as string[][]];
                strategyCol.forEach((row, rowIdx) => { strategyCol[rowIdx] = [...row]; });
                strategyCol.forEach(row => row.splice(0, 3)); // remove leftmost date, category, net change columns
                strategyCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const acquiredCol = [...validationData as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 4)); // remove leftmost date, category, net change, FMV strategy columns
                acquiredCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const disposedCol = [...validationData as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 6)); // remove leftmost date, category, net change, FMV strategy, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right

                setFMVformulasOnSheet(null, data, strategyCol, acquiredCol, disposedCol, lastRow);
                assertCell(sheet, data as string[][], 2, 9, '=I3*O3', 'Test Application of Avg Daily Price Var Strategy : Row 3 Inflow Value(USD) : expected J3 -> =I3*O3 -> 0.23');
                assertCell(sheet, data as string[][], 2, 14, '=AVERAGE(M3,N3)', 'Test Application of Avg Daily Price Var Strategy : Row 3 Price : expected O3 -> =AVERAGE(M3,N3) -> 2.195');
                assertCell(sheet, data as string[][], 3, 9, '=I4*O4', 'Test Application of Avg Daily Price Var Strategy : Row 4 Inflow Value(USD) : expected J4 -> =I4*O4 -> 9.38');
                assertCell(sheet, data as string[][], 3, 14, '=AVERAGE(M4,N4)', 'Test Application of Avg Daily Price Var Strategy : Row 4 Price : expected O4 -> =AVERAGE(M4,N4) -> 0.093965');
                assertCell(sheet, data as string[][], 4, 11, '=K5*O5', 'Test Application of Price Known Strategy : Row 5 Outflow Value(USD) : expected L5 -> =K5*O5 -> 0.54');
                assertCell(sheet, data as string[][], 4, 14, '8685.27', 'Test Application of Price Known Strategy : Row 5 Price : expected O5 -> 8685.27', 2);
                assertCell(sheet, data as string[][], 5, 11, '=K6*O6', 'Test Application of Price Known Strategy : Row 6 Outflow Value(USD) : expected L6 -> =K6*O6 -> 2.49');
                assertCell(sheet, data as string[][], 5, 14, '=0.00001916*10838.17', 'Test Application of Price Known Strategy : Row 6 Price : expected O6 -> =0.00001916*10838.17 -> 0.207659');
                assertCell(sheet, data as string[][], 6, 9, '=I7*O7', 'Test Application of Avg Daily Price Var Strategy : Row 7 Inflow Value(USD) : expected J7 -> =I7*O7 -> 74.49');
                assertCell(sheet, data as string[][], 6, 14, '=AVERAGE(M7,N7)', 'Test Application of Avg Daily Price Var Strategy : Row 7 Price : expected O7 -> =AVERAGE(M7,N7) -> 1.455212');
                assertCell(sheet, data as string[][], 7, 9, '46.02', 'Test Application of Value Known Strategy : Row 8 Inflow Value(USD) : expected J8 -> 46.02', 2);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('E:L').getValues() as DataValidationRow[]) === ''), true, 'Data validated');
                const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const strategyCol = sheet.getRange('H:H').getValues() as string[][];
                const acquiredCol = sheet.getRange('I:I').getValues() as string[][];
                const disposedCol = sheet.getRange('K:K').getValues() as string[][];

                setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);
                // these assertions aren't checked locally becasue they require cell formula calcs to happen
                assertCell(sheet, data as string[][], 2, 9, '0.23', 'Test Application of Avg Daily Price Var Strategy : Row 3 Inflow Value(USD) : expected J3 -> =I3*O3 -> 0.23', 2);
                assertCell(sheet, data as string[][], 2, 14, '2.195', 'Test Application of Avg Daily Price Var Strategy : Row 3 Price : expected O3 -> =AVERAGE(M3,N3) -> 2.195', 3);
                assertCell(sheet, data as string[][], 3, 9, '9.38', 'Test Application of Avg Daily Price Var Strategy : Row 4 Inflow Value(USD) : expected J4 -> =I4*O4 -> 9.38', 2);
                assertCell(sheet, data as string[][], 3, 14, '0.093965', 'Test Application of Avg Daily Price Var Strategy : Row 4 Price : expected O4 -> =AVERAGE(M4,N4) -> 0.093965', 6);
                assertCell(sheet, data as string[][], 4, 11, '0.54', 'Test Application of Price Known Strategy : Row 5 Outflow Value(USD) : expected L5 -> =K5*O5 -> 0.54', 2);
                assertCell(sheet, data as string[][], 4, 14, '8685.27', 'Test Application of Price Known Strategy : Row 5 Price : expected O5 -> 8685.27', 2);
                assertCell(sheet, data as string[][], 5, 11, '2.49', 'Test Application of Price Known Strategy : Row 6 Outflow Value(USD) : expected L6 -> =K6*O6 -> 2.49', 2);
                assertCell(sheet, data as string[][], 5, 14, '0.207659', 'Test Application of Price Known Strategy : Row 6 Price : expected O6 -> =0.00001916*10838.17 -> 0.207659', 6);
                assertCell(sheet, data as string[][], 6, 9, '74.49', 'Test Application of Avg Daily Price Var Strategy : Row 7 Inflow Value(USD) : expected J7 -> =I7*O7 -> 74.49', 2);
                assertCell(sheet, data as string[][], 6, 14, '1.455212', 'Test Application of Avg Daily Price Var Strategy : Row 7 Price : expected O7 -> =AVERAGE(M7,N7) -> 1.455212', 6);
                assertCell(sheet, data as string[][], 7, 9, '46.02', 'Test Application of Value Known Strategy : Row 8 Inflow Value(USD) : expected J8 -> 46.02', 2);
            }
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun();

        deleteTempSheet(sheet);
    };
}
