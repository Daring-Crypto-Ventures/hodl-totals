// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import openDiscordLink from './discord';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for menus
 *
 */
describe('Link to Discord unit tests', testDiscordLink());

function testDiscordLink(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test redirect to Discord Invite Link fails during local execution', () => {
                const mock = jest.fn(openDiscordLink);
                mock();
                expect(mock).toHaveReturned();
            });
        }
    };
}
