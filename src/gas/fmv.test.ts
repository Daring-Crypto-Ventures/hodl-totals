// import { expect, test } from '@jest/globals';
import { test1FMV, test2FMV } from '../../tests/fmv.spec';

/**
 * jest unit tests for calculateFIFO()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
describe('Fair Market Value - Example Dataset (One Round)', test1FMV());
describe('Fair Market Value - Strategies (One Round)', test2FMV());