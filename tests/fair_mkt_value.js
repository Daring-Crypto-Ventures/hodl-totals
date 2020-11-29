/**
 * Tests for Fair Market Value columns, cacluations and formatting.
 *
 */

function testFairMktValueFunctions() {
  test1_FMV();
}

/** 
 * test1 for function calcFiatValuesFromFMV(sheet)
 */
function test1_FMV() {
  QUnit.test( "Fair Market Value test1 - Example Dataset", function(initialData) {

    // test data for this test case
    var initialData = [['2015-12-01', '1.00000000',    ,             ,    , , , , ,             '1.111100',            '0.992222',   ''],
                       ['2016-02-29', '1.00000000', '1',             ,    , , , , ,          'value known',                      ,   ''],
                       ['2016-03-01',             ,    , '1.00000000', '5', , , , ,          'value known',         'value known',   ''],
                       ['2018-02-28','23.00000000',    ,		 	       ,    , , , , ,          'price known',                      , '34'],
                       ['2020-04-01',             ,	   , '2.00000000',    , , , , ,             '2.312002',              '1.8222',   ''],
                       ['2020-04-02',             ,	   ,'20.00000000',    , , , , ,   '=0.0003561*7088.25',  '=0.0003561*6595.92',   ''],
                       ['2020-05-31','26.92000000',    ,             ,	  , , , , ,'=0.0069319*9700.34/B9','=0.0069319*9432.3/B9',   '']];
    
    // create temp sheet
    var currentdate = new Date(); 
    var uniqueSheetName = "FMV_TEST1(" + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/" 
                + currentdate.getFullYear() + "@"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + ")";
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(uniqueSheetName);

    var TestRun = function () {

      if (validate(sheet)) {
          
        calcFiatValuesFromFMV(sheet);
        
        // output the current date and time as the time last completed
        var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
        sheet.getRange('I1').setValue('Last calculation succeeded '+now);
            
      } else {
        
        var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
        sheet.getRange('I1').setValue('Data validation failed '+now);
      }

      // check if test passed or failed
      equal( sheet.getRange('C3').getValue().toFixed(2), "1.05", "Test for Fiat Cost calculated from FMV data : Row 3 Fiat Cost : expected fiat cost calc from FMV average" );
      equal( sheet.getRange('L3').getValue().toFixed(2), "1.05", "Test for FMV average formula inserted : Row 3 Price : expected FMV calc averaged from supplied high/low prices" );

      equal( sheet.getRange('C4').getValue().toFixed(2), "1.00", "Test for Fiat Cost with no FMV data : Row 4 Fiat Cost : expected user supplied number (bolded)" );
      equal( sheet.getRange('C4').getFontWeight(), "bold", "Test for Fiat Cost with no FMV data : Row 4 Fiat Cost : expected user supplied number (bolded)" );
      equal( sheet.getRange('K4').getValue(), "value known", "Test for FMV setinel value filled right : Row 4 Low : expected sentinel value copied from col J" );
      equal( sheet.getRange('L4').getValue(), "value known", "Test for  FMV setinel value filled right : Row 4 Price : expected sentinel value copied from col J" );

      equal( sheet.getRange('E5').getValue().toFixed(2), "5.00", "Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number (bolded)" );
      equal( sheet.getRange('E5').getFontWeight(), "bold", "Test for Fiat Received with no FMV data : Row 5 Fiat Received : expected user supplied number (bolded)" );
      equal( sheet.getRange('L5').getValue(), "value known", "Test for FMV setinel value filled right : Row 5 Price : expected sentinel value copied from col J" );

      equal( sheet.getRange('C6').getValue().toFixed(2), "782.00", "Test for Fiat Cost with known FMV price : Row 6 Fiat Cost : expected fiat cost calc from known FMV price" );
      equal( sheet.getRange('K6').getValue(), "price known", "Test for FMV setinel value filled right : Row 6 Low : expected sentinel value copied from col J" );

      equal( sheet.getRange('E7').getValue().toFixed(2), "4.13", "Test for Fiat Received calculated from FMV data : Row 7 Fiat Received : expected fiat received calc from FMV average" );
      equal( sheet.getRange('L7').getValue().toFixed(2), "2.07", "Test for FMV average formula inserted : Row 7 Price : expected FMV calc averaged from supplied high/low prices" );

      equal( sheet.getRange('E8').getValue().toFixed(2), "48.73", "Test for Fiat Received calculated from FMV data : Row 8 Fiat Received : expected fiat received calc from FMV average derived from formulas" );
      equal( sheet.getRange('L8').getValue().toFixed(2), "2.44", "Test for FMV average formula inserted : Row 8 Price : expected FMV calc averaged from supplied high/low prices" );

      equal( sheet.getRange('C9').getValue().toFixed(2), "66.31", "Test for Fiat Cost calculated from FMV data : Row 9 Fiat Cost : expected fiat cost calc from FMV average derived from formulas" );
      equal( sheet.getRange('L9').getValue().toFixed(2), "2.46", "Test for FMV average formula inserted : Row 9 Price : expected FMV calc averaged from supplied high/low prices" );
    };
    
    // fill the in the test data
    for (var i = 0; i < initialData.length; i++) {
      sheet.getRange('A'+(i+3)+':L'+(i+3)).setValues([initialData[i]]);
    }

    // run the assumption checks
    expect(17);
    TestRun();

    // clean up temp sheet
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  });
}
