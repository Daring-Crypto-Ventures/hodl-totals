/// <reference path="../types/qunit.d.ts" />
import {
    test1DataValidation,
    test2DataValidation,
    test3DataValidation,
    test4DataValidation
} from '../tests/validate.spec';
import {
    test1CostBasis,
    test2CostBasis,
    test3CostBasis,
    test4CostBasis,
    test5CostBasis,
    test6CostBasis,
    test7CostBasis,
    test8CostBasis
} from '../tests/cost-basis.spec';
import { test1FMV, test2FMV } from '../tests/formulas.spec';
import { version } from '../src/version';

/**
 * First make sure the deploymentId for your script is set correclty in package.json
 * Then run Qunit Test Cases from the cmd prompt using the npm command:
 *    npm run test:e2e
 *
 * Default browser will open to a test results page is displayed.
 */
/* global Logger, LockService */
/* eslint no-undef: 1 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

QUnit.helpers(this as unknown as Object);

/**
 * Tests for column validation, coin insanities and row formatting issues.
 *
 */
function testValidationFunctions() {
    QUnit.test('Data Validation - Date Out of Order', test1DataValidation());
    QUnit.test('Data Validation - Coin Oversold', test2DataValidation());
    QUnit.test('Data Validation - Buy and Sell on Same Line', test3DataValidation());
    QUnit.test('Data Validation - Test for Out of Range Date', test4DataValidation());
}

/**
 * Tests for Cost Basis columns, cacluations, term-splitting and formatting.
 *
 */
function testCostBasisFunctions() {
    QUnit.test('Cost Basis - Simple Partial Short-Term Sale (Two Rounds)', test1CostBasis());
    QUnit.test('Cost Basis - Simple Whole Long-Term Sale (Two Rounds)', test2CostBasis());
    QUnit.test('Cost Basis - Simple Term Split (Two Rounds)', test3CostBasis());
    QUnit.test('Cost Basis - No Sale (Two Rounds)', test4CostBasis());
    QUnit.test('Cost Basis - Example Dataset (Two Rounds)', test5CostBasis());
    QUnit.test('Cost Basis - Real Data with Term Split (Two Rounds)', test6CostBasis());
    QUnit.test('Cost Basis - Simple Calc with all coins sold (Two Round)', test7CostBasis());
    QUnit.test('Cost Basis - Example Dataset with Extreme Values (One Round)', test8CostBasis());
}

/**
 * Tests for Fair Market Value columns, cacluations and formatting.
 *
 */

function testFairMktValueFunctions() {
    QUnit.test('Fair Market Value - Example Dataset', test1FMV());
    QUnit.test('Fair Market Value - Strategies', test2FMV());
}

/**
 * Web app callback that will execute the QUnit tests and return test results in the browser
 *
 */
export function doGet(request) {
    const suiteTitle = `v${version} HODL Totals E2E Test Suite`;
    QUnit.urlParams(request.parameter);
    QUnit.config({ title: suiteTitle });
    Logger.log(`Running ${suiteTitle}...`);

    QUnit.load(() => {
        try {
            const lock = LockService.getUserLock();
            if (lock.tryLock(1200000)) { // currently using 120 sec to be safe
                testValidationFunctions(); // E2E test of spreadsheet data validation rules (PREREQs for FIFO calculation)
                testCostBasisFunctions(); // E2E test of cost basis functions in spreadsheet context
                testFairMktValueFunctions(); // E2E test of FMV functions in spreadsheet context.

                // done with important spreadsheet stuff, release the lock
                lock.releaseLock();
            } else {
                Logger.log('FAILED - No Lock, Lock timed out');
            }
        } catch (exc) {
            Logger.log(`Exception! FAILED ${exc.message}`);
        }

        // log test results to the stackdriver logs
        QUnit.testDone(details => {
            const result = {
                'Module name': details.module,
                'Test name': details.name,
                Assertions: {
                    Total: details.total,
                    Passed: details.passed,
                    Failed: details.failed
                }
            };
            // only log the most critical info to keep the stackdriver log short
            Logger.log(`${result['Test name']}\n${result.Assertions.Passed} passed, ${result.Assertions.Failed} failed, out of ${result.Assertions.Total} assertion(s).`);
            // uncomment to bubble up all information to the stackdriver log
            // Logger.log(JSON.stringify( result, null, 2 ) );
        });
    });

    Logger.log('Test Suite Completed');

    return QUnit.getHtml();
}
