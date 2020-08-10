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
  test5_CostBasis();
  test7_CostBasis();
  test8_CostBasis();  
  test9_CostBasis();
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
 * test5 for function calculateFifo(sheet, lots, sales)
 */
function test5_CostBasis() {
  QUnit.test( "test5 - Simple Partial Sale - Two Rounds", function() {
    // test data for this test case
    var initialData = [['2017-01-01','1.0','1000','',''],
                       ['2017-01-03','','','0.5','1000']];

    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test5:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);
    
    var TestRun = function (round) {
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
      equal( sheet.getRange('F3').getValue(), "50% Sold", "Round "+round+" Test for Partial Short-Term Sale : Row 3 Status : expected short-term 500 cost basis" );
      // TODO test that the rest are empty!
      equal( sheet.getRange('F4').getValue(), "Short-term", "Round "+round+" Test for Partial Short-Term Sale : Row 4 Status : expected short-term 500 cost basis" );
      equal( sheet.getRange('G4').getValue().toFixed(2), 500.00, "Round "+round+" Test for Partial Short-Term Sale : Row 4 Cost Basis : expected short-term 500 cost basis" );
      equal( sheet.getRange('H4').getValue().toFixed(2), 500.00, "Round "+round+" Test for Partial Short-Term Sale : Row 4 Gain(Loss) : expected short-term 500 gain" );
    };

    // fill the in the test data
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':E'+(i+3)).setValues([initialData[i]]);
    }

    // run the 4 assumption checks twice, to make sure we get same result each time
    expect(8);
    TestRun(1);
    TestRun(2);
    
    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}

/** 
 * test7 for function calculateFifo(sheet, lots, sales)
 */
function test7_CostBasis() {
  QUnit.test( "test7 - Simple Term Split - Two Rounds", function() {

    // test data for this test case
    var initialData = [['2017-01-01','1.0','1000','',''],
                       ['2018-01-01','1.0','1000','',''],
                       ['2018-07-01','','','2.0','4000']];

    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test7:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);   
    
    var TestRun = function (round) {
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
      equal( sheet.getRange('F3').getValue(), "100% Sold", "Round "+round+" Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold" );
      equal( sheet.getRange('F4').getValue(), "100% Sold", "Round "+round+" Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold" );
      // TODO test that the rest are empty!

      equal( sheet.getRange('F5').getValue(), "Long-term", "Round "+round+" Test for Split into Long-Term Sale : Row 6 Status : expected long-term 1000 cost basis" );
      equal( sheet.getRange('G5').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Long-Term Sale : Row 6 Cost Basis : expected long-term 1000 cost basis" );
      equal( sheet.getRange('H5').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected long-term 1000 gain" );
      // also check the NOTE content...
      // "Split into (rows 5 and 6). Amount of coin sold was 2.00000000, and original amount was $4000.00."

      equal( sheet.getRange('F6').getValue(), "Short-term", "Round "+round+" Test for Split into Short-Term Sale : Row 7 Status : expected short-term 1000 cost basis" );
      equal( sheet.getRange('G6').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Short-Term Sale : Row 7 Cost Basis : expected short-term 1000 cost basis" );
      equal( sheet.getRange('H6').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected short-term 1000 gain" );
      // also check the NOTE content...
      // "Sale split into (rows 5 and 6). Original amount of coin sold was 2.00000000, and original amount was $4000.00."
    };

    // fill the in the test data
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':E'+(i+3)).setValues([initialData[i]]);
    }

    // run the 8 assumption checks twice, as there are two code paths to test when a row split is involved
    expect(16);
    TestRun(1);
    TestRun(2);

    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}

/** 
 * test8 for function calculateFifo(sheet, lots, sales)
 */
function test8_CostBasis() {
  QUnit.test( "test8 - Example Dataset - Two Rounds", function(initialData) {

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
    
    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test8:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

    var TestRun = function (round) {
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
      equal( sheet.getRange('F3').getValue(), "100% Sold", "Round "+round+" Test for Lot Sold In Full Later : Row 3 Status : expected 100% sold" );
      equal( sheet.getRange('F4').getValue(), "100% Sold", "Round "+round+" Test for Lot Sold In Full Later : Row 4 Status : expected 100% sold" );
      // TODO test that the rest are empty!

      equal( sheet.getRange('F5').getValue(), "Long-term", "Round "+round+" Test for Long-Term Sale : Row 5 Status : expected long-term 1000 cost basis" );
      equal( sheet.getRange('G5').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Long-Term Sale : Row 5 Cost Basis : expected long-term 1000 cost basis" );
      equal( sheet.getRange('H5').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Long-Term Sale : Row 5 Gain(Loss) : expected long-term 1000 gain" );

      equal( sheet.getRange('F6').getValue(), "Long-term", "Round "+round+" Test for Split into Long-Term Sale : Row 6 Status : expected long-term 1000 cost basis" );
      equal( sheet.getRange('G6').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Long-Term Sale : Row 6 Cost Basis : expected long-term 1000 cost basis" );
      equal( sheet.getRange('H6').getValue().toFixed(2), 1000.00, "Round "+round+" Test for Split into Long-Term Sale : Row 6 Gain(Loss) : expected long-term 1000 gain" );
      // also check the NOTE content...
      // "Split into (rows 6 and 7). Amount of coin sold was 0.40000000, and original amount was $8000.00."

      equal( sheet.getRange('F7').getValue(), "Short-term", "Round "+round+" Test for Split into Short-Term Sale : Row 7 Status : expected short-term 1000 cost basis" );
      equal( sheet.getRange('G7').getValue().toFixed(2), 3000.00, "Round "+round+" Test for Split into Short-Term Sale : Row 7 Cost Basis : expected short-term 3000 cost basis" );
      equal( sheet.getRange('H7').getValue().toFixed(2), 3000.00, "Round "+round+" Test for Split into Short-Term Sale : Row 7 Gain(Loss) : expected short-term 3000 gain" );
      // also check the NOTE content...
      // "Sale split into (rows 6 and 7). Original amount of coin sold was 0.40000000, and original amount was $8000.00."
    };

    // fill the in the test data
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':E'+(i+3)).setValues([initialData[i]]);
    }

    // run the 11 assumption checks twice, as there are two code paths to test when a row split is involved
    expect(22);
    TestRun(1);
    TestRun(2);

    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}

/** 
 * test9 for function calculateFifo(sheet, lots, sales)
 */
function test9_CostBasis() {
  QUnit.test( "test9 - Real Data with Term Split - Two Rounds", function() {
   
    // test data for this test case
    var initialData = [['2019-02-14','201.89592700','25.30','',''],
                       ['2019-03-13','104.50000000','20.25','',''],
                       ['2019-03-13','5.55555600','1.00','',''],
                       ['2019-03-13','5.55555600','1.00','',''],
                       ['2019-03-13','5.55555600','1.00','',''],
                       ['2019-03-13','38.88888900','7.00','',''],
                       ['2019-03-30','3.55968800','1.00','',''],
                       ['2019-03-30','3.56238300','1.00','',''],
                       ['2019-03-30','3.56293500','1.00','',''],
                       ['2019-03-30','24.93663400','6.98','',''],
                       ['2019-04-09','14.25000000','4.14','',''],
                       ['2019-05-09','14.25000000','4.22','',''],
                       ['2019-06-10','19.00000000','6.19','',''],
                       ['2019-09-08','7.60000000','1.34','',''],
                       ['2019-10-09','49.40000000','10.18','',''],
                       ['2019-11-08','25.65000000','6.20','',''],
                       ['2019-12-07','43.46250000','8.40','',''],
                       ['2020-01-07','4.50000000','0.88','',''],
                       ['2020-02-01','61.91077800','13.76','',''],
                       ['2020-02-09','23.51250000','6.24','',''],
                       ['2020-02-09','20.35000000','5.40','',''],
                       ['2020-03-06','22.05640000','5.23','',''],
                       ['2020-03-09','75.76250000','14.54','',''],
                       ['2020-04-06','24.21220000','3.73','',''],
                       ['2020-04-08','25.65000000','4.23','',''],
                       ['2020-05-04','','','829.14000000','151.26'],
                       ['2020-05-06','16.37960000','','',''],	
                       ['2020-05-09','26.60000000','','',''],	
                       ['2020-06-05','6.30000000','','',''],	
                       ['2020-06-10','37.78054500','','',''],	
                       ['2020-07-07','5.09400000','','','']];

    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "test9:" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

    var TestRun = function (round) {
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
      for (var j = 3; j < 28; j++) {
        equal( sheet.getRange('F'+j).getValue(), "100% Sold", "Round "+round+" Test for Lot Sold In Full Later : Row "+j+" Status : expected 100% sold" );
        // TODO test that the rest are empty!
      }

      equal( sheet.getRange('F28').getValue(), "Long-term", "Round "+round+" Test for Split into Long-Term Sale : Row 28 Status : expected long-term cost basis" );
      equal( sheet.getRange('G28').getValue().toFixed(2), 69.67, "Round "+round+" Test for Split into Long-Term Sale : Row 28 Cost Basis : expected $69.67 cost basis" );
      equal( sheet.getRange('H28').getValue().toFixed(2), 5.46, "Round "+round+" Test for Split into Long-Term Sale : Row 28 Gain(Loss) : expected $5.46 gain" );
      // also check the NOTE content...
      // A28: Originally 829.14000000 BAT was sold for $151.26 and split into rows 28 and 29.
      // D28: Sold lots from row ??? on ????-??-?? to row 13 on 2019-04-09.

      equal( sheet.getRange('F29').getValue(), "Short-term", "Round "+round+" Test for Split into Short-Term Sale : Row 29 Status : expected short-term cost basis" );
      equal( sheet.getRange('G29').getValue().toFixed(2), 90.54, "Round "+round+" Test for Split into Short-Term Sale : Row 29 Cost Basis : expected $90.54 cost basis" );
      equal( sheet.getRange('H29').getValue().toFixed(2), -14.41, "Round "+round+" Test for Split into Short-Term Sale : Row 29 Gain(Loss) : expected $(14.41) gain" );
      // also check the NOTE content...
      // A28: Originally 829.14000000 BAT was sold for $151.26 and split into rows 28 and 29.
      // D29: Sold lots from row ??? on ????-??-?? to row 27 on 2020-04-08.

      // TODO test that the rest are empty!
    };
    
    // fill the in the test data
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':E'+(i+3)).setValues([initialData[i]]);
    }
    
    // run the 31 assumption checks twice, as there are two code paths to test when a row split is involved
    expect(62);
    TestRun(1);
    TestRun(2);

    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}