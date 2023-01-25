// import { expect, test } from '@jest/globals';
import { UnitTestWrapper } from '../../tests/utils.test';
import { showNewNFTAddrPrompt } from './new-nft';

/* eslint-disable jest/valid-describe-callback */

/**
 * jest unit tests for the New NFT Sheet Prompt
 *
 */
describe('New NFT Address Prompt unit tests', testNewNFTAddrPrompt());

function testNewNFTAddrPrompt(): UnitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            it('Test new coin prompt dialog fails during local execution', () => {
                expect(showNewNFTAddrPrompt()).toBe(null);
            });
        }
    };
}
