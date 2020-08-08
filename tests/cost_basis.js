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
  test0_CostBasis();  
  test4_CostBasis();
  test6_CostBasis();
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
 * test0 for function calculateFifo(sheet, lots, sales)
 */
function test0_CostBasis() {
  QUnit.test( "Cost Basis Calculation (FIFO) - test0", function() {
    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test0:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);
    
    // test data for this test case
    var initialData = [['2017-01-01','0.2','2000','',''],
                       ['2018-02-01','0.6','6000','',''],
                       ['2018-02-01','','','0.1','2000'],
                       ['2018-03-01','','','0.4','8000'],
                       ['2018-03-02','0.4','4000','',''],
                       ['2018-03-03','0.8','8000','',''],
                       ['2018-03-04','0.6','6000','',''],
                       ['2018-03-05','','','0.1','500'],
                       ['2018-03-06','','','0.1','1000'],
                       ['2018-03-07','','','0.1','2000']];
    
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
    expect(11);
    equal( sheet.getRange('F3').getValue(), "100% Sold", "Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold" );
    equal( sheet.getRange('F4').getValue(), "100% Sold", "Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold" );

    equal( sheet.getRange('F5').getValue(), "Long-term", "Test for Long-Term Sale : Row 5 Status : expected long-term 1000 cost basis" );
    equal( sheet.getRange('G5').getValue(), 1000, "Test for Long-Term Sale : Row 5 Cost Basis : expected long-term 1000 cost basis" );
    equal( sheet.getRange('H5').getValue(), 1000, "Test for Long-Term Sale : Row 5 Gain(Loss) : expected long-term 1000 gain" );
    
    equal( sheet.getRange('F6').getValue(), "Long-term", "Test for Split into Long-Term Sale : Row 6 Status : expected long-term 1000 cost basis" );
    equal( sheet.getRange('G6').getValue(), 1000, "Test for Split into Long-Term Sale : Row 6 Cost Basis : expected long-term 1000 cost basis" );
    equal( sheet.getRange('H6').getValue(), 1000, "Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected long-term 1000 gain" );
    // also check the NOTE content...
    // "Split into (rows 6 and 7). Amount of coin sold was 0.40000000, and original amount was $8000.00."

    equal( sheet.getRange('F7').getValue(), "Short-term", "Test for Split into Short-Term Sale : Row 7 Status : expected short-term 1000 cost basis" );
    equal( sheet.getRange('G7').getValue(), 3000, "Test for Split into Short-Term Sale : Row 7 Cost Basis : expected short-term 3000 cost basis" );
    equal( sheet.getRange('H7').getValue(), 3000, "Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected short-term 3000 gain" );
    // also check the NOTE content...
    // "Sale split into (rows 6 and 7). Original amount of coin sold was 0.40000000, and original amount was $8000.00."

    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}


/** 
 * test4 for function calculateFifo(sheet, lots, sales)
 */
function test4_CostBasis() {
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

/*
2017-01-01	1.00000000	$1,000.00		
2018-01-01	1.00000000	$1,000.00		
2018-07-01			2.00000000	$4,000.00
*/

/** 
 * test6 for function calculateFifo(sheet, lots, sales)
 */
function test6_CostBasis() {
  QUnit.test( "Cost Basis Calculation (FIFO) - test6", function() {
    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test6:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);
    
    // test data for this test case
    var initialData = [['2017-01-01','1.0','1000','',''],
                       ['2018-01-01','1.0','1000','',''],
                       ['2018-07-01','','','2.0','4000']];
    
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
    expect(8);
    equal( sheet.getRange('F3').getValue(), "100% Sold", "Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold" );
    equal( sheet.getRange('F4').getValue(), "100% Sold", "Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold" );

    equal( sheet.getRange('F5').getValue(), "Long-term", "Test for Split into Long-Term Sale : Row 6 Status : expected long-term 1000 cost basis" );
    equal( sheet.getRange('G5').getValue(), 1000, "Test for Split into Long-Term Sale : Row 6 Cost Basis : expected long-term 1000 cost basis" );
    equal( sheet.getRange('H5').getValue(), 1000, "Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected long-term 1000 gain" );
    // also check the NOTE content...
    // "Split into (rows 5 and 6). Amount of coin sold was 2.00000000, and original amount was $4000.00."

    equal( sheet.getRange('F6').getValue(), "Short-term", "Test for Split into Short-Term Sale : Row 7 Status : expected short-term 1000 cost basis" );
    equal( sheet.getRange('G6').getValue(), 1000, "Test for Split into Short-Term Sale : Row 7 Cost Basis : expected short-term 1000 cost basis" );
    equal( sheet.getRange('H6').getValue(), 1000, "Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected short-term 1000 gain" );
    // also check the NOTE content...
    // "Sale split into (rows 5 and 6). Original amount of coin sold was 2.00000000, and original amount was $4000.00."
    
    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}
