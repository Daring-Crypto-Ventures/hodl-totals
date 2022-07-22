import { UnitTestWrapper, assert, assertCell, createTempSheet, fillInTempSheet, deleteTempSheet } from './utils.test';
import { DataValidationRow, CompleteDataRow, FormulaDataRow } from '../src/types';
import calculateFIFO from '../src/calc-fifo';
import getOrderList from '../src/orders';
import validate from '../src/validate';
import getLastRowWithDataPresent from '../src/last-row';

/* global GoogleAppsScript */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * test1 for function calculateFIFO(sheet, lots, sales)
 */
export function test1CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST1';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2017-01-01', '', 1.0, '', 1.0, 1000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2017-01-03', '', -0.5, '', 0, 0, 0.5, 1000, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data as string[][], 2, 17, '50% Sold', `Round ${round} Test for Partial Short-Term Sale : Row 3 lot half sold`);
            assertCell(sheet, data as string[][], 2, 18, 0, `Round ${round} Test for Partial Short-Term Sale : Row 3 Cost Basis has no cost basis`);
            assertCell(sheet, data as string[][], 2, 19, 0, `Round ${round} Test for Partial Short-Term Sale : Row 3 Gain(Loss) has no gain`);
            assert(annotations[0]?.[0], 'K4', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 4`);
            assert(annotations[0]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold from row 3 lot`);
            assertCell(sheet, data as string[][], 3, 17, 'Short-term', `Round ${round} Test for Partial Short-Term Sale : Row 4 Status short-term cost basis`);
            assertCell(sheet, data as string[][], 3, 18, '500.00', `Round ${round} Test for Partial Short-Term Sale : Row 4 Cost Basis is 500.00`, 2);
            assertCell(sheet, data as string[][], 3, 19, '500.00', `Round ${round} Test for Partial Short-Term Sale : Row 4 Gain(Loss) is 500.00`, 2);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test2 for function calculateFIFO(sheet, lots, sales)
 */
export function test2CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST2';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2017-01-01', '', 1.0, '', 1.0, 1000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-01-02', '', -1.0, '', 0, 0, 1.0, 2000, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);
            assertCell(sheet, data as string[][], 2, 17, '100% Sold', `Round ${round} Test for Whole Long-Term Sale : Row 3 Status : expected all coin sold`);
            assertCell(sheet, data as string[][], 2, 18, 0, `Round ${round} Test for Whole Long-Term Sale : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 2, 19, 0, `Round ${round} Test for Whole Long-Term Sale : Row 3 Gain(Loss) : expected no gain`);
            assert(annotations[0]?.[0], 'K4', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 4`);
            assert(annotations[0]?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 4 Sold : expected sold from row 3`);
            assertCell(sheet, data as string[][], 3, 17, 'Long-term', `Round ${round} Test for Whole Long-Term Sale : Row 4 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 3, 18, '1000.00', `Round ${round} Test for Whole Long-Term Sale : Row 4 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 3, 19, '1000.00', `Round ${round} Test for Whole Long-Term Sale : Row 4 Gain(Loss) : expected 1000 gain`, 2);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test3 for function calculateFIFO(sheet, lots, sales)
 */
export function test3CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST3';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2017-01-01', '', +1.0, '', 1.0, 1000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-01-01', '', +1.0, '', 1.0, 1000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-07-01', '', -2.0, '', 0, 0, 2.0, 4000, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data as string[][], 2, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            assertCell(sheet, data as string[][], 2, 18, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 2, 19, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 3, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            assertCell(sheet, data as string[][], 3, 18, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 3, 19, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 4, 17, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 5 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 4, 18, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 4, 19, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data as string[][], 5, 17, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 6 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 5, 18, '1000.00', `Round ${round} Test for Split into Short-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 5, 19, '1000.00', `Round ${round} Test for Split into Short-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`, 2);

            if (round === 1) { // Will not see split tx notes on subsequent calculations
                const splitNotePart1 = annotations?.shift() ?? '';
                assert(splitNotePart1?.[0], 'E5', 'Round 1 Test for Original Data Before Split Hint : Hint Anchor point on row 5');
                assert(splitNotePart1?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 2.00000000 ${coinName} was sold for $4000.00 and split into rows 5 and 6.`,
                    `Round ${round} Test for Term Split Note : Row 5 Date : expected split into rows 5 and 6`);
                const splitNotePart2 = annotations?.shift() ?? '';
                assert(splitNotePart2?.[0], 'E6', 'Round 1 Test for Original Data Before Split Hint : Hint Anchor point on row 6');
                assert(splitNotePart2?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 2.00000000 ${coinName} was sold for $4000.00 and split into rows 5 and 6.`,
                    `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 5 and 6`);
            }
            const soldNote1 = annotations?.shift() ?? '';
            assert(soldNote1?.[0], 'K5', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 5`);
            assert(soldNote1?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
            const soldNote2 = annotations?.shift() ?? '';
            assert(soldNote2?.[0], 'K6', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 6`);
            assert(soldNote2?.[1], 'Sold lot from row 4 on 2018-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 4`);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test4 for function calculateFIFO(sheet, lots, sales)
 */
export function test4CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST4';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2017-01-01', '', +1.0, '', 1.0, 1000, 0, 0, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assert(annotations.length, 0, `Round ${round} No annotations.`);
            assertCell(sheet, data as string[][], 2, 17, '0% Sold', `Round ${round} Test for No Sale : Row 3 Status : expected no coin sold`);
            assertCell(sheet, data as string[][], 2, 18, 0, `Round ${round} Test for No Sale : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 2, 19, 0, `Round ${round} Test for No Sale : Row 3 Gain(Loss) : expected no gain`);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test5 for function calculateFIFO(sheet, lots, sales)
 */
export function test5CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST5';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'c', '2017-01-01', '', +0.2, '', 0.2, 2000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'd', '2018-02-01', '', +0.6, '', 0.6, 6000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'e', '2018-02-01', '', -0.1, '', 0, 0, 0.1, 2000, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'f', '2018-03-01', '', -0.4, '', 0, 0, 0.4, 8000, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'g', '2018-03-02', '', +0.4, '', 0.4, 4000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'h', '2018-03-03', '', +0.8, '', 0.8, 8000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'i', '2018-03-04', '', +0.6, '', 0.6, 6000, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'j', '2018-03-05', '', -0.1, '', 0, 0, 0.1, 500, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'k', '2018-03-06', '', -0.1, '', 0, 0, 0.1, 1000, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', 'l', '2018-03-07', '', -0.1, '', 0, 0, 0.1, 2000, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            assertCell(sheet, data as string[][], 2, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold`);
            assertCell(sheet, data as string[][], 2, 18, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 2, 19, 0, `Round ${round} Test for Lot Sold In Full Later : Row 3 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 3, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold`);
            assertCell(sheet, data as string[][], 3, 18, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 3, 19, 0, `Round ${round} Test for Lot Sold In Full Later : Row 4 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 4, 17, 'Long-term', `Round ${round} Test for Long-Term Sale : Row 5 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 4, 18, '1000.00', `Round ${round} Test for Long-Term Sale : Row 5 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 4, 19, '1000.00', `Round ${round} Test for Long-Term Sale : Row 5 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data as string[][], 5, 17, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 6 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 5, 18, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 6 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 5, 19, '1000.00', `Round ${round} Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected 1000 gain`, 2);
            assertCell(sheet, data as string[][], 6, 17, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 7 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 6, 18, '3000.00', `Round ${round} Test for Split into Short-Term Sale : Row 7 Cost Basis : expected 3000 cost basis`, 2);
            assertCell(sheet, data as string[][], 6, 19, '3000.00', `Round ${round} Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected 3000 gain`, 2);
            assertCell(sheet, data as string[][], 7, 17, '', `Round ${round} Test for First Unsold Lot : Row 8 Status : expected no message`);
            assertCell(sheet, data as string[][], 7, 18, 0, `Round ${round} Test for First Unsold Lot : Row 8 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 7, 19, 0, `Round ${round} Test for First Unsold Lot : Row 8 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 8, 17, '', `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Status : expected no message`);
            assertCell(sheet, data as string[][], 8, 18, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 8, 19, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 9 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 9, 17, '', `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Status : expected no message`);
            assertCell(sheet, data as string[][], 9, 18, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Cost Basis : expected no cost basis`);
            assertCell(sheet, data as string[][], 9, 19, 0, `Round ${round} Test for Second...Nth Unsold Lot : Row 10 Gain(Loss) : expected no gain`);
            assertCell(sheet, data as string[][], 10, 17, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 11 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 10, 18, '1000.00', `Round ${round} Test for Short-Term Sale : Row 11 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 10, 19, '-500.00', `Round ${round} Test for Short-Term Sale : Row 11 Gain(Loss) : expected 500 loss`, 2);
            assertCell(sheet, data as string[][], 11, 17, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 12 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 11, 18, '1000.00', `Round ${round} Test for Short-Term Sale : Row 12 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 11, 19, '0.00', `Round ${round} Test for Short-Term Sale : Row 12 Gain(Loss) : expected 0 gain`, 2);
            assertCell(sheet, data as string[][], 12, 17, 'Short-term', `Round ${round} Test for Short-Term Sale : Row 13 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 12, 18, '1000.00', `Round ${round} Test for Short-Term Sale : Row 13 Cost Basis : expected 1000 cost basis`, 2);
            assertCell(sheet, data as string[][], 12, 19, '1000.00', `Round ${round} Test for Short-Term Sale : Row 13 Gain(Loss) : expected 1000 gain`, 2);

            if (round === 1) { // Will not see split tx notes on subsequent calculations
                const splitNotePart1 = annotations?.shift() ?? '';
                assert(splitNotePart1?.[0], 'E6', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 6`);
                assert(splitNotePart1?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 0.40000000 ${coinName} was sold for $8000.00 and split into rows 6 and 7.`,
                    `Round ${round} Test for Term Split Note : Row 6 Date : expected split into rows 6 and 7`);
                const splitNotePart2 = annotations?.shift() ?? '';
                assert(splitNotePart2?.[0], 'E7', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 7`);
                assert(splitNotePart2?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 0.40000000 ${coinName} was sold for $8000.00 and split into rows 6 and 7.`,
                    `Round ${round} Test for Term Split Note : Row 7 Date : expected split into rows 6 and 7`);
            }
            // Because annotations are sorted as strings, hints for rows 11..13 come before rows 5..7
            const soldNote1 = annotations?.shift() ?? '';
            assert(soldNote1?.[0], 'K11', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 11`);
            assert(soldNote1?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 11 Sold : expected sold from row 4`);
            const soldNote2 = annotations?.shift() ?? '';
            assert(soldNote2?.[0], 'K12', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 12`);
            assert(soldNote2?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 12 Sold : expected sold from row 4`);
            const soldNote3 = annotations?.shift() ?? '';
            assert(soldNote3?.[0], 'K13', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 13`);
            assert(soldNote3?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 13 Sold : expected sold from row 4`);
            const soldNote4 = annotations?.shift() ?? '';
            assert(soldNote4?.[0], 'K5', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 5`);
            assert(soldNote4?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3`);
            const soldNote5 = annotations?.shift() ?? '';
            assert(soldNote5?.[0], 'K6', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 6`);
            assert(soldNote5?.[1], 'Sold lot from row 3 on 2017-01-01.', `Round ${round} Test for Lot Sold Hint : Row 6 Sold : expected sold from row 3`);
            const soldNote6 = annotations?.shift() ?? '';
            assert(soldNote6?.[0], 'K7', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 7`);
            assert(soldNote6?.[1], 'Sold lot from row 4 on 2018-02-01.', `Round ${round} Test for Lot Sold Hint : Row 7 Sold : expected sold from row 4`);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test6 for function calculateFIFO(sheet, lots, sales)
 */
export function test6CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST6';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-02-14', '', +201.895927, '', 201.89592700, 25.30, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-13', '', +104.5, '', 104.50000000, 20.25, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-13', '', +5.555556, '', 5.55555600, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-13', '', +5.555556, '', 5.55555600, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-13', '', +5.555556, '', 5.55555600, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-13', '', +38.888889, '', 38.88888900, 7.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-30', '', +3.559688, '', 3.55968800, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-30', '', +3.562383, '', 3.56238300, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-30', '', +3.562935, '', 3.56293500, 1.00, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-03-30', '', +24.936634, '', 24.93663400, 6.98, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-04-09', '', +14.25, '', 14.25000000, 4.14, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-05-09', '', +14.25, '', 14.25000000, 4.22, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-06-10', '', +19.0, '', 19.00000000, 6.19, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-09-08', '', +7.6, '', 7.60000000, 1.34, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-10-09', '', +49.4, '', 49.40000000, 10.18, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-11-08', '', +25.65, '', 25.65000000, 6.20, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2019-12-07', '', +43.4625, '', 43.46250000, 8.40, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-01-07', '', +4.5, '', 4.50000000, 0.88, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-02-01', '', +61.910778, '', 61.91077800, 13.76, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-02-09', '', +23.5125, '', 23.51250000, 6.24, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-02-09', '', +20.35, '', 20.35000000, 5.40, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-03-06', '', +22.0564, '', 22.05640000, 5.23, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-03-09', '', +75.7625, '', 75.76250000, 14.54, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-04-06', '', +24.2122, '', 24.21220000, 3.73, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-04-08', '', +25.65, '', 25.65000000, 4.23, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-05-04', '', -829.14, '', 0, 0, 829.14000000, 151.26, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-05-06', '', +16.3796, '', 16.37960000, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-05-09', '', +26.6, '', 26.60000000, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-06-05', '', +6.3, '', 6.30000000, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-06-10', '', +37.780545, '', 37.78054500, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2020-07-07', '', +5.094, '', 5.09400000, 0, 0, 0, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            for (let j = 2; j < 27; j++) {
                assertCell(sheet, data as string[][], j, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Status : expected 100% sold`);
                assertCell(sheet, data as string[][], j, 18, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Cost Basis : expected no cost basis`, 2);
                assertCell(sheet, data as string[][], j, 19, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Gain(Loss) : expected no gain`, 2);
            }
            assertCell(sheet, data as string[][], 27, 17, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 28 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 27, 18, '69.67', `Round ${round} Test for Split into Long-Term Sale : Row 28 Cost Basis : expected $69.67 cost basis`, 2);
            assertCell(sheet, data as string[][], 27, 19, '5.46', `Round ${round} Test for Split into Long-Term Sale : Row 28 Gain(Loss) : expected $5.46 gain`, 2);
            assertCell(sheet, data as string[][], 28, 17, 'Short-term', `Round ${round} Test for Split into Short-Term Sale : Row 29 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 28, 18, '90.54', `Round ${round} Test for Split into Short-Term Sale : Row 29 Cost Basis : expected $90.54 cost basis`, 2);
            assertCell(sheet, data as string[][], 28, 19, '-14.41', `Round ${round} Test for Split into Short-Term Sale : Row 29 Gain(Loss) : expected $(14.41) gain`, 2);
            for (let k = 29; k < 34; k++) {
                assertCell(sheet, data as string[][], k, 17, '', `Round ${round} Test for Unsold Lot : Row ${k} Status : expected no message`);
                assertCell(sheet, data as string[][], k, 18, '0.00', `Round ${round} Test for Unsold Lot : Row ${k} Cost Basis : expected no cost basis`, 2);
                assertCell(sheet, data as string[][], k, 19, '0.00', `Round ${round} Test for Unsold Lot : Row ${k} Gain(Loss) : expected no gain`, 2);
            }

            if (round === 1) { // Will not see split tx notes on subsequent calculations
                const splitNotePart1 = annotations?.shift() ?? '';
                assert(splitNotePart1?.[0], 'E28', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 28`);
                assert(splitNotePart1?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 829.14000000 ${coinName} was sold for $151.26 and split into rows 28 and 29.`,
                    `Round ${round} Test for Term Split Note : Row 28 Date : expected split into rows 28 and 29`);
                const splitNotePart2 = annotations?.shift() ?? '';
                assert(splitNotePart2?.[0], 'E29', `Round ${round} Test for Original Data Before Split Hint : Hint Anchor point on row 29`);
                assert(splitNotePart2?.[1]?.replace(/ *\([^)]*\) */g, ' '), `Originally 829.14000000 ${coinName} was sold for $151.26 and split into rows 28 and 29.`,
                    `Round ${round} Test for Term Split Note : Row 29 Date : expected split into rows 28 and 29`);
            }
            const soldNote1 = annotations?.shift() ?? '';
            assert(soldNote1?.[0], 'K28', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 28`);
            assert(soldNote1?.[1], 'Sold lots from row 3 on 2019-02-14 to row 13 on 2019-04-09.', `Round ${round} Test for Lot Sold Hint : Row 28 Sold : expected sold from row 3 to 13`);
            const soldNote2 = annotations?.shift() ?? '';
            assert(soldNote2?.[0], 'K29', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 29`);
            assert(soldNote2?.[1], 'Sold lots from row 14 on 2019-05-09 to row 27 on 2020-04-08.', `Round ${round} Test for Lot Sold Hint : Row 29 Sold : expected sold from row 14 to 27`);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * test7 for function calculateFIFO(sheet, lots, sales)
 */
export function test7CostBasis(): UnitTestWrapper {
    return (): void => {
        const coinName = 'CB_TEST7';
        const sheet = createTempSheet(coinName);
        const data: CompleteDataRow[] = [
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '', '', 0, '', 0, 0, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-10-27', 'Mining', +0.10348353, '', 0.10348353, 0.23, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-10-28', 'Mining', +0.01205424, '', 0.01205424, 0.02, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-10-31', 'Mining', +0.10012453, '', 0.10012453, 0.19, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-02', 'Mining', +0.10260444, '', 0.10260444, 0.18, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-04', 'Mining', +0.07621054, '', 0.07621054, 0.14, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-07', 'Mining', +0.10091816, '', 0.10091816, 0.18, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-10', 'Mining', +0.10321628, '', 0.10321628, 0.18, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-11', 'Mining', +0.04484832, '', 0.04484832, 0.08, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-13', 'Mining', +0.10099363, '', 0.10099363, 0.15, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2018-11-18', 'Mining', +0.06530715, '', 0.06530715, 0.09, 0, 0, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2021-01-17', 'Spent', -0.80975982, '', 0, 0, 0.80975982, 0.09, '', '', '', '', '', '', 0, 0, ''],
            ['FALSE', '', '', '', '2021-01-17', 'Tx Fee', -0.000001, '', 0, 0, 0.00000100, 0.00, '', '', '', '', '', '', 0, 0, '']];

        const testRun = function (round: number): void {
            const annotations = callCalculateFIFO(sheet, coinName, data, round);

            for (let j = 2; j < 12; j++) {
                assertCell(sheet, data as string[][], j, 17, '100% Sold', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Status : expected 100% sold`);
                assertCell(sheet, data as string[][], j, 18, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Cost Basis : expected no cost basis`, 2);
                assertCell(sheet, data as string[][], j, 19, '0.00', `Round ${round} Test for Lot Sold In Full Later : Row ${j} Gain(Loss) : expected no gain`, 2);
            }
            assertCell(sheet, data as string[][], 12, 17, 'Long-term', `Round ${round} Test for Split into Long-Term Sale : Row 28 Status : expected long-term cost basis`);
            assertCell(sheet, data as string[][], 12, 18, '1.44', `Round ${round} Test for Split into Long-Term Sale : Row 28 Cost Basis : expected $1.44 cost basis`, 2);
            assertCell(sheet, data as string[][], 12, 19, '-1.35', `Round ${round} Test for Split into Long-Term Sale : Row 28 Gain(Loss) : expected $(1.35) loss`, 2);
            assertCell(sheet, data as string[][], 13, 17, 'Long-term', `Round ${round} Test for Split into Short-Term Sale : Row 29 Status : expected short-term cost basis`);
            assertCell(sheet, data as string[][], 13, 18, '0.00', `Round ${round} Test for Split into Short-Term Sale : Row 29 Cost Basis : expected no cost basis`, 2);
            assertCell(sheet, data as string[][], 13, 19, '-0.00', `Round ${round} Test for Split into Short-Term Sale : Row 29 Gain(Loss) : expected no gain`, 2);

            const soldNote1 = annotations?.shift() ?? '';
            assert(soldNote1?.[0], 'K13', `Round ${round} Test for Lot Sold Hint : Hint Anchor point on row 13`);
            assert(soldNote1?.[1], 'Sold lots from row 3 on 2018-10-27 to row 12 on 2018-11-18.', `Round ${round} Test for Lot Sold Hint : Row 5 Sold : expected sold from row 3 thru row 12`);
        };

        fillInTempSheet(sheet, data as string[][]);
        testRun(1);
        testRun(2);

        deleteTempSheet(sheet);
    };
}

/**
 * Used for Local testing of the FIFO Calculation function outside of the spreadsheet context
 *
 */
function callCalculateFIFO(sheet: GoogleAppsScript.Spreadsheet.Sheet | null, coinName: string, data: CompleteDataRow[], round = 1): string[][] {
    let annotations: string[][] = [];
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

        // clone the data array, and trim down to data needed for cost basis calc
        const lotData = [...validationData];
        lotData.forEach((row, rowIdx) => { lotData[rowIdx] = [...row]; });
        lotData.forEach(row => row.splice(6, 2)); // split out and remove sales
        lotData.forEach(row => row.splice(0, 4)); // remove leftmost date, category, FMV strategy and net change columns from lots
        lotData.forEach(row => row.splice(2, row.length - 2)); // remove all remaining columns to the right
        const salesData = [...validationData];
        salesData.forEach((row, rowIdx) => { salesData[rowIdx] = [...row]; });
        salesData.forEach(row => row.splice(0, 6)); // split out and remove date, category, FMV strategy, net change and lot columns
        salesData.forEach(row => row.splice(2, row.length - 2)); // remove all remaining columns to the right

        // make an empty 2D array same size and shape as the data array, to represent formulas
        const formulaData = data.map(x => x.map(() => '')) as FormulaDataRow[];

        // do the cost basis calc
        const lots = getOrderList(dateDisplayValues as [string][], lastRow, lotData as unknown as [number, number][]);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, salesData as unknown as [number, number][]);
        annotations = calculateFIFO(coinName, data, formulaData, lots, sales);
    } else if (sheet !== null) {
        // QUnit unit test
        assert((validate(sheet.getRange('E:L').getValues() as DataValidationRow[]) === ''), true, `Round ${round} Data validated`);
        const dateDisplayValues = sheet.getRange('E:E').getDisplayValues();
        const lastRow = getLastRowWithDataPresent(dateDisplayValues);
        const lots = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('I:J').getValues() as [number, number][]);
        const sales = getOrderList(dateDisplayValues as [string][], lastRow, sheet.getRange('K:L').getValues() as [number, number][]);

        // make an empty 2D array same size and shape as the data array, to represent formulas
        const formulaData = data.map(x => x.map(() => '')) as FormulaDataRow[];

        annotations = calculateFIFO(coinName, data, formulaData, lots, sales);
        fillInTempSheet(sheet, data as string[][]);
    }
    annotations.sort((e1, e2) => { if (e1[0] < e2[0]) { return -1; } if (e1[0] > e2[0]) { return 1; } return 0; });
    return annotations;
}
