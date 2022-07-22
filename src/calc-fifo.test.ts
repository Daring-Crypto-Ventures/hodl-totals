// import { expect, test } from '@jest/globals';
import {
    test1CostBasis /* ,
    test2CostBasis,
    test3CostBasis,
    test4CostBasis,
    test5CostBasis,
    test6CostBasis,
    test7CostBasis */
} from '../tests/cost-basis.spec';

/* eslint-disable jest/valid-describe-callback */
/* eslint-disable jest/no-commented-out-tests */

/**
 * jest unit tests for calculateFIFO()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
describe('Cost Basis - Simple Partial Short-Term Sale (Two Rounds)', test1CostBasis());
/* describe('Cost Basis - Simple Whole Long-Term Sale (Two Rounds)', test2CostBasis());
describe('Cost Basis - Simple Term Split (Two Rounds)', test3CostBasis());
describe('Cost Basis - No Sale (Two Rounds)', test4CostBasis());
describe('Cost Basis - Example Dataset (One Round)', test5CostBasis());
describe('Cost Basis - Real Data with Term Split (One Round)', test6CostBasis());
describe('Cost Basis - Simple Calc with all coins sold (Two Round)', test7CostBasis());
*/
