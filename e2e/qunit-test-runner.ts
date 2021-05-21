import { test1DataValidation, test2DataValidation, test3DataValidation } from '../tests/validate.spec';
import testCostBasisFunctions from './cost-basis';

/**
 * First make sure the deploymentId for your script is set correclty in package.json
 * Then run Qunit Test Cases from the cmd prompt using the npm command:
 *    npm run test:e2e
 *
 * Default browser will open to a test results page is displayed.
 */
/* global QUnit, Logger, LockService */
/* eslint no-undef: 1 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
QUnit.helpers(this);

/**
 * Tests for Cost Basis columns, cacluations, term-splitting and formatting.
 *
 */
function testValidationFunctions(): void {
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('test1 - Data Validation - Date Out of Order', test1DataValidation());
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('test2 - Data Validation - Coin Oversold', test2DataValidation());
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.test('test3 - Data Validation - Buy and Sell on Same Line', test3DataValidation());
}

function doGet(request) {
    const suiteTitle = 'E2E Test Suite for HODL Totals';
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.urlParams(request.parameter);
    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.config({ title: suiteTitle });
    Logger.log(`Running ${suiteTitle}...`);

    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    QUnit.load(() => {
        try {
            const lock = LockService.getUserLock();
            if (lock.tryLock(1200000)) { // currently using 120 sec to be safe
                testValidationFunctions(); // E2E test of spreadsheet data validation rules (PREREQs for FIFO calculation)
                testCostBasisFunctions(); // E2E test of cost basis functions in spreadsheet context
                // testFairMktValueFunctions(); // E2E test of FMV functions in spreadsheet context.

                // done with important spreadsheet stuff, release the lock
                lock.releaseLock();
            } else {
                Logger.log('FAILED - No Lock, Lock timed out');
            }
        } catch (exc) {
            Logger.log(`Exception! FAILED ${exc.message}`);
        }

        // log test results to the stackdriver logs
        // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
        QUnit.testDone(details => {
            const result = {
                'Module name': details.module,
                'Test name': details.name,
                Assertions: {
                    Total: details.total,
                    Passed: details.passed,
                    Failed: details.failed
                },
                Skipped: details.skipped,
                Todo: details.todo,
                Runtime: details.runtime
            };
            // only log the most critical info to keep the stackdriver log short
            Logger.log(`${result['Test name']}\n${result.Assertions.Passed} passed, ${result.Assertions.Failed} failed, out of ${result.Assertions.Total} assertion(s).`);
            // uncomment to bubble up all information to the stackdriver log
            // Logger.log(JSON.stringify( result, null, 2 ) );
        });
    });

    Logger.log('Test Suite Completed');

    // @ts-expect-error Cannot find name QUnit as no type declarations exist for this library, name is present when loaded in GAS
    return QUnit.getHtml();
}
