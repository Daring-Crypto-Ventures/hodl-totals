// import { expect, test } from '@jest/globals';
import { test4CostBasis, test5CostBasis, test6CostBasis, test7CostBasis, test8CostBasis, test9CostBasis } from '../tests/cost-basis.spec';

/**
 * jest unit tests for calculateFIFO()
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
describe('test4 - Cost Basis - Simple Partial Short-Term Sale (Two Rounds)', test4CostBasis());
describe('test5 - Cost Basis - Simple Whole Long-Term Sale (Two Rounds)', test5CostBasis());
describe('test6 - Cost Basis - Simple Term Split (Two Rounds)', test6CostBasis());
describe('test7 - Cost Basis - No Sale (Two Rounds)', test7CostBasis());
describe('test8 - Cost Basis - Example Dataset (One Round)', test8CostBasis());
describe('test9 - Cost Basis - Real Data with Term Split (One Round)', test9CostBasis());
