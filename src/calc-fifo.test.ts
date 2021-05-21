// import { expect, test } from '@jest/globals';
import { test8CostBasis, test9CostBasis } from '../tests/cost-basis.spec';
// TODO test4CostBasis, test5CostBasis, test6CostBasis, test7CostBasis

/**
 * jest unit tests for calculateFIFO()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
test('test8 - Cost Basis - Example Dataset (One Round)', test8CostBasis());
test('test9 - Cost Basis - Real Data with Term Split (One Round)', test9CostBasis());
