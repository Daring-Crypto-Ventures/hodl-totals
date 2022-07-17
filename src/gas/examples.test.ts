// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { loadCostBasisExample_, loadFMVExample_ } from './examples';

/**
 * jest unit tests for examples
 *
 */
describe('Examples unit tests', testExamples());

function testExamples(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test example 1 fails during local execution', () => {
                expect(loadCostBasisExample_()).toBe(null);
            });
            it('Test example 2 fails during local execution', () => {
                expect(loadFMVExample_()).toBe(null);
            });
        }
    };
}
