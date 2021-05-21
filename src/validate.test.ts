// import { expect, test } from '@jest/globals';
import { test1DataValidation, test2DataValidation, test3DataValidation } from '../tests/validate.spec';

/**
 * jest unit tests for validate()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
test('test1 - Data Validation - Date Out of Order', test1DataValidation());
test('test2 - Data Validation - Coin Oversold', test2DataValidation());
test('Cost Basis test3 - Data Validation - Buy and Sell on Same Line', test3DataValidation());
