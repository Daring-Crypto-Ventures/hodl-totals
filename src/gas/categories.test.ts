// import { expect, test } from '@jest/globals';
import { unitTestWrapper } from '../../tests/utils.test';
import newCategorySheet from './categories';

/**
 * jest unit tests for the category sheet
 *
 */
describe('Category sheet unit tests', testCategories());

function testCategories(): unitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            test('Test new category sheet fails during local execution', () => {
                expect(newCategorySheet()).toBe(null);
            });
        }
    };
}
