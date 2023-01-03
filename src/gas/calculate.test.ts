// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { calculateCoinGainLoss } from './calculate';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for calculating cost basis
 *
 */
describe('Formatting UI unit tests', testCalculate());

function testCalculate(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Expecting Google Sheet formatting to fail during local execution', () => {
                expect(calculateCoinGainLoss(null)).toBe(null);
            });
        }
    };
}
