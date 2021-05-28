import { unitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './test-utils';
import calculateFIFO from '../src/calc-fifo';
import getOrderList from '../src/orders';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/**
 * test4 for function calculateFIFO(sheet, lots, sales)
 */
export function test4CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST4';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2017-01-01', 1.0, 1000, 0, 0, '', 0, 0, ''],
            ['2017-01-03', 0, 0, 0.5, 1000, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data, 2, 5, '50% Sold', `Round ${round} Test for Partial Short-Term Sale : Row 3 lot half sold`);
            assertCell(sheet, data, 2, 6, 0, `Round ${round} Test for Partial Short-Term Sale : Row 3 Cost Basis has no cost basis`);
            assertCell(sheet, data, 2, 7, 0, `Round ${round} Test for Partial Short-Term Sale : Row 3 Gain(Loss) has no gain`);
            assert(annotations[0]?.[0], 'D4', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 4`);
            assert(annotations[0]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold from row 3 lot`);
            assertCell(sheet, data, 3, 5, 'Short-term', `Round ${round} Test for Partial Short-Term Sale : Row 4 Status short-term cost basis`);
            assertCell(sheet, data, 3, 6, '500.00', `Round ${round} Test for Partial Short-Term Sale : Row 4 Cost Basis is 500.00`, 2);
            assertCell(sheet, data, 3, 7, '500.00', `Round ${round} Test for Partial Short-Term Sale : Row 4 Gain(Loss) is 500.00`, 2);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test5 for function calculateFIFO(sheet, lots, sales)
 */
export function test5CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST5';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string ][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2017-01-01', 1.0, 1000, 0, 0, '', 0, 0, ''],
            ['2018-01-02', 0, 0, 1.0, 2000, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);
            assertCell(sheet, data, 2, 5, '100% Sold', `Round ${round} Test for Whole Long-Term Sale : Row 3 Status : expected all coin sold`);
            assertCell(sheet, data, 2, 6, 0, `Round ${round} Test for Whole Long-Term Sale : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 2, 7, 0, `Round ${round} Test for Whole Long-Term Sale : Row 3 Gain(Loss) : expected no gain`);
            assert(annotations[0]?.[0], 'D4', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 4`);
            assert(annotations[0]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold : expected sold from row 3`);
            assertCell(sheet, data, 3, 5, 'Long-term', `Round ${round} Test for Whole Long-Term Sale : Row 4 Status : expected long-term cost basis`);
            assertCell(sheet, data, 3, 6, '1000.00', `Round ${round} Test for Whole Long-Term Sale : Row 4 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 3, 7, '1000.00', `Round ${round} Test for Whole Long-Term Sale : Row 4 Gain(Loss) : expected 1000 gain`, 2);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test6 for function calculateFIFO(sheet, lots, sales)
 */
export function test6CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST6';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string ][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2017-01-01', 1.0, 1000, 0, 0, '', 0, 0, ''],
            ['2018-01-01', 1.0, 1000, 0, 0, '', 0, 0, ''],
            ['2018-07-01', 0, 0, 2.0, 4000, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data, 2, 5, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            assertCell(sheet, data, 2, 6, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 2, 7, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 3, 5, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            assertCell(sheet, data, 3, 6, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 3, 7, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 4, 5, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 5 Status : expected long-term cost basis`);
            assertCell(sheet, data, 4, 6, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 4, 7, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data, 5, 5, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 6 Status : expected short-term cost basis`);
            assertCell(sheet, data, 5, 6, '1000.00', `Round ${round} Test for Split into Short-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 5, 7, '1000.00', `Round ${round} Test for Split into Short-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`, 2);

            assert(annotations[0]?.[0], 'A5', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 5`);
            assert(annotations[0]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 2.00000000 ${coinName} was sold for $4000.00 and split into rows 5 and 6.`,
                `Round ${round} Test for Term Split Note : Row 5 Date : expected split into rows 5 and 6`);
            assert(annotations[1]?.[0], 'A6', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 6`);
            assert(annotations[1]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 2.00000000 ${coinName} was sold for $4000.00 and split into rows 5 and 6.`,
                `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 5 and 6`);
            assert(annotations[2]?.[0], 'D5', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 5`);
            assert(annotations[2]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
            assert(annotations[3]?.[0], 'D6', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 6`);
            assert(annotations[3]?.[1], 'Sold lot from row 4 on 2018-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 4`);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test7 for function calculateFIFO(sheet, lots, sales)
 */
export function test7CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST7';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string ][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2017-01-01', 1.0, 1000, 0, 0, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assert(annotations.length, 0, `Round ${round} No annotations.`);
            assertCell(sheet, data, 2, 5, '0% Sold', `Round ${round} Test for No Sale : Row 3 Status : expected no coin sold`);
            assertCell(sheet, data, 2, 6, 0, `Round ${round} Test for No Sale : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 2, 7, 0, `Round ${round} Test for No Sale : Row 3 Gain(Loss) : expected no gain`);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test8 for function calculateFIFO(sheet, lots, sales)
 */
export function test8CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST8';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string ][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2017-01-01', 0.2, 2000, 0, 0, '', 0, 0, ''],
            ['2018-02-01', 0.6, 6000, 0, 0, '', 0, 0, ''],
            ['2018-02-01', 0, 0, 0.1, 2000, '', 0, 0, ''],
            ['2018-03-01', 0, 0, 0.4, 8000, '', 0, 0, ''],
            ['2018-03-02', 0.4, 4000, 0, 0, '', 0, 0, ''],
            ['2018-03-03', 0.8, 8000, 0, 0, '', 0, 0, ''],
            ['2018-03-04', 0.6, 6000, 0, 0, '', 0, 0, ''],
            ['2018-03-05', 0, 0, 0.1, 500, '', 0, 0, ''],
            ['2018-03-06', 0, 0, 0.1, 1000, '', 0, 0, ''],
            ['2018-03-07', 0, 0, 0.1, 2000, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data, 2, 5, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            assertCell(sheet, data, 2, 6, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 2, 7, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 3, 5, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            assertCell(sheet, data, 3, 6, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 3, 7, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 4, 5, 'Long-term', `Round ${round} Test for Long-Term Sale : Row 5 Status : expected long-term cost basis`);
            assertCell(sheet, data, 4, 6, '1000.00', `Round ${round} Test for Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 4, 7, '1000.00', `Round ${round} Test for Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data, 5, 5, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 6 Status : expected long-term cost basis`);
            assertCell(sheet, data, 5, 6, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 5, 7, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data, 6, 5, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 7 Status : expected short-term cost basis`);
            assertCell(sheet, data, 6, 6, '3000.00', `Round ${round} Test for Split into Short-Term Sale : Row 7 Cost Basis : expected 3000 cost basis`, 2);
            assertCell(sheet, data, 6, 7, '3000.00', `Round ${round} Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected 3000 gain`, 2);
            assertCell(sheet, data, 7, 5, '0% Sold', `Round ${round} Test for First Unsold Lot : Row 8 Status : expected 0% sold`);
            assertCell(sheet, data, 7, 6, 0, `Round ${round} Test for First Unsold Lot : Row 8 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 7, 7, 0, `Round ${round} Test for First Unsold Lot : Row 8 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 8, 5, '', `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Status : expected no message`);
            assertCell(sheet, data, 8, 6, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 8, 7, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 9, 5, '', `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Status : expected no message`);
            assertCell(sheet, data, 9, 6, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Cost Basis : expected no cost basis`);
            assertCell(sheet, data, 9, 7, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Gain(Loss) : expected no gain`);
            assertCell(sheet, data, 10, 5, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 11 Status : expected short-term cost basis`);
            assertCell(sheet, data, 10, 6, '1000.00', `Round ${round} Test for Short-Term Sale : Row 11 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 10, 7, '-500.00', `Round ${round} Test for Short-Term Sale : Row 11 Gain(Loss) : expected 500 loss`, 2);
            assertCell(sheet, data, 11, 5, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 12 Status : expected short-term cost basis`);
            assertCell(sheet, data, 11, 6, '1000.00', `Round ${round} Test for Short-Term Sale : Row 12 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 11, 7, '0.00', `Round ${round} Test for Short-Term Sale : Row 12 Gain(Loss) : expected 0 gain`, 2);
            assertCell(sheet, data, 12, 5, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 13 Status : expected short-term cost basis`);
            assertCell(sheet, data, 12, 6, '1000.00', `Round ${round} Test for Short-Term Sale : Row 13 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data, 12, 7, '1000.00', `Round ${round} Test for Short-Term Sale : Row 13 Gain(Loss) : expected 1000 gain`, 2);

            assert(annotations[0]?.[0], 'A6', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 6`);
            assert(annotations[0]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 0.40000000 ${coinName} was sold for $8000.00 and split into rows 6 and 7.`,
                `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 6 and 7`);
            assert(annotations[1]?.[0], 'A7', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 7`);
            assert(annotations[1]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 0.40000000 ${coinName} was sold for $8000.00 and split into rows 6 and 7.`,
                `Round ${round} Test for Term Split Note : Row 7 Date : expected split into rows 6 and 7`);
            assert(annotations[2]?.[0], 'D5', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 5`);
            assert(annotations[2]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
            assert(annotations[3]?.[0], 'D6', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 6`);
            assert(annotations[3]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 3`);
            assert(annotations[4]?.[0], 'D7', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 7`);
            assert(annotations[4]?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 7 Sold : expected sold from row 4`);
            assert(annotations[5]?.[0], 'D11', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 11`);
            assert(annotations[5]?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 11 Sold : expected sold from row 4`);
            assert(annotations[6]?.[0], 'D12', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 12`);
            assert(annotations[6]?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 12 Sold : expected sold from row 4`);
            assert(annotations[7]?.[0], 'D13', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 13`);
            assert(annotations[7]?.[1], 'Sold lots from row 4 on 2018-02-01 to row 8 on 2018-03-02.', `Round ${round} Test for Lot Sold Hint : Row 13 Sold : expected sold from row 4 to 8`);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test9 for function calculateFIFO(sheet, lots, sales)
 */
export function test9CostBasis(): unitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST9';
        const sheet = createTempSheet(coinName);
        const data: [string, number, number, number, number, string, number, number, string ][] = [
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['', 0, 0, 0, 0, '', 0, 0, ''],
            ['2019-02-14', 201.89592700, 25.30, 0, 0, '', 0, 0, ''],
            ['2019-03-13', 104.50000000, 20.25, 0, 0, '', 0, 0, ''],
            ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-13', 38.88888900, 7.00, 0, 0, '', 0, 0, ''],
            ['2019-03-30', 3.55968800, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-30', 3.56238300, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-30', 3.56293500, 1.00, 0, 0, '', 0, 0, ''],
            ['2019-03-30', 24.93663400, 6.98, 0, 0, '', 0, 0, ''],
            ['2019-04-09', 14.25000000, 4.14, 0, 0, '', 0, 0, ''],
            ['2019-05-09', 14.25000000, 4.22, 0, 0, '', 0, 0, ''],
            ['2019-06-10', 19.00000000, 6.19, 0, 0, '', 0, 0, ''],
            ['2019-09-08', 7.60000000, 1.34, 0, 0, '', 0, 0, ''],
            ['2019-10-09', 49.40000000, 10.18, 0, 0, '', 0, 0, ''],
            ['2019-11-08', 25.65000000, 6.20, 0, 0, '', 0, 0, ''],
            ['2019-12-07', 43.46250000, 8.40, 0, 0, '', 0, 0, ''],
            ['2020-01-07', 4.50000000, 0.88, 0, 0, '', 0, 0, ''],
            ['2020-02-01', 61.91077800, 13.76, 0, 0, '', 0, 0, ''],
            ['2020-02-09', 23.51250000, 6.24, 0, 0, '', 0, 0, ''],
            ['2020-02-09', 20.35000000, 5.40, 0, 0, '', 0, 0, ''],
            ['2020-03-06', 22.05640000, 5.23, 0, 0, '', 0, 0, ''],
            ['2020-03-09', 75.76250000, 14.54, 0, 0, '', 0, 0, ''],
            ['2020-04-06', 24.21220000, 3.73, 0, 0, '', 0, 0, ''],
            ['2020-04-08', 25.65000000, 4.23, 0, 0, '', 0, 0, ''],
            ['2020-05-04', 0, 0, 829.14000000, 151.26, '', 0, 0, ''],
            ['2020-05-06', 16.37960000, 0, 0, 0, '', 0, 0, ''],
            ['2020-05-09', 26.60000000, 0, 0, 0, '', 0, 0, ''],
            ['2020-06-05', 6.30000000, 0, 0, 0, '', 0, 0, ''],
            ['2020-06-10', 37.78054500, 0, 0, 0, '', 0, 0, ''],
            ['2020-07-07', 5.09400000, 0, 0, 0, '', 0, 0, '']];

        const TestRun = function (round): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            for (let j = 2; j < 27; j++) {
                assertCell(sheet, data, j, 5, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Status : expected 100% sold`);
                assertCell(sheet, data, j, 6, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Cost Basis : expected no cost basis`, 2);
                assertCell(sheet, data, j, 7, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Gain(Loss) : expected no gain`, 2);
            }
            assertCell(sheet, data, 27, 5, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 28 Status : expected long-term cost basis`);
            assertCell(sheet, data, 27, 6, '69.67', `Round ${round} Test for Split into Long-Term Sale : Row 28 Cost Basis : expected $69.67 cost basis`, 2);
            assertCell(sheet, data, 27, 7, '5.46', `Round ${round} Test for Split into Long-Term Sale : Row 28 Gain(Loss) : expected $5.46 gain`, 2);
            assertCell(sheet, data, 28, 5, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 29 Status : expected short-term cost basis`);
            assertCell(sheet, data, 28, 6, '90.54', `Round ${round} Test for Split into Short-Term Sale : Row 29 Cost Basis : expected $90.54 cost basis`, 2);
            assertCell(sheet, data, 28, 7, '-14.41', `Round ${round} Test for Split into Short-Term Sale : Row 29 Gain(Loss) : expected $(14.41) gain`, 2);
            for (let k = 29; k < 34; k++) {
                assertCell(sheet, data, k, 5, '', `Round ${round} Test for Unsold Lot : Row ${k} Status : expected no message`);
                assertCell(sheet, data, k, 6, '0.00', `Round ${round} Test for Unsold Lot : Row ${k} Cost Basis : expected no cost basis`, 2);
                assertCell(sheet, data, k, 7, '0.00', `Round ${round} Test for Unsold Lot : Row ${k} Gain(Loss) : expected no gain`, 2);
            }

            assert(annotations[0]?.[0], 'A28', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 28`);
            assert(annotations[0]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 829.14000000 ${coinName} was sold for $151.26 and split into rows 28 and 29.`,
                `Round ${round} Test for Term Split Note : Row 28 Date : expected split into rows 28 and 29`);
            assert(annotations[1]?.[0], 'A29', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 29`);
            assert(annotations[1]?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 829.14000000 ${coinName} was sold for $151.26 and split into rows 28 and 29.`,
                `Round ${round} Test for Term Split Note : Row 29 Date : expected split into rows 28 and 29`);
            assert(annotations[2]?.[0], 'D28', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 28`);
            assert(annotations[2]?.[1], 'Sold lots from row 3 on 2019-02-14 to row 13 on 2019-04-09.', `Round ${round} Test for Lot Sold Hint : Row 28 Sold : expected sold from row 3 to 13`);
            assert(annotations[3]?.[0], 'D29', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 29`);
            assert(annotations[3]?.[1], 'Sold lots from row 14 on 2019-05-09 to row 27 on 2020-04-08.', `Round ${round} Test for Lot Sold Hint : Row 29 Sold : expected sold from row 14 to 27`);
        };

        fillInTempSheet(sheet, data as string[][]);
        TestRun(1);
        TestRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * Used for Local testing of the FIFO Calculation function outside of the spreadsheet context
 *
 * TODO - reimplement to avoid array copies
 * https://stackoverflow.com/questions/51383031/slice-section-of-two-dimensional-array-in-javascript
 *
 * @return true = passm, false = fail
 */
function callCalculateFIFO(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, coinName: string, data: [string, number, number, number, number, string, number, number, string ][], round = 1): string[][] {
    let annotations: string[][] = [];
    if (typeof ScriptApp === 'undefined') {
        // jest unit test
        // clone the data array, and trim down to data needed for validation
        const validationData = [...data];
        validationData.forEach((row, rowIdx) => { validationData[rowIdx] = [...row]; });
        validationData.forEach(row => row.splice(5, 4));

        // TODO - better to include this error in array at expected (x,y) location?
        assert((validate(validationData as unknown as [string, number, number, number, number][]) === ''), true, `Round ${round} Data validated`);
        const dateDisplayValues = validationData.map(row => [row[0], '']); // empty str makes this a 2D array of strings for getLastRowWithDataPresent()
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);

        // clone the data array, and trim down to data needed for cost basis calc
        const lotData = [...data];
        lotData.forEach((row, rowIdx) => { lotData[rowIdx] = [...row]; });
        lotData.forEach(row => row.splice(3, 2)); // split out and remove sales
        lotData.forEach(row => row.splice(0, 1)); // remove leftmost date column from lots
        lotData.forEach(row => row.splice(2, row.length - 2)); // remove all remaining columns to the right
        const salesData = [...data];
        salesData.forEach((row, rowIdx) => { salesData[rowIdx] = [...row]; });
        salesData.forEach(row => row.splice(0, 3)); // split out and remove date column and lots
        salesData.forEach(row => row.splice(2, row.length - 2)); // remove all remaining columns to the right

        // do the cost basis calc
        const lots = getOrderList(dateDisplayValues as [string][], lastRow, lotData as unknown as [number, number][]);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, salesData as unknown as [number, number][]);
        annotations = calculateFIFO(coinName, data, lots, sales);
    } else if (sheet !== null) {
        // QUnit unit test
        assert((validate(sheet.getRange('A:E').getValues() as [string, string, string, string, string][]) === ''), true, `Round ${round} Data validated`);
        const dateDisplayValues = sheet.getRange('A:A').getDisplayValues();
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);
        const lots = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('B:C').getValues() as [number, number][]);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('D:E').getValues() as [number, number][]);

        annotations = calculateFIFO(coinName, data, lots, sales);
        fillInTempSheet(sheet, data as string[][]);
    }
    annotations.sort((e1, e2) => { if (e1[0] < e2[0]) { return -1; } if (e1[0] > e2[0]) { return 1; } return 0; });
    return annotations;
}
