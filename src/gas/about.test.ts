// import { expect, test } from '@jest/globals';
import { unitTestWrapper } from '../../tests/utils.test';
import showAboutDialog_ from './about';

/**
 * jest unit tests for menus
 *
 */
describe('About Dialog UI unit tests', testAbout());

function testAbout(): unitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            test('Test about dialog fails during local execution', () => {
                const mock = jest.fn(showAboutDialog_);
                mock();
                expect(mock).toHaveReturned();
            });
        }
    };
}
