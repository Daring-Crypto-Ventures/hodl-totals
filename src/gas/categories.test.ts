// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { newCategorySheet, newNFTCategorySheet } from './categories';

/* eslint-disable jest/valid-describe-callback */

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
            it('Test new NFT category sheet fails during local execution', () => {
                expect(newNFTCategorySheet()).toBe(null);
            });
        }
    };
}
