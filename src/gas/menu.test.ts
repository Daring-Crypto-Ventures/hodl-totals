// import { expect, test } from '@jest/globals';
import { unitTestWrapper } from '../../tests/utils.test';
import { showNewCurrencyPrompt } from './menu';

/**
 * jest unit tests for menus
 *
 */
describe('Menu UI unit tests', testMenus());

function testMenus(): unitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            test('Test currency prompt dialog fails during local execution', () => {
                expect(showNewCurrencyPrompt()).toBe(null);
            });
        }
    };
}
