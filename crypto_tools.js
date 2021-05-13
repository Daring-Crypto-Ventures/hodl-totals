/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * FIFO calculation rules ported from VBScript in project "Coin Cost Basis" by Alan Hettinger
 *
 */

 /**
 * A special function that runs when the this is installed as an addon
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu(); // createsMenu('HODL Totals')

  menu.addItem('Track new coin...', 'newCurrencySheet_')
  .addSeparator()
  .addItem('Apply formatting', 'formatSheet_')
  .addItem('Calculate (FIFO method)', 'calculateFIFO_')
  .addSeparator()
  .addSubMenu(ui.createMenu('Examples')
    .addItem('Cost basis', 'loadExample0_')
    .addItem('Fair market value', 'loadExample1_'))
  .addSeparator()
  .addItem('Join our Discord Server', 'openDiscordLink_')
  .addItem('About HODL Totals', 'showAboutDialog_');

  //if (e && e.authMode != ScriptApp.AuthMode.NONE)
  // https://ctrlq.org/google.apps.script/docs/add-ons/lifecycle.html 
  // Add a menu item based on properties (doesn't work in AuthMode.NONE).
  // i.e. analytics UrlFetchApp.fetch('http://www.example.com/analytics?event=open');
  // or add dynamic menu items based on stored *properties* [i.e. FIFO vs LIFO etc]

  menu.addToUi();
}

function showNewCurrencyPrompt() {
  var ui = SpreadsheetApp.getUi();

  var result = ui.prompt(
      'New Currency',
      'Please enter the coin\'s trading symbol ("BTC", "ETH", "XRP"):',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    return text;
  } else if ((button == ui.Button.CANCEL) || (button == ui.Button.CLOSE)) {
    return null;
  }
}

/**
 * A function that adds columns and headers to the spreadsheet.
 * 
 * @return the newly created sheet, for function chaining purposes.
 */
function newCurrencySheet_() {
  
  // ask user what the name of the new currency will be
  var desiredCurrency = showNewCurrencyPrompt();
  
  // indicates that the user canceled, so abort without making a new sheet
  if (desiredCurrency === null)
    return null;

  // if no Categories sheet previously exists, create one
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Categories") == null) {
    newCategorySheet(); 
  }
  SpreadsheetApp.getActiveSpreadsheet().insertSheet(desiredCurrency);

  return formatSheet_();
}

/**
 * A function that formats the columns and headers of the active spreadsheet.
 * 
 * Assumption: Not configurable to pick Fiat Currency to use for all sheets, assuming USD since this is related to US Tax calc
 * 
 * @return the newly created sheet, for function chaining purposes.
 */
function formatSheet_() {
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var desiredCurrency = sheet.getName().replace(/ *\([^)]*\) */g, "");

  // TODO add configurable "# digits to the right to show' here
  // and then use it down below to set format on COIN columns

  // TODO instead of 2 row tall header, explore using Groups: an association between an interval of contiguous 
  // rows or columns that can be expanded or collapsed as a unit to hide/show the rows or columns
  // https://developers.google.com/apps-script/reference/spreadsheet/group

  // populate the two-row-tall header cells
  var header1part1 = ['', '', 'Inflow','', 'Outflow','','Calculated','',''];
  var header1part2 = ['Fair Mkt Value','', '', 'Transaction Details','',''];

  // NOTE: spaces are hard coded around header text that help autosizecolumns behave correctly
  var header2 = ['       Date       ', '       Category       ','   '+desiredCurrency+' Acquired   ','   Fiat Value   ', '   '+desiredCurrency+' Disposed   ','   Fiat Value   ','   Status   ','   Cost Basis   ','   Gain (Loss)   ','   Notes   ', 
      '   '+desiredCurrency+' High   ','   '+desiredCurrency+' Low   ','   '+desiredCurrency+' Price   ','   Transaction ID   ','   Wallet/Account   ','   Address   '];
  sheet.getRange('A1:I1').setValues([header1part1]).setFontWeight('bold').setHorizontalAlignment('center');
  if(!(sheet.getRange('J1').getValue().startsWith("Last calculation succeeded"))) {
    sheet.getRange('J1').setValue('\"Add-ons > HODL Totals > Calculate\" to update calculated cells.');
  }
  sheet.getRange('K1:P1').setValues([header1part2]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:P2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');
  
  // see if any row data exists beyond the header we just added
  var lastRow = getLastRowWithDataPresent(sheet.getRange('A:A').getValues());

  // At-a-glance total added to upper left corner
  sheet.getRange('A1').setValue('=SUM(C:C)-SUM(E:E)');
  sheet.getRange('B1').setValue(desiredCurrency).setHorizontalAlignment('left');
  sheet.getRange('A1:B1').setBorder(false,false,true,true,false,false);
  sheet.getRange('J1').setFontWeight('normal');

  // merge 1st row cell headers
  sheet.getRange('C1:D1').merge();
  sheet.getRange('E1:F1').merge();
  sheet.getRange('G1:I1').merge();
  sheet.getRange('K1:M1').merge();
  sheet.getRange('N1:P1').merge();
  
  // color background and freeze the header rows
  sheet.getRange('A1:P1').setBackground('#DDDDEE');
  sheet.getRange('A2:P2').setBackground('#EEEEEE');
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(1);
     
  // set numeric formats as described here: https://developers.google.com/sheets/api/guides/formats
  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11).setHorizontalAlignment('center');
  sheet.getRange('B3:B').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');

  // set COIN cols {COIN Acquired, COIN Disposed} visible numeric persicion to have 8 satoshis showing by default
  sheet.getRange('C3:C').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('E3:E').setNumberFormat('0.00000000').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);

  // set FIAT cols {Fiat Value Inflow, Fiat Value Outflow, Cost Basis, Gain(Loss)} type to be a Currency type
  sheet.getRange('D3:D').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('F3:F').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('H3:H').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('I3:I').setNumberFormat('$#,##0.00;$(#,##0.00)').setFontColor(null).setFontStyle(null).setFontFamily('Calibri').setFontSize(11);

  // create filter around all transactions, only if no filter previously exists
  if (sheet.getFilter() === null) {
    sheet.getRange('A2:P'+lastRow).createFilter();
  }

  // iterate through the rows in the sheet to
  // set col {Fiat Cost} and col {Fiat Received} to be calculated based on other cells in the sheet
  calcFiatValuesFromFMV(sheet, lastRow);
  
  // set col styles for {Status}, {Notes} and {transaction ID}
  sheet.getRange('G3:G').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
  sheet.getRange('J3:J').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('left');
  sheet.getRange('N3:N').setFontColor(null).setFontStyle(null).setHorizontalAlignment('left');

  // TODO - special case formatting if coin price is > $100?  Annoying to list BTC-USD price to 6 decimal places.
  // set cols {COIN High, Low, Price} to be foramtted into USD value but to 6 decimal places
  sheet.getRange('K3:K').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null).setHorizontalAlignment('right').setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('L3:L').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null).setHorizontalAlignment('right').setFontFamily('Calibri').setFontSize(11);
  sheet.getRange('M3:M').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setFontColor(null).setFontStyle(null).setHorizontalAlignment('right').setFontFamily('Calibri').setFontSize(11);

  // lookup allowed categories from the "Categories sheet" to avoid hard-coding them
  var categoriesList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories').getRange('A2:A35').getValues();

  // Prevent the user from entering bad inputs in the first place which removes
  // the need to check data in the validate() function during a calculation 
  setValidationRules_(sheet, categoriesList);
  
  // set cols {Status, Cost Basis, Gain(Loss)} to be grayed background
  sheet.getRange('G3:I').setBackground('#EEEEEE');
  // TODO explore using ProtectionType to prevent user edits to these cells
     
  // add the HODL Total summary footer
  //sheet.getRange('C'+(lastRow+2)+':F'+(lastRow+2)).setBorder(true,false,false,false,false,false,'black', SpreadsheetApp.BorderStyle.DOUBLE);
  //sheet.getRange('C'+(lastRow+2)).setValue('=SUM(INDIRECT(ADDRESS(3,COLUMN())&\":\"&ADDRESS(ROW()-2,COLUMN())))');
  //sheet.getRange('E'+(lastRow+2)).setValue('=SUM(INDIRECT(ADDRESS(3,COLUMN())&\":\"&ADDRESS(ROW()-2,COLUMN())))');
  //sheet.getRange('C'+(lastRow+3)).setBorder(true,true,true,true,false,false).setFontWeight('bold').setValue('=C'+(lastRow+2)+'-E'+(lastRow+2));
  //sheet.getRange('J'+(lastRow+2)).setBorder(true,false,false,false,false,false,'black', SpreadsheetApp.BorderStyle.DOUBLE);
  //sheet.getRange('J'+(lastRow+2)).setFontColor('#424250').setFontStyle('italic').setValue('Total Purchased, Total Sold');
  //sheet.getRange('J'+(lastRow+3)).setFontColor('#424250').setFontStyle('italic').setValue('HODL Total');

  // autosize columns' widths to fit content
  sheet.autoResizeColumns(1,16); 
  SpreadsheetApp.flush();

  return sheet;
}

function calcFiatValuesFromFMV(sheet, lastRow) {

  var purchasedCol = sheet.getRange('C:C').getValues();
  var soldCol = sheet.getRange('E:E').getValues();
  var firstFMVcol = sheet.getRange('K:K').getValues();

  for (var row = 2; row < lastRow; row++) {
    var highValue = firstFMVcol[row][0] || 'value known';

    // if value known don't include formulas to calculate the price from FMV columns
    if (highValue !== 'value known') {

      // calculate fiat price based on other columns
      if (purchasedCol[row][0]) {  
        sheet.getRange('D'+(row+1)).setValue('=C'+(row+1)+'*M'+(row+1));
      } else {
        if (soldCol[row][0]) {  
          sheet.getRange('F'+(row+1)).setValue('=E'+(row+1)+'*M'+(row+1));
        }
      }

      // unless the price is known, calculate via averaging high/low price for that date
      if (highValue !== 'price known') {
        sheet.getRange('M'+(row+1)).setValue('=AVERAGE(K'+(row+1)+',L'+(row+1)+')');
      } else {
        // copy the price known sentinel value to any cells to the right
        sheet.getRange('L'+(row+1)).setValue('price known');
      }

    } else {
        // copy the price known sentinel value to any cells to the right
        sheet.getRange('K'+(row+1)).setValue('value known'); // if was empty, need to fill it in here
        sheet.getRange('L'+(row+1)).setValue('value known');
        sheet.getRange('M'+(row+1)).setValue('value known');

        // when marked 'value known', bold the hard-coded FIAT value entered for buy or for sale
        sheet.getRange('D'+(row+1)).setFontWeight('bold');
        sheet.getRange('F'+(row+1)).setFontWeight('bold');
    } 
  }  
}

function setValidationRules_(sheet, categoriesList) {
  // ensure we only accept valid date values
  var dateRule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(false)
    //.setHelpText('Must be a valid date.')
    .build();
  sheet.getRange('A3:A').setDataValidation(dateRule);

    // limit Category entries to loosely adhere to known categories
    var categoriesRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(categoriesList)
    .setAllowInvalid(true)
    .build();
  sheet.getRange('B3:B').setDataValidation(categoriesRule);
  
  // ensure we only accept positive Coin/Fiat amounts
  var notNegativeRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    //.setHelpText('Value cannot be negative.')
    .build();
  sheet.getRange('C3:F').setDataValidation(notNegativeRule);
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
function getLastRowWithDataPresent(range){

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
 * Parse the date string to return a Date object
 * 
 * @param dateStr is a yyyy-mm-dd formatted string
 * @param incYear will increment the year value by specified amount
 *
 * @return Date object corresponding to that string input.
 */
function dateFromString(dateStr, incYear) {
 var year = Number(dateStr.substring(0, 4));
 var month = Number(dateStr.substring(5, 7));
 var day = Number(dateStr.substring(8, 10));

 return new Date(year + incYear, month - 1, day);
}

/**
 *
 *
 */
function validate(sheet) {
  var lastDate;
  var dateLotAndSaleValues;
  var coinCheck;
  lastDate = 0;
  coinCheck = 0;

  dateLotAndSaleValues = sheet.getRange('A:F').getValues();

  // find last row with date data present
  lastRow = getLastRowWithDataPresent(dateLotAndSaleValues);

  // ensure dates are in chronological order sorted from past to present
  lastDate = dateLotAndSaleValues[2][0];
  for (var row = 2; row < lastRow; row++) {
    if (dateLotAndSaleValues[row][0] >= lastDate) {  
      lastDate = dateLotAndSaleValues[row][0];
    } else {
      Browser.msgBox('Data Validation Error', Utilities.formatString('Date out of order in row '+(row+1)+ '.'), Browser.Buttons.OK);
      return false;
    }  
  }
 
  // Iterate thru the rows to ensure there are enough inflows to support the outflows
  // and that there is no extra data in the row that doesn't belong
  for (var row = 2; row < lastRow; row++) {
    var bought = dateLotAndSaleValues[row][2];
    var boughtPrice = dateLotAndSaleValues[row][3];
    var sold = dateLotAndSaleValues[row][4];
    var soldPrice = dateLotAndSaleValues[row][5];
    
    if ((bought > 0) || (sold > 0)) {
      if ((coinCheck - sold) < 0) {
        Browser.msgBox('Data Validation Error', Utilities.formatString(
             'There were not enough coin inflows to support your coin outflow on row '+(row+1)+'.\\n' +
             'Ensure that you have recorded all of your coin inflows correctly.'), Browser.Buttons.OK);
        return false;
      } else {
        coinCheck += bought - sold;
      }
    }
        
    if (((bought > 0) && (sold != 0 || soldPrice != 0)) || ((sold > 0) && (bought != 0 || boughtPrice != 0))) {
        Browser.msgBox('Data Validation Error', Utilities.formatString(
             'Invalid data in row '+(row+1)+'.\\n' +
             'Cannot list coin purchase and coin sale on same line.'), Browser.Buttons.OK);
        return false;
    }
  }
   
  return true;
}

/**
 * Extract non-empty rows of either coin purchase data or sale data from the sheet.
 * 
 * @param sheet the google sheet with the crypto data
 *
 * @return lots 2D array of {date, amt coin, price}
 */
function getOrderList(dateDisplayValues, lastRow, coinAndPriceData) {
  var orderList;
  var order;
  orderList = new Array();
  order = 0;
  
  // compact the data into a contiguous array
  for (var row = 2; row < lastRow; row++) {
    if (coinAndPriceData[row][0] > 0) {
      orderList[order] = new Array(4);
      orderList[order][0] = dateDisplayValues[row][0];
      orderList[order][1] = coinAndPriceData[row][0];  // amount of coin bought or sold
      orderList[order][2] = coinAndPriceData[row][1];  // purchase price or sale price
      orderList[order][3] = row+1;
      order++;
    }
  }

  return orderList;
}

/**
 * Using the FIFO method calculate short and long term gains from the data in this sheet.
 * 
 * @param sheet the google sheet with the crypto data
 */
function calculateFifo(sheet, lots, sales) {
  var shift; // Integer
  var lotCount; // Integer
  var lotCoinRemain; // Double
  var costBasis; // Double
  var gainLoss; // Double
  var sellCoinRemain; // Double
  var sellDate; // Date
  var sellCoin; // Double
  var sellRecd; // Double
  var sellRow; // Integer
  const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  const ONE_SATOSHI = .00000001;

  shift = 0;
  lotCount = 0;

  // start with num coins that were necessarily bought in "lot 0'
  lotCoinRemain = lots[0][1];
  
  // if no sales yet, mark the status of the first lot as 0% sold
  if (sales.length === 0) {
    sheet.getRange('G3').setValue('0% Sold');
  }

  for (var sale = 0; sale < sales.length; sale++) {
    var termSplit; // Boolean
    var prevSplitRow; // Boolean
    var splitFactor; // Double
    var totalCoin; // Double
    var totalCost; // Double
    var startingLotCount;
    termSplit = false; // flag if sale involved both short-term and long-term holdings
    prevSplitRow = false; // flag to avoid creating extra rows when running calc repeatedly on same sheet
    splitFactor = 0; // ratio of totalCoin to sellCoin
    totalCoin = 0; // running total of coins for basis
    totalCost = 0; // running total of dollar cost for basis
    sellDate = dateFromString(sales[sale][0],0);
    sellCoinRemain = sellCoin = sales[sale][1];
    sellRecd = sales[sale][2];
    sellRow = sales[sale][3];
    startingLotCount = lotCount;

    for (var lot = lotCount; lot < lots.length; lot++) {
      var thisTerm; // Date
      var nextTerm; // Date
      var originalDate; // Date
      var originalCoin; // Double
      var originalCost; // Double
      var lotCoin; // Double
      var lotCost; // Double
      var lotRow; // Integer
      lotCoin = lots[lot][1];
      lotCost = lots[lot][2];
      lotRow = lots[lot][3];
      
      // mark 1 year from the lotDate, to use in gains calculations later
      thisTerm = dateFromString(lots[lot][0], 1);

      // if the remaining coin to sell is less than what is in the lot,
      // calculate and post the cost basis and the gain or loss
      if (sellCoinRemain <= lotCoinRemain) {

        if (Math.abs(sellCoinRemain - lotCoinRemain) <= ONE_SATOSHI) {
          // all of this lot was sold
          sheet.getRange('G'+lotRow).setValue('100% Sold');

          // if there are more lots to process, advance the lotCount before breaking out
          if ((lotCount+1) < lots.length) {
            lotCount++;  
            lotCoinRemain = lots[lotCount][1];
          }
        } else {
          var percentSold; // Double
          
          // only some of the lot remains
          lotCoinRemain = lotCoinRemain - sellCoinRemain;
          percentSold = 1 - (lotCoinRemain / lotCoin);

          sheet.getRange('G'+lotRow).setValue((percentSold * 100).toFixed(0) + '% Sold');
        }    

        // if sale more than 1 year and 1 day from purchase date mark as long-term gains        
        if (!termSplit) {
          if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) {
            sheet.getRange('G'+(sellRow+shift)).setValue('Long-term');
          } else {
            sheet.getRange('G'+(sellRow+shift)).setValue('Short-term');
          }
        }

        if (!prevSplitRow) {
          // calculate and post results 
          totalCoin = totalCoin + sellCoinRemain;
          totalCost = totalCost + (lotCost * (sellCoinRemain / lotCoin));
          costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
          gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;       

          sheet.getRange('H'+(sellRow+shift)).setValue(costBasis);
          sheet.getRange('I'+(sellRow+shift)).setValue(gainLoss);     

          // take note note of which lots were sold and when
          if (startingLotCount === lot) {
            sheet.getRange('E'+(sellRow+shift)).setNote('Sold lot from row '+lots[lot][3]+' on '+lots[lot][0]+'.');
          } else {
            sheet.getRange('E'+(sellRow+shift)).setNote('Sold lots from row '+
              lots[startingLotCount][3]+' on '+lots[startingLotCount][0]+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.');  
          }
        }
        
        break; // Exit the inner for loop
      }
      // if the remaining coin to sell is greater than what is in the lot,
      // determine if there is a term split, and calculate running totals
      else {
        // mark 1 year from the look-ahead lotDate
        if ((lot+1) < lots.length) {
          nextTerm = dateFromString(lots[lot+1][0], 1);
        } else {
          nextTerm = sellDate; //no look-ahead date, so no term-split, fall thru the next case
        }
        
        // look ahead for a term split, do additional calculations, and
        // split both sides of the split on two different rows
        if (((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) 
          && ((sellDate.getTime() - nextTerm.getTime()) / MILLIS_PER_DAY < 0)) {

          termSplit = true;
          
          // calculate the split factor
          totalCoin = totalCoin + lotCoinRemain;
          totalCost = totalCost + (lotCost * (lotCoinRemain / lotCoin));
          splitFactor = totalCoin / sellCoin;

          costBasis = sellCoin * (totalCost / totalCoin) * splitFactor; // average price
          gainLoss = (sellRecd * splitFactor) - costBasis;

          originalDate = dateFromString(sheet.getRange('A'+(sellRow+shift)).getDisplayValue(), 0);
          originalCoin = sheet.getRange('E'+(sellRow+shift)).getValue();
          originalCost = sheet.getRange('F'+(sellRow+shift)).getValue();

          // post the long-term split       
          sheet.getRange('E'+(sellRow+shift)).setValue(originalCoin * splitFactor);
          sheet.getRange('F'+(sellRow+shift)).setValue(originalCost * splitFactor);
          sheet.getRange('G'+(sellRow+shift)).setValue('Long-term');
          sheet.getRange('H'+(sellRow+shift)).setValue(costBasis);
          sheet.getRange('I'+(sellRow+shift)).setValue(gainLoss);       
          
          // take note note of which lots were sold and when
          if (startingLotCount === lot) {
            sheet.getRange('E'+(sellRow+shift)).setNote('Sold lot from row '+lots[lot][3]+' on '+lots[lot][0]+'.');
          } else {
            sheet.getRange('E'+(sellRow+shift)).setNote('Sold lots from row '+
              lots[startingLotCount][3]+' on '+lots[startingLotCount][0]+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.');  
          }

          // Don't create note/new row if there is negligable value left in the short-term part
          // likely caused by rounding errors repeating the cost basis calc on the same sheet
          if (originalCoin * (1 - splitFactor) >= ONE_SATOSHI) {
            
            var splitNoteText = 'Originally '+originalCoin.toFixed(8)+' '+
            sheet.getName().replace(/ *\([^)]*\) */g, "")+' was sold for $'+originalCost.toFixed(2)+
               ' and split into rows '+(sellRow+shift)+' and '+(sellRow+shift+1)+'.';
            sheet.getRange('A'+(sellRow+shift)).setNote(splitNoteText);
          
            // create the new row for the short-term part of the term split
            sheet.insertRowAfter(sellRow+shift);

            // shift to the next row to post the short-term split
            shift++;
            sheet.getRange('A'+(sellRow+shift)).setValue(originalDate).setNote(splitNoteText);
            sheet.getRange('E'+(sellRow+shift)).setValue(originalCoin * (1 - splitFactor));
            sheet.getRange('F'+(sellRow+shift)).setValue(originalCost * (1 - splitFactor));
            sheet.getRange('G'+(sellRow+shift)).setValue('Short-term');

            // update lots after the split transaction to account for the inserted row
            for (var lotAfterSplit = 0; lotAfterSplit < lots.length; lotAfterSplit++) {
              if (lots[lotAfterSplit][3] >= (sellRow+shift)) {
                lots[lotAfterSplit][3]++;
              }
            }

            // reset the startingLot to point at the lot after the lot sold via long-term split
            // so that short-term part of split will get an accurate note attached
            startingLotCount = lot+1;
          }
          else {
            prevSplitRow = true;
          }
          
          totalCoin = 0;
          totalCost = 0;
        } 
        // if there isn't a term split, add to the running totals
        // and continue on to the next lot
        else {
          totalCoin = totalCoin + lotCoinRemain;
          totalCost = totalCost + (lotCost * (lotCoinRemain / lotCoin));
        }
        
        // subtract the lot amount from the remaining coin to be sold,
        // and set up variables for the next lot, since this lot is completely used up
        sellCoinRemain = sellCoinRemain - lotCoinRemain;
        sheet.getRange('G'+lotRow).setValue('100% Sold');
        lotCount++;
        if (lotCount < lots.length) {
          lotCoinRemain = lots[lotCount][1];
        }
      }
    }
  }
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
  var activeSheet = SpreadsheetApp.getActive().getActiveSheet();
  
  // sanity check the data in the sheet. only proceed if data is good
  Logger.log('Validating the data before starting calculations.');
  if (validate(activeSheet)) {
 
    var dateDisplayValues = activeSheet.getRange('A:A').getDisplayValues();
    var lastRow = getLastRowWithDataPresent(activeSheet.getRange('A:A').getValues());
    var lots;
    var sales;

    // clear previously calculated values
    Logger.log('Clearing previously calculated values and notes.');
    activeSheet.getRange('G3:I').setValue('');
    activeSheet.getRange('E3:E').setNote('');
    
    // add freshly calculated values
    lots = getOrderList(dateDisplayValues, lastRow, activeSheet.getRange('C:D').getValues());
    Logger.log('Detected ' + lots.length + ' purchases of '+activeSheet.getName().replace(/ *\([^)]*\) */g, "")+'.');
    sales = getOrderList(dateDisplayValues, lastRow, activeSheet.getRange('E:F').getValues());
    Logger.log('Detected ' + sales.length + ' sales of '+activeSheet.getName().replace(/ *\([^)]*\) */g, "")+'.');
    
    calculateFifo(activeSheet, lots, sales);
    
    // output the current date and time as the time last completed
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('J1').setValue('Last calculation succeeded '+now);
    Logger.log('Last calculation succeeded '+now);
    
  } else {
    // record failures too
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('J1').setValue('Data validation failed '+now);
    Logger.log('Data validation failed '+now);
  }
   
}
