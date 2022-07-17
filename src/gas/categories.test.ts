// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import newCategorySheet from './categories';

/**
 * jest unit tests for the category sheet
 *
 */
describe('Category sheet unit tests', testCategories());

function testCategories(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test new category sheet fails during local execution', () => {
                expect(newCategorySheet()).toBe(null);
            });
        }
    };
}
