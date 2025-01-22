// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { showAboutDialog } from './dialogs';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for menus
 *
 */
describe('About Dialog UI unit tests', testAbout());

function testAbout(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test about dialog fails during local execution', () => {
                const mock = jest.fn(showAboutDialog);
                mock();
                expect(mock).toHaveReturned();
            });
        }
    };
}
