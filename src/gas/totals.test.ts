// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import resetTotalSheet from './totals';

/**
 * jest unit tests for the category sheet
 *
 */
describe('Totals sheet unit tests', testTotals());

function testTotals(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test new totals sheet fails during local execution', () => {
                expect(resetTotalSheet()).toBe(null);
            });
        }
    };
}
