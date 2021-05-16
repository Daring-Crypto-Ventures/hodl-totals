import testValidationFunctions from './column-validation';
import testCostBasisFunctions from './cost-basis';

/**
 * Steps for adding ‘QunitGS2‘ in GAS project
 * http://qunitgs2.com/examples/step-by-step-tutorial
 *
 * code: https://github.com/artofthesmart/QUnitGS2
 *
 * Steps to Run Qunit Test Case:
 * 1. use npm run test:e2e
 * 2. from script in browser:
 * Click on Deploy > Test Deployments
 * Click the Web app URL.
 * It redirects to Qunit page where all test case report is displayed.
 *
 */
/* global QUnitGS2, Logger */
/* eslint no-undef: 1 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Listing of all test suites to run
const TESTS_ = [
    // testValidationFunctions, // E2E test of spreadsheet data validation rules (PREREQs for FIFO calculation)
    testCostBasisFunctions, // E2E test of cost basis functions in spreadsheet context
    // testFairMktValueFunctions, // E2E test of FMV functions in spreadsheet context.
];

function doGet(request) {
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.init();

    const suiteTitle = 'E2E Test Suite for HODL Totals';
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.QUnit.config.title = suiteTitle;
    Logger.log(`Running ${suiteTitle}...`);

    TESTS_.forEach(testFunction => {
        try {
            const lock = LockService.getUserLock();
            if (lock.tryLock(600000)) { // currently using 60 sec to be safe
                testFunction();
                // done important spreadsheet stuff, release the lock
                lock.releaseLock();
            } else {
                Logger.log('FAILED - No Lock, Lock timed out');
            }
        } catch (exc) {
            Logger.log(`Exception! FAILED ${exc.message}`);
        }
    });

    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    QUnitGS2.QUnit.start();

    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    return QUnitGS2.getHtml().setTitle(suiteTitle);
}

/**
 * Populates the results webpage with results
 */
function getResultsFromServer() {
    // @ts-expect-error Cannot find name QUnitGS2 as no type declarations exist for this library, name is present when loaded in GAS
    const resultStr = QUnitGS2.getResultsFromServer();
    const result = (resultStr === null) ? [] : JSON.parse(resultStr);
    const search = what => result.find(element => element.type === what);
    const results = search('TESTS_RESULTS_ALL');

    if (results) {
        Logger.log(`${results.value.passed} passed, ${results.value.failed} failed, out of ${results.value.total} assertion(s).`);
        Logger.log('Test Suite Completed');
    } else {
        // uncomment to bubble up all information to the stackdriver log
        // Logger.log(resultStr);
        Logger.log('One or more test failures caused the E2E Test Suite to not complete.');
    }

    return resultStr;
}
