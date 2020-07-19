/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 */

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'New Currency...', functionName: 'newCurrencySheet_'},
    {name: 'Calculate Cost Basis (FIFO)', functionName: 'calculateFIFO_'}
  ];
  spreadsheet.addMenu('Crypto Tools', menuItems);
}

/**
 * A function that adds headers and some initial data to the spreadsheet.
 * 
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 */
function newCurrencySheet_() {
  var desiredCurrency = Browser.inputBox('Enter the cryptocurrency you want to track.',
      'Please provide the trading symbol in all caps' +
      ' (for example, "BTC", "ETH", "VRSC"):',
      Browser.Buttons.OK_CANCEL);
  // TODO
  // add configurable "# digits to the right to show' here
  // and then use it down below to set format on COIN columns
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(desiredCurrency);

  // populate the two-row-tall header cells
  var header1 = ['', 'Buy','', 'Sell','','Calculation','','',''];
  var header2 = ['Date', desiredCurrency+' Purchased','Fiat Cost', desiredCurrency+' Sold','Fiat Received','Status','Cost Basis','Gain (Loss)','Notes'];
  sheet.getRange('A1:I1').setValues([header1]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:I2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');

  // merge columns for Buy, Sell and Calc
  sheet.getRange('B1:C1').merge();
  sheet.getRange('D1:E1').merge();
  sheet.getRange('F1:H1').merge();
  
  // color background and freeze the header rows
  sheet.getRange('A1:I1').setBackground('#DDDDEE');
  sheet.getRange('A2:I2').setBackground('#DDDDEE');
  sheet.setFrozenRows(2);
  
  // populate with spreadsheet with sample data including instructions
  var initialData = [
     ['01/01/2017','0.20000000','2000.00',           ,         , , , ,'Enter coin buys in the left-hand columns. Include fees in the cost.'],
     ['02/01/2018','0.60000000','6000.00',           ,         , , , ,'Enter everything in chronological order.'],
     ['02/01/2018',            ,         ,'.05000000','1000.00', , , ,'Enter coin sales in the right-hand columns, again, including fees.'],
     ['03/01/2018',            ,         ,'.05000000','1000.00', , , ,'The status column provides useful information for each transaction.'],
     ['03/01/2018',            ,         ,'.10000000','2000.00', , , ,'If a sale includes short and long-term components, it is split.'], 
     ['03/01/2018',            ,         ,'.20000000','4000.00', , , ,''],
     ['03/02/2018','0.40000000','4000.00',           ,         , , , ,''],
     ['03/03/2018','0.80000000','8000.00',           ,         , , , ,'If you would like to sort or filter to analyze your results, it is'],
     ['03/04/2018','0.60000000','6000.00',           ,         , , , ,'recommended that you copy the results to a blank spreadsheet.'],
     ['03/05/2018','0.10000000', '500.00',           ,         , , , ,''],
     ['03/06/2018','0.10000000','1000.00',           ,         , , , ,'Create a copy of the blank spreadsheet for each coin you trade'],
     ['03/07/2018','0.10000000','2000.00',           ,         , , , ,'The notes column is a great place to keep track of fees,'],
	 [          ,            ,         ,           ,         , , , ,'trades between coins, or any other relevant information.']
    ];
  
  // TODO
  // comment on initialData[4]'s Date Cell -> 'split into (rows 9 and 10) amt of coin sold was 0.3, and original amt was 6000.'
  // comment on initialData[5]'s Date Cell -> 'sale split into (rows 9 and 10) original amt of coin sold was 0.3, and original amount received was 6000.'

  // TODO
  // call the FIFO calculation function so it can fill in status columns
  // also since it will split long-term/short-term -- need to remove that split listed in my default data above + the cell comments added by hand
  
  for (var i = 0; i < initialData.length; i++) {
    sheet.getRange('A'+(i+3)+':I'+(i+3)).setValues([initialData[i]]);
  }
  
  
  //TODO
  //set Date column to be of type Date MM/DD/YYYY
  //set COIN columns C, E {COIN Purchased, COIN Sold} visible numeric persicion to have 8 satoshis showing by default
  //set FIAT columns D, F, H and I {Fiat Cost, Fiat Received, Cost Basis, Gain(Loss)} type to be a Currency type
  //set col G, H and I {Status, Cost Basic, Gain(Loss)} to be grayed background
  //set col G {Status} and J {Notes} to have slightly gray text + italics
  
  /*  // Format the new sheet.
  directionsSheet.setColumnWidth(1, 500);
  directionsSheet.getRange('B2:C').setVerticalAlignment('top');
  directionsSheet.getRange('C2:C').setNumberFormat('0.00');
  */
  
  //alternate row coloring
  var stepsRange = sheet.getDataRange()
      .offset(2, 0, sheet.getLastRow() - 2);
  setAlternatingRowBackgroundColors_(stepsRange, '#FFFFFF', '#EEEEEE');
  
  
  sheet.autoResizeColumns(1, 9);
  //TODO
  // set fixed widths rather than autosize each column width
 
  SpreadsheetApp.flush();
}

/**
 * Sets the background colors for alternating rows within the range.
 * @param {Range} range The range to change the background colors of.
 * @param {string} oddColor The color to apply to odd rows (relative to the
 *     start of the range).
 * @param {string} evenColor The color to apply to even rows (relative to the
 *     start of the range).
*/
function setAlternatingRowBackgroundColors_(range, oddColor, evenColor) {
  var backgrounds = [];
  for (var row = 1; row <= range.getNumRows(); row++) {
    var rowBackgrounds = [];
    for (var column = 1; column <= range.getNumColumns(); column++) {
      if (row % 2 == 0) {
        rowBackgrounds.push(evenColor);
      } else {
        rowBackgrounds.push(oddColor);
      }
    }
    backgrounds.push(rowBackgrounds);
  }
  range.setBackgrounds(backgrounds);
}

/**
 * Creates a new sheet containing step-by-step directions between the two
 * addresses on the "Settings" sheet that the user selected.
 */
function calculateFIFO_() {
  var spreadsheet = SpreadsheetApp.getActive();
  var activeSheet = spreadsheet.getActiveSheet();

  Browser.msgBox('Error',
        Utilities.formatString('Not implemented.'),
        Browser.Buttons.OK);
  //TODO
  //implement this instead
}
