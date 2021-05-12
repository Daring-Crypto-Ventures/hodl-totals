/**
 * From https://www.tothenew.com/blog/how-to-test-google-apps-script-using-qunit/
 *
 * Steps for adding ‘Qunit‘ in project
 *
 * Go to script editor.
 * Select “Libraries" in the Google Apps Script editor.
 * Enter this project key (MxL38OxqIK-B73jyDTvCe-OBao7QLBR4j) in the “Find a Library” field, and choose “Select”.
 * Select version number 4, and choose QUnit as the identifier. (Do not turn on Development Mode)
 * Press Save.
 *
 * Steps to Run Qunit Test Case
 *
 * Click on Deploy > Test Deployments
 * Click the Web app URL.
 * It redirects to Qunit page where all test case report is displayed.
 *
 * TODO - explore more integrated QUnit tests using this project: https://github.com/artofthesmart/QUnitGS2
 *
 */

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
QUnit.helpers(this);

function doGet(e) {
    const suiteTitle = 'E2E Test Suite for HODL Totals';
    QUnit.urlParams(e.parameter);
    QUnit.config({
        title: suiteTitle // Sets the title of the test page.
    });
    Logger.log(`Running ${suiteTitle}...`);
    QUnit.load(() => {
        // testCostBasisFunctions();
        // testFairMktValueFunctions();

        // log test results to the stackdriver logs
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

    // return complete results as HTML report in the browser
    return QUnit.getHtml();
}
