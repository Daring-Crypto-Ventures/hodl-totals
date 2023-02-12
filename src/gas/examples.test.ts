// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { loadExample } from './examples';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for examples
 *
 */
describe('Examples unit tests', testExamples());

function testExamples(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test example 2 fails during local execution', () => {
                expect(loadExample()).toBe(null);
            });
        }
    };
}
