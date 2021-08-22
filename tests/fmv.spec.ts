import { UnitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { SevenPackDataRow, CompleteDataRow } from '../src/types';
import { setFMVformulasOnSheet } from '../src/gas/fmv';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/**
 * test1 for function setFMVformulasOnSheet()
 */
export function test1FMV(): UnitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST1';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['2015-12-01', '', 'Avg Daily Price Variation', 1.00000000, 0, 0, 0, '', 0, 0, '', '1.111100', '0.992222', ''],
            ['2016-02-29', '', 'Value Known', 1.00000000, 1, 0, 0, '', 0, 0, '', '', '', ''],
            ['2016-03-01', '', 'Value Known', 0, 0, 1.00000000, 5, '', 0, 0, '', '', '', ''],
            ['2018-02-28', '', 'Price Known', 23.00000000, 0, 0, 0, '', 0, 0, '', '', '', '34'],
            ['2020-04-01', '', 'Avg Daily Price Variation', 0, 0, 2.00000000, 0, '', 0, 0, '', '2.312002', '1.8222', ''],
            ['2020-04-02', '', 'Avg Daily Price Variation', 0, 0, 20.00000000, 0, '', 0, 0, '', '=0.0003561*7088.25', '=0.0003561*6595.92', ''],
            ['2020-05-31', '', 'Avg Daily Price Variation', 26.92000000, 0, 0, 0, '', 0, 0, '', '=0.0069319*9700.34/D9', '=0.0069319*9432.3/D9', '']
        ];
        const testRun = function (round: number): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(7, 4));

                assert((validate(validationData as unknown as SevenPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = data.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const strategyCol = [...data as string[][]];
                strategyCol.forEach((row, rowIdx) => { strategyCol[rowIdx] = [...row]; });
                strategyCol.forEach(row => row.splice(0, 2)); // remove leftmost date, category
                strategyCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const acquiredCol = [...data as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 3)); // remove leftmost date, category, FMV strategy columns
                acquiredCol.forEach(row => row.splice(1, row.length - 2)); // remove all remaining columns to the right
                const disposedCol = [...data as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 5)); // remove leftmost date, category, FMV strategy, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 4)); // remove all remaining columns to the right
                setFMVformulasOnSheet(null, data, strategyCol, acquiredCol, disposedCol, lastRow);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('A:G').getValues() as SevenPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const strategyCol = sheet.getRange('C:C').getValues();
                const acquiredCol = sheet.getRange('D:D').getValues();
                const disposedCol = sheet.getRange('F:F').getValues();
                setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);
                // these assertions aren't checked locally becasue they require cell formula calcs to happen
                assertCell(sheet, data as string[][], 2, 4, '1.05', 'Test for Fiat Cost calculated from FMV data : Row 3 Fiat Cost : expected fiat cost calc from FMV average', 2);
                assertCell(sheet, data as string[][], 2, 13, '1.05', 'Test for FMV average formula inserted : Row 3 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 5, 4, '782.00', 'Test for Fiat Cost with known FMV price : Row 6 Fiat Cost : expected fiat cost calc from known FMV price', 2);
                assertCell(sheet, data as string[][], 6, 6, '4.13', 'Test for Fiat Received calculated from FMV data : Row 7 Fiat Received : expected fiat received calc from FMV average', 2);
                assertCell(sheet, data as string[][], 6, 13, '2.07', 'Test for FMV average formula inserted : Row 7 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 7, 6, '48.73', 'Test for Fiat Received calculated from FMV data : Row 8 Fiat Received : expected fiat received calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 7, 13, '2.44', 'Test for FMV average formula inserted : Row 8 Price : expected FMV calc averaged from supplied high/low prices', 2);
                assertCell(sheet, data as string[][], 8, 4, '66.31', 'Test for Fiat Cost calculated from FMV data : Row 9 Fiat Cost : expected fiat cost calc from FMV average derived from formulas', 2);
                assertCell(sheet, data as string[][], 8, 13, '2.46', 'Test for FMV average formula inserted : Row 9 Price : expected FMV calc averaged from supplied high/low prices', 2);
            }
            assertCell(sheet, data as string[][], 3, 4, '1.00', 'Test for Fiat Cost with no FMV data : Row 4 Fiat Cost : expected user supplied number', 2);
            assertCell(sheet, data as string[][], 4, 6, '5.00', 'Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number', 2);
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
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['2018-10-27', 'Mining', 'Avg Daily Price Variation', 0.10348353, 0, 0, 0, '', 0, 0, 'Pool mining on BSOD', '2.32', '2.07', ''],
            ['2019-02-15', 'Traded', 'Avg Daily Price Variation', 99.8, 0, 0, 0, '', 0, 0, 'CryptoBridge traded for 99.8 VRSC @ 0.0000259 BTC-VRSC', '=0.0000259*3647.8', '=0.0000259*3608.21', ''],
            ['2019-06-02', 'Tx Fee', 'Price Known', 0, 0, 0.00006253, 0, '', 0, 0, 'Trezor BTC Outgoing Transfer', '', '', '8685.27'],
            ['2019-06-24', 'Tx Fee', 'Price Known', 0, 0, 12.0001, 0, '', 0, 0, 'barterly traded 940 ARR for 1200 VRSC, 12.0001 VRSC fee', '', '', '=0.00001916*10838.17'],
            ['2019-07-08', 'Traded', 'Avg Daily Price Variation', 51.19, 0, 0, 0, '', 0, 0, 'binance.com traded for 51.19 KMD for 0.00627589 BTC', '=0.00627589/51.19*12345.83', '=0.00627589/51.19*11393.37', ''],
            ['2019-10-04', 'Gift Received', 'Value Known', 0.00491033, 46.02, 0, 0, '', 0, 0, 'BTC recieved at Pretentious Party', '', '', '']
        ];
        const testRun = function (): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(7, 4));

                assert((validate(validationData as unknown as SevenPackDataRow[]) === ''), true, 'Data validated');
                const dateDisplayValues = data.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const strategyCol = [...data as string[][]];
                strategyCol.forEach((row, rowIdx) => { strategyCol[rowIdx] = [...row]; });
                strategyCol.forEach(row => row.splice(0, 2)); // remove leftmost date, category
                strategyCol.forEach(row => row.splice(1, row.length - 1)); // remove all remaining columns to the right
                const acquiredCol = [...data as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 3)); // remove leftmost date, category, FMV strategy columns
                acquiredCol.forEach(row => row.splice(1, row.length - 2)); // remove all remaining columns to the right
                const disposedCol = [...data as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 5)); // remove leftmost date, category, FMV strategy, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 4)); // remove all remaining columns to the right
                // TODO - return annotations?  Or stop making annotations in the first place
                setFMVformulasOnSheet(null, data, strategyCol, acquiredCol, disposedCol, lastRow);
                assertCell(sheet, data as string[][], 2, 4, '=D3*N3', 'Test Application of Avg Daily Price Var Strategy : Row 3 Fiat Value : expected E3 -> =D3*N3 -> 0.23');
                assertCell(sheet, data as string[][], 2, 13, '=AVERAGE(L3,M3)', 'Test Application of Avg Daily Price Var Strategy : Row 3 Price : expected N3 -> =AVERAGE(L3,M3) -> 2.195');
                assertCell(sheet, data as string[][], 3, 4, '=D4*N4', 'Test Application of Avg Daily Price Var Strategy : Row 4 Fiat Value : expected E4 -> =D4*N4 -> 9.38');
                assertCell(sheet, data as string[][], 3, 13, '=AVERAGE(L4,M4)', 'Test Application of Avg Daily Price Var Strategy : Row 4 Price : expected N4 -> =AVERAGE(L4,M4) -> 0.093965');
                assertCell(sheet, data as string[][], 4, 6, '=F5*N5', 'Test Application of Price Known Strategy : Row 5 Fiat Value : expected G5 -> =F5*N5 -> 0.54');
                assertCell(sheet, data as string[][], 4, 13, '8685.27', 'Test Application of Price Known Strategy : Row 5 Price : expected N5 -> 8685.27', 2);
                assertCell(sheet, data as string[][], 5, 6, '=F6*N6', 'Test Application of Price Known Strategy : Row 6 Fiat Value : expected G6 -> =F6*N6 -> 2.49');
                assertCell(sheet, data as string[][], 5, 13, '=0.00001916*10838.17', 'Test Application of Price Known Strategy : Row 6 Price : expected N6 -> =0.00001916*10838.17 -> 0.207659');
                assertCell(sheet, data as string[][], 6, 4, '=D7*N7', 'Test Application of Avg Daily Price Var Strategy : Row 7 Fiat Value : expected E7 -> =D7*N7 -> 74.49');
                assertCell(sheet, data as string[][], 6, 13, '=AVERAGE(L7,M7)', 'Test Application of Avg Daily Price Var Strategy : Row 7 Price : expected N7 -> =AVERAGE(L7,M7) -> 1.455212');
                assertCell(sheet, data as string[][], 7, 4, '46.02', 'Test Application of Value Known Strategy : Row 8 Fiat Value : expected E8 -> 46.02', 2);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('A:G').getValues() as SevenPackDataRow[]) === ''), true, 'Data validated');
                const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const strategyCol = sheet.getRange('C:C').getValues();
                const acquiredCol = sheet.getRange('D:D').getValues();
                const disposedCol = sheet.getRange('F:F').getValues();
                // TODO - return annotations?  Or stop making annotations in the first place
                setFMVformulasOnSheet(sheet, null, strategyCol, acquiredCol, disposedCol, lastRow);
                // these assertions aren't checked locally becasue they require cell formula calcs to happen
                assertCell(sheet, data as string[][], 2, 4, '0.23', 'Test Application of Avg Daily Price Var Strategy : Row 3 Fiat Value : expected E3 -> =D3*N3 -> 0.23', 2);
                assertCell(sheet, data as string[][], 2, 13, '2.195', 'Test Application of Avg Daily Price Var Strategy : Row 3 Price : expected N3 -> =AVERAGE(L3,M3) -> 2.195', 3);
                assertCell(sheet, data as string[][], 3, 4, '9.38', 'Test Application of Avg Daily Price Var Strategy : Row 4 Fiat Value : expected E4 -> =D4*N4 -> 9.38', 2);
                assertCell(sheet, data as string[][], 3, 13, '0.093965', 'Test Application of Avg Daily Price Var Strategy : Row 4 Price : expected N4 -> =AVERAGE(L4,M4) -> 0.093965', 6);
                assertCell(sheet, data as string[][], 4, 6, '0.54', 'Test Application of Price Known Strategy : Row 5 Fiat Value : expected G5 -> =F5*N5 -> 0.54', 2);
                assertCell(sheet, data as string[][], 4, 13, '8685.27', 'Test Application of Price Known Strategy : Row 5 Price : expected N5 -> 8685.27', 2);
                assertCell(sheet, data as string[][], 5, 6, '2.49', 'Test Application of Price Known Strategy : Row 6 Fiat Value : expected G6 -> =F6*N6 -> 2.49', 2);
                assertCell(sheet, data as string[][], 5, 13, '0.207659', 'Test Application of Price Known Strategy : Row 6 Price : expected N6 -> =0.00001916*10838.17 -> 0.207659', 6);
                assertCell(sheet, data as string[][], 6, 4, '74.49', 'Test Application of Avg Daily Price Var Strategy : Row 7 Fiat Value : expected E7 -> =D7*N7 -> 74.49', 2);
                assertCell(sheet, data as string[][], 6, 13, '1.455212', 'Test Application of Avg Daily Price Var Strategy : Row 7 Price : expected N7 -> =AVERAGE(L7,M7) -> 1.455212', 6);
                assertCell(sheet, data as string[][], 7, 4, '46.02', 'Test Application of Value Known Strategy : Row 8 Fiat Value : expected E8 -> 46.02', 2);
            }
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun();

        deleteTempSheet(sheet);
    };
}
