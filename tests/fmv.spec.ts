import { unitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { sevenPackDataRow, completeDataRow } from '../src/types';
import calcFiatValuesFromFMV from '../src/gas/fmv';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/**
 * test1 for function calcFiatValuesFromFMV(sheet)
 */
export function test1FMV(): unitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST1';
        const sheet = createTempSheet(coinName);
        const data: completeDataRow[] = [
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['2015-12-01', '', '', 1.00000000, 0, 0, 0, '', 0, 0, '', '1.111100', '0.992222', ''],
            ['2016-02-29', '', '', 1.00000000, 1, 0, 0, '', 0, 0, '', 'value known', '', ''],
            ['2016-03-01', '', '', 0, 0, 1.00000000, 5, '', 0, 0, '', 'value known', 'value known', ''],
            ['2018-02-28', '', '', 23.00000000, 0, 0, 0, '', 0, 0, '', 'price known', '', '34'],
            ['2020-04-01', '', '', 0, 0, 2.00000000, 0, '', 0, 0, '', '2.312002', '1.8222', ''],
            ['2020-04-02', '', '', 0, 0, 20.00000000, 0, '', 0, 0, '', '=0.0003561*7088.25', '=0.0003561*6595.92', ''],
            ['2020-05-31', '', '', 26.92000000, 0, 0, 0, '', 0, 0, '', '=0.0069319*9700.34/D9', '=0.0069319*9432.3/D9', '']
        ];
        const TestRun = function (round): void {
            if (typeof ScriptApp === 'undefined') {
                // jest unit test
                // clone the data array, and trim down to data needed for validation
                const validationData = [...data];
                validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
                validationData.forEach(row => row.splice(7, 4));

                assert((validate(validationData as unknown as sevenPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = data.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);

                // clone the data array, and trim down to data needed for FMV calcs
                const acquiredCol = [...data as string[][]];
                acquiredCol.forEach((row, rowIdx) => { acquiredCol[rowIdx] = [...row]; });
                acquiredCol.forEach(row => row.splice(0, 3)); // remove leftmost date, category, FMV strategy columns
                acquiredCol.forEach(row => row.splice(1, row.length - 2)); // remove all remaining columns to the right
                const disposedCol = [...data as string[][]];
                disposedCol.forEach((row, rowIdx) => { disposedCol[rowIdx] = [...row]; });
                disposedCol.forEach(row => row.splice(0, 5)); // remove leftmost date, category, FMV strategy, inflow columns
                disposedCol.forEach(row => row.splice(1, row.length - 4)); // remove all remaining columns to the right
                const firstFMVcol = [...data as string[][]];
                firstFMVcol.forEach((row, rowIdx) => { firstFMVcol[rowIdx] = [...row]; });
                firstFMVcol.forEach(row => row.splice(0, 11)); // remove leftmost date, category, FMV strategy, inflow, outflow, calculated and notes columns
                firstFMVcol.forEach(row => row.splice(1, row.length - 10)); // remove all remaining columns to the right
                calcFiatValuesFromFMV(null, data, acquiredCol, disposedCol, firstFMVcol, lastRow);
            } else if (sheet !== null) {
                // QUnit unit test
                assert((validate(sheet.getRange('A:G').getValues() as sevenPackDataRow[]) === ''), true, `Round ${round} Data validated`);
                const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
                const lastRow = getLastRowWithDataPresent(dateDisplayValues);
                const acquiredCol = sheet.getRange('D:D').getValues();
                const disposedCol = sheet.getRange('F:F').getValues();
                const firstFMVcol = sheet.getRange('L:L').getValues();
                calcFiatValuesFromFMV(sheet, null, acquiredCol, disposedCol, firstFMVcol, lastRow);
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
            assertCell(sheet, data as string[][], 3, 12, 'value known', 'Test for FMV setinel value filled right : Row 4 Low : expected sentinel value copied from first FMV col');
            assertCell(sheet, data as string[][], 3, 13, 'value known', 'Test for  FMV setinel value filled right : Row 4 Price : expected sentinel value copied from first FMV col');
            assertCell(sheet, data as string[][], 4, 6, '5.00', 'Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number', 2);
            assertCell(sheet, data as string[][], 4, 13, 'value known', 'Test for FMV setinel value filled right : Row 5 Price : expected sentinel value copied from first FMV col');
            assertCell(sheet, data as string[][], 5, 12, 'price known', 'Test for FMV setinel value filled right : Row 6 Low : expected sentinel value copied from first FMV col');
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function calcFiatValuesFromFMV(sheet)
 */
export function test2FMV(): unitTestWrapper {
    return (): void => {
        const coinName = 'FMV_TEST2';
        const sheet = createTempSheet(coinName);
        const data: completeDataRow[] = [
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', ''],
            ['2018-10-27', 'Mining', 'Avg Daily Price Variation', 0.10348353, 0.23, 0, 0, '', 0, 0, 'Pool mining on BSOD', '2.32', '2.07', '=AVERAGE(L3,M3)'],
            ['2019-02-15', 'Traded', 'Avg Daily Price Variation', 99.8, 9.38, 0, 0, '', 0, 0, 'CryptoBridge traded for 99.8 VRSC @ 0.0000259 BTC-VRSC', '=0.0000259*3647.8', '=0.0000259*3608.21', '=AVERAGE(L4,M4)'],
            ['2019-06-02', 'Tx Fee', 'Price Known', 0, 0, 0.00006253, 0.54, '', 0, 0, 'Trezor BTC Outgoing Transfer', 'price known', 'price known', '8685.27'],
            ['2019-06-24', 'Tx Fee', 'Price Known', 0, 0, 12.0001, 2.49, '', 0, 0, 'barterly traded 940 ARR for 1200 VRSC, 12.0001 VRSC fee', 'price known', 'price known', '=0.00001916*10838.17'],
            ['2019-07-08', 'Traded', 'Avg Daily Price Variation', 51.19, 74.49, 0, 0, '', 0, 0, 'binance.com traded for 51.19 KMD for 0.00627589 BTC', '=0.00627589/51.19*12345.83', '=0.00627589/51.19*11393.37', '=AVERAGE(L7,M7)'],
            ['2019-10-04', 'Gift Received', 'Value Known', 0.00491033, 46.02, 0, 0, '', 0, 0, 'BTC recieved at Pretentious Party', 'value known', 'value known', 'value known']
        ];
        // L4 Note === 'VRSC-BTC Price: .0000259\nBTC Daily High: 3647.80'
        // M4 Note === 'VRSC-BTC Price: .000259\nBTC Daily Low: 3608.21'
        // N6 Note === 'VRSC-BTC Price: 0.00001916\nBTC Price: 10838.17'
        // L7 Note === 'KMD-BTC Price: .00627589/51.19\nBTC Daily High: 12345.83'
        // M7 Note === 'KMD-BTC Price: .00627589/51.19\nBTC Daily High: 11393.37'

        const TestRun = function (): void {
            assert(false, true, 'FMV Strategies Not implemented');
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun();

        deleteTempSheet(sheet);
    };
}
