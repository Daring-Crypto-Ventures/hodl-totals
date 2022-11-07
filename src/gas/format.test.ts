// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { formatSheet } from './format';

/**
 * jest unit tests for formatting
 *
 */
describe('Formatting UI unit tests', testFormat());

function testFormat(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Expecting Google Sheet formatting to fail during local execution', () => {
                expect(formatSheet()).toBe(null);
            });
        }
    };
}
