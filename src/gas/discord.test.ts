// import { expect, test } from '@jest/globals';
import { unitTestWrapper } from '../../tests/utils.test';
import openDiscordLink_ from './discord';

/**
 * jest unit tests for menus
 *
 */
describe('Link to Discord unit tests', testDiscordLink());

function testDiscordLink(): unitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            test('Test redirect to Discord Invite Link fails during local execution', () => {
                const mock = jest.fn(openDiscordLink_);
                mock();
                expect(mock).toHaveReturned();
            });
        }
    };
}
