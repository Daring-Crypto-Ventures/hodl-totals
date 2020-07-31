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
function testFunctions() {
  
  test4_CostBasis();
}
 
function doGet( e ) {
  QUnit.urlParams( e.parameter );
  QUnit.config({
    title: "QUnit Test Suite for Crypto Tools" // Sets the title of the test page.
  });
  QUnit.load( testFunctions );
 
  return QUnit.getHtml();
};
 
/** 
 * test4 for function calculateFifo(sheet, lots, sales)
 */
function test4_CostBasis(){
  QUnit.test( "Cost Basis Calculation (FIFO) - test4", function() {
    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test4:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);
    
    // test data for this test case
    var initialData = [['2017-01-01','1.0','1000','',''],
                       ['2017-01-03','','','0.5','1000']];
    
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':E'+(i+3)).setValues([initialData[i]]);
    }
    
    // mimic calculateFIFO_() 
    if (validate(sheet)) {
    
      var lots = getLots(sheet);
      var sales = getSales(sheet);
    
      calculateFifo(sheet, lots, sales);
      
      // output the current date and time as the time last completed
      var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
      sheet.getRange('I1').setValue('Last calculation succeeded '+now);
          
    } else {
      
      var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
      sheet.getRange('I1').setValue('Data validation failed '+now);
    }
    
    // check if test passed or failed
    expect(4);
    equal( sheet.getRange('F3').getValue(), "50% Sold", "Test for Partial Short-Term Sale : Row 3 Status : expected short-term 500 cost basis" );
    equal( sheet.getRange('F4').getValue(), "Short-term", "Test for Partial Short-Term Sale : Row 4 Status : expected short-term 500 cost basis" );
    equal( sheet.getRange('G4').getValue(), 500, "Test for Partial Short-Term Sale : Row 4 Cost Basis : expected short-term 500 cost basis" );
    equal( sheet.getRange('H4').getValue(), 500, "Test for Partial Short-Term Sale : Row 4 Gain(Loss) : expected short-term 500 gain" );
    
    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}
