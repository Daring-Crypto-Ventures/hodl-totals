// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { showNewCurrencyPrompt } from './menu';

/**
 * jest unit tests for menus
 *
 */
describe('Menu UI unit tests', testMenus());

function testMenus(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test currency prompt dialog fails during local execution', () => {
                expect(showNewCurrencyPrompt()).toBe(null);
            });
        }
    };
}
