// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import newWalletsSheet from './wallets';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for the wallets sheet
 *
 */
describe('Wallets/Accounts sheet unit tests', testWallets());

function testWallets(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test new wallets/accounts sheet fails during local execution', () => {
                expect(newWalletsSheet()).toBe(null);
            });
        }
    };
}
