// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { formatNFTSheet } from './format-nft';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for formatting NFT sheets
 *
 */
describe('Formatting NFT UI unit tests', testFormatNFT());

function testFormatNFT(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Expecting Google Sheets™ API formatting to fail during local execution', () => {
                expect(formatNFTSheet(null)).toBe(null);
            });
        }
    };
}
