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

  // could add configurable "# digits to the right to show' here
  // and then use it down below to set format on COIN columns
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(desiredCurrency);

  // populate the two-row-tall header cells
  var header1 = ['', 'Buy','', 'Sell','','Calculated','','','Use menu command \"Crypto Tools>Calculate Cost Basis (FIFO)\" to update this sheet.'];
  var header2 = ['Date', desiredCurrency+' Purchased','Fiat Cost', desiredCurrency+' Sold','Fiat Received','Status','Cost Basis','Gain (Loss)','Notes'];
  sheet.getRange('A1:I1').setValues([header1]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:I2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('I1').setFontWeight('normal');
  sheet.getRange('I2').setHorizontalAlignment('left');


  // merge 1st row cells for Buy, Sell and Calc
  sheet.getRange('B1:C1').merge();
  sheet.getRange('D1:E1').merge();
  sheet.getRange('F1:H1').merge();
  
  // color background and freeze the header rows
  sheet.getRange('A1:I1').setBackground('#DDDDEE');
  sheet.getRange('A2:I2').setBackground('#EEEEEE');
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
  
  for (var i = 0; i < initialData.length; i++) {
    sheet.getRange('A'+(i+3)+':I'+(i+3)).setValues([initialData[i]]);
  }
    
  // Add comment to initialData[4]'s Date Cell
  sheet.getRange('A7').setNote('split into (rows 9 and 10) amt of coin sold was 0.3, and original amt was 6000.');
  // Add comment to initialData[5]'s Date Cell
  sheet.getRange('A8').setNote('sale split into (rows 9 and 10) original amt of coin sold was 0.3, and original amount received was 6000.');
  
  // TODO
  // call the FIFO calculation function so it can fill in status columns
  // also since it will split long-term/short-term -- need to remove that split listed in my default data above + the cell comments added by hand

  // set numeric formats as described here: https://developers.google.com/sheets/api/guides/formats
  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd');
  
  // set COIN columns B, D {COIN Purchased, COIN Sold} visible numeric persicion to have 8 satoshis showing by default
  sheet.getRange('B3:B').setNumberFormat('0.00000000');
  sheet.getRange('D3:D').setNumberFormat('0.00000000');

  // set FIAT columns C, E, G and H {Fiat Cost, Fiat Received, Cost Basis, Gain(Loss)} type to be a Currency type
  sheet.getRange('C3:C').setNumberFormat('$#,##0.00;$(#,##0.00)');
  sheet.getRange('E3:E').setNumberFormat('$#,##0.00;$(#,##0.00)');
  sheet.getRange('G3:G').setNumberFormat('$#,##0.00;$(#,##0.00)');
  sheet.getRange('H3:H').setNumberFormat('$#,##0.00;$(#,##0.00)');

  // set col F {Status} centered + and I {Notes} left-aligned but with dark gray text, italics text
  sheet.getRange('F3:F').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
  sheet.getRange('I3:I').setFontColor('#424250').setFontStyle('italic');

  // Prevent the user from entering bad inputs in the first place which removes
  // the need to check data in the validate() function during a calculation
  setValidationRules_(sheet);
  
  // alternate row coloring
  var stepsRange = sheet.getDataRange()
      .offset(2, 0, sheet.getLastRow() - 2);
  setAlternatingRowBackgroundColors_(stepsRange, '#FFFFFF', '#FAFAFF');
  
  // set col F, G and H {Status, Cost Basic, Gain(Loss)} to be grayed background
  sheet.getRange('F3:H').setBackground('#EEEEEE');
  
  // autosize the column widths to fit content
  sheet.autoResizeColumns(1, 9);  
 
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

function setValidationRules_(sheet) {
  // ensure we only accept valid date values
  var dateRule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(false)
    //.setHelpText('Must be a valid date.')
    .build();
  sheet.getRange('A3:A').setDataValidation(dateRule);
  
  // ensure we only accept positive Coin/Fiat amounts
  var notNegativeRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    //.setHelpText('Value cannot be negative.')
    .build();
  sheet.getRange('B3:E').setDataValidation(notNegativeRule);
}

/**
 * Algo described here:
 * https://yagisanatode.com/2019/05/11/google-apps-script-get-the-last-row-of-a-data-range-
 * when-other-columns-have-content-like-hidden-formulas-and-check-boxes/
 *
 * Gets the last row number based on a selected column range values
 *
 * @param {array} range : takes a 2d array of a single column's values
 *
 * @returns {number} : the last row number with a value. 
 *
 */ 
function getLastRowSpecial(range){
  var rowNum = 0;
  var blank = false;
  for(var row = 0; row < range.length; row++){
 
    if(range[row][0] === "" && !blank){
      rowNum = row;
      blank = true;
 
    }else if(range[row][0] !== ""){
      blank = false;
    }
  }
  return rowNum;
}

/**
 *
 *
 */
function validate(sheet) {
  var lastDate;
  var coinCheck;
  lastDate = 0;
  coinCheck = 0;

  // find last row with date data present
  lastRow = getLastRowSpecial(sheet.getRange('A:A').getValues());

  // ensure dates are in chronological order sorted from past to present
  lastDate = sheet.getRange('A3').getValue();
  for (var row = 3; row <= lastRow; row++) {
    if (sheet.getRange('A'+row).getValue() >= lastDate) {  
      lastDate = sheet.getRange('A'+row).getValue();
    } else {
      Browser.msgBox('Data Validation Error', Utilities.formatString('Date out of order in row ' + row + '.'), Browser.Buttons.OK);
      return false;
    }  
  }
  
  // Iterate thru the rows to ensure there are enough buys to support the purchases
  // and that there is no extra data in the row that doesn't belong
  for (var row = 3; row <= lastRow; row++) {
    var bought = sheet.getRange('B'+row).getValue();
    var boughtPrice = sheet.getRange('C'+row).getValue();
    var sold = sheet.getRange('D'+row).getValue();
    var soldPrice = sheet.getRange('E'+row).getValue();
    
    if ((bought > 0) || (sold > 0)) {
      if ((coinCheck - sold) < 0) {
        Browser.msgBox('Data Validation Error', Utilities.formatString(
             'There were not enough coin buys to support your coin sale on row '+row+'.\\n' +
             'Ensure that you have recorded all of your coin buys correctly.'), Browser.Buttons.OK);
        return false;
      } else {
        coinCheck += bought - sold;
      }
    }
        
    if (((bought > 0) && (sold != 0 || soldPrice != 0)) || ((sold > 0) && (bought != 0 || boughtPrice != 0))) {
        Browser.msgBox('Data Validation Error', Utilities.formatString(
             'Invalid data in row '+row+'.\\n' +
             'Cannot list coin purchase and coin sale on same line.'), Browser.Buttons.OK);
        return false;
    }
  }
   
  return true;
}

/**
 *
 *
 */
function getLots(sheet) {
  Browser.msgBox('Error', Utilities.formatString('Not getLots() implemented.'), Browser.Buttons.OK);
}

/**
 *
 *
 */
function getSales(sheet) {
  Browser.msgBox('Error', Utilities.formatString('Not getSales() implemented.'), Browser.Buttons.OK);
}

/**
 *
 *
 */
function calculateFifo() {
   Browser.msgBox('Error',
        Utilities.formatString('Not calculateFifo() implemented.'),
        Browser.Buttons.OK);
}

/**
 * Creates a new sheet containing step-by-step directions between the two
 * addresses on the "Settings" sheet that the user selected.
 * 
 * TODO - figure out how to launch this as a Macro (this func doesn't show up as Importable Macro
 * https://developers.google.com/apps-script/guides/sheets/macros
 * as a macro, should be able to find a shirtcut key like Ctrl+Alt+Shift+Number
 */
function calculateFIFO_() {
  var spreadsheet = SpreadsheetApp.getActive();
  var activeSheet = spreadsheet.getActiveSheet();
  
  // sanity check the data in the sheet. only proceed if data is good
  if (validate(activeSheet)) {
  
    // clear previously calculated values
    activeSheet.getRange('F3:H').setValue("");
    
    getLots(activeSheet);
    getSales(activeSheet);
    calculateFifo(activeSheet);
    
    // output the current date and time as the time last completed
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('I1').setValue('Last calculation succeeded '+now);
    
  } else {
    // record failures too
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('I1').setValue('Data validation failed '+now);
  }
}
