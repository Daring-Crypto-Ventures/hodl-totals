// import { expect, test } from '@jest/globals';
import { test1DataValidation, test2DataValidation, test3DataValidation } from '../tests/validate.spec';

/**
 * jest unit tests for validate()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
describe('Data Validation - Date Out of Order', test1DataValidation());
describe('Data Validation - Coin Oversold', test2DataValidation());
describe('Data Validation - Buy and Sell on Same Line', test3DataValidation());
