// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import showNewCoinPrompt from './new-coin';

/**
 * jest unit tests for the New Coin Prompt
 *
 */
describe('New Coin Prompt unit tests', testNewCoinPrompt());

function testNewCoinPrompt(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test new coin prompt dialog fails during local execution', () => {
                expect(showNewCoinPrompt()).toBe(null);
            });
        }
    };
}
