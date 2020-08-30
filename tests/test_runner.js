/**
 * From https://www.tothenew.com/blog/how-to-test-google-apps-script-using-qunit/
 *
 * Steps for adding ‘Qunit‘ in project
 * 
 * Go to script editor.
 * Select “Resources” > “Libraries…” in the Google Apps Script editor.
 * Enter this project key (MxL38OxqIK-B73jyDTvCe-OBao7QLBR4j) in the “Find a Library” field, and choose “Select”.
 * Select version number 4, and choose QUnit as the identifier. (Do not turn on Development Mode)
 * Press Save.
 *
 * Steps to Run Qunit Test Case
 * 
 * Click on Publish> Deploy as web app.
 * Deploy as web app
 * Click on Deploy.
 * Click on latest code. It redirects to Qunit page where all test case report is displayed.
 *
 */

QUnit.helpers( this );

function doGet( e ) {
  QUnit.urlParams( e.parameter );
  QUnit.config({
    title: "QUnit Test Suite for HODL Totals" // Sets the title of the test page.
  });
  QUnit.load( function () {
        testCostBasisFunctions();
        testFairMktValueFunctions();
    });
 
  return QUnit.getHtml();
};
