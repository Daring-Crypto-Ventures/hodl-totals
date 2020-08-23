/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * FIFO calculation rules ported from VBScript in project "Coin Cost Basis" by Alan Hettinger
 *
 */

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('HODL Totals')
      .addItem('New currency...', 'newCurrencySheet_')
      .addSeparator()
      .addItem('Apply formatting', 'formatSheet_')
      .addItem('Calculate cost basis (FIFO)', 'calculateFIFO_')
      .addSeparator()
      .addSubMenu(ui.createMenu('Examples')
          .addItem('Simple data with Instuctions', 'loadExample0_'))
      .addSeparator()
      .addItem('About', 'showAboutDialog_') 
      .addToUi();
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

  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(desiredCurrency);

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

  // populate the two-row-tall header cells
  var header1 = ['', 'Buy','', 'Sell','','Calculated','','','Use \"HODL Totals > Calculate Cost Basis (FIFO)\" to update this sheet.','Fair Market Value (USD)','',''];
  var header2 = ['Date', desiredCurrency+' Purchased','Fiat Cost', desiredCurrency+' Sold','Fiat Received','Status','Cost Basis','Gain (Loss)','Notes', desiredCurrency+' High',desiredCurrency+' Low',desiredCurrency+' Price'];
  sheet.getRange('A1:L1').setValues([header1]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('A2:L2').setValues([header2]).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.getRange('I1').setFontWeight('normal');

  // merge 1st row cell headers
  sheet.getRange('B1:C1').merge();
  sheet.getRange('D1:E1').merge();
  sheet.getRange('F1:H1').merge();
  sheet.getRange('J1:L1').merge();
  
  // color background and freeze the header rows
  sheet.getRange('A1:L1').setBackground('#DDDDEE');
  sheet.getRange('A2:L2').setBackground('#EEEEEE');
  sheet.setFrozenRows(2);

  // should freeze the Date column also?
     
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

  // set col C {Fiat Cost} to be calculated based on other cells in the sheet
  var lastRow = getLastRowSpecial(sheet.getRange('A:A').getValues());
  for (var row = 3; row <= lastRow; row++) {
    var highValue = sheet.getRange('J'+row).getValue();

    // if value known don't include formulas to calculate the price from FMV columns
    if (highValue !== 'value known') {

      // calculate fiat price based on other columns
      if (sheet.getRange('B'+row).getValue()) {  
        sheet.getRange('C'+row).setValue('=B'+row+'*L'+row);
      } else {
        if (sheet.getRange('D'+row).getValue()) {  
          sheet.getRange('E'+row).setValue('=D'+row+'*L'+row);
        }
      }

      // unless the price is known, calculate via averaging high/low price for that date
      if (highValue !== 'price known') {
        sheet.getRange('L'+row).setValue('=AVERAGE(J'+row+',K'+row+')');
      }

    } else {
        sheet.getRange('L'+row).setValue(highValue);
        sheet.getRange('C'+row).setFontWeight('bold');
    } 
  }  

  // set col F {Status} centered + and I {Notes} centered with dark gray text, italics text
  sheet.getRange('F3:F').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');
  sheet.getRange('I3:I').setFontColor('#424250').setFontStyle('italic').setHorizontalAlignment('center');

  // set col J, K and L {COIN High, Low, Price} to be foramtted into USD value but to 6 decimal places
  sheet.getRange('J3:J').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setHorizontalAlignment('right');
  sheet.getRange('K3:K').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setHorizontalAlignment('right');
  sheet.getRange('L3:L').setNumberFormat('$#,######0.000000;$(#,######0.000000)').setHorizontalAlignment('right');

  // Prevent the user from entering bad inputs in the first place which removes
  // the need to check data in the validate() function during a calculation
  setValidationRules_(sheet);
  
  // set col F, G and H {Status, Cost Basis, Gain(Loss)} to be grayed background
  sheet.getRange('F3:H').setBackground('#EEEEEE');
   
  // autosize the column widths to fit content
  sheet.autoResizeColumns(1, 9);  
  
  SpreadsheetApp.flush();
  
  return sheet;
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
 * Extract just the coin purchase data from the sheet.
 * 
 * @param sheet the google sheet with the crypto data
 *
 * @return lots 2D array of {date, amt coin purchased, purchase price}
 */
function getLots(sheet) {
  var lastRow;
  var lots;
  var lot;
  lots = new Array();
  lot = 0;
  
  // find last row with date data present
  lastRow = getLastRowSpecial(sheet.getRange('A:A').getValues());
  
  // return just the purchases data as a 2D array
  for (var row = 3; row <= lastRow; row++) {
    var purchaseDate = sheet.getRange('A'+row).getDisplayValue();
    var bought = sheet.getRange('B'+row).getValue();
    var boughtPrice = sheet.getRange('C'+row).getValue();
    
    if (bought > 0) {
      lots[lot] = new Array(4);
      lots[lot][0] = purchaseDate;
      lots[lot][1] = bought;
      lots[lot][2] = boughtPrice;
      lots[lot][3] = row;
      lot++;
    }
  }

  return lots;
}

/**
 * Extract just the coin sale data from the sheet.
 * 
 * @param sheet the google sheet with the crypto data
 *
 * @return sales 2D array of {date, amt coin sold, sale price}
 */
function getSales(sheet) {
  var lastRow;
  var sales;
  var sale;
  sales = new Array();
  sale = 0;
  
  // find last row with date data present
  lastRow = getLastRowSpecial(sheet.getRange('A:A').getValues());
  
  for (var row = 3; row <= lastRow; row++) {   
    var saleDate = sheet.getRange('A'+row).getDisplayValue();
    var sold = sheet.getRange('D'+row).getValue();
    var soldPrice = sheet.getRange('E'+row).getValue();
    
    if (sold > 0) {
      sales[sale] = new Array(4);
      sales[sale][0] = saleDate;
      sales[sale][1] = sold;
      sales[sale][2] = soldPrice;
      sales[sale][3] = row;
      sale++;
    }
  }
  
  return sales;
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
    sheet.getRange('F3').setValue('0% Sold');
  }

  for (var sale = 0; sale < sales.length; sale++) {
    var termSplit; // Boolean
    var prevSplitRow; // Boolean
    var splitFactor; // Double
    var totalCoin; // Double
    var totalCost; // Double
    termSplit = false; // flag if sale involved both short-term and long-term holdings
    prevSplitRow = false; // flag to avoid creating extra rows when running calc repeatedly on same sheet
    splitFactor = 0; // ratio of totalCoin to sellCoin
    totalCoin = 0; // running total of coins for basis
    totalCost = 0; // running total of dollar cost for basis
    sellDate = dateFromString(sales[sale][0],0);
    sellCoinRemain = sellCoin = sales[sale][1];
    sellRecd = sales[sale][2];
    sellRow = sales[sale][3];
    
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
          sheet.getRange('F'+lotRow).setValue('100% Sold');

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

          sheet.getRange('F'+lotRow).setValue((percentSold * 100).toFixed(0) + '% Sold');
        }    

        // if sale more than 1 year and 1 day from purchase date mark as long-term gains        
        if (!termSplit) {
          if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) {
            sheet.getRange('F'+(sellRow+shift)).setValue('Long-term');
          } else {
            sheet.getRange('F'+(sellRow+shift)).setValue('Short-term');
          }
        }

        if (!prevSplitRow) {
          // calculate and post results 
          totalCoin = totalCoin + sellCoinRemain;
          totalCost = totalCost + (lotCost * (sellCoinRemain / lotCoin));
          costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
          gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;       

          sheet.getRange('G'+(sellRow+shift)).setValue(costBasis);
          sheet.getRange('H'+(sellRow+shift)).setValue(gainLoss);     

          // take note note of which lots were sold and when
          sheet.getRange('D'+(sellRow+shift)).setNote('Sold lots from row '+
          '??? on ????-??-??'+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.');  
        }
        
        break; // Exit the inner for loop
      }
      // if the remaining coin to sell is greater than what is in the lot,
      // determine if there is a term split, and calculate running totals
      else {
        // mark 1 year from the look-ahead lotDate
        nextTerm = dateFromString(lots[lot+1][0], 1);
        
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
          originalCoin = sheet.getRange('D'+(sellRow+shift)).getValue();
          originalCost = sheet.getRange('E'+(sellRow+shift)).getValue();

          // post the long-term split       
          sheet.getRange('D'+(sellRow+shift)).setValue(originalCoin * splitFactor);
          sheet.getRange('E'+(sellRow+shift)).setValue(originalCost * splitFactor);
          sheet.getRange('F'+(sellRow+shift)).setValue('Long-term');
          sheet.getRange('G'+(sellRow+shift)).setValue(costBasis);
          sheet.getRange('H'+(sellRow+shift)).setValue(gainLoss);       
          
          // take note note of which lots were sold and when
          sheet.getRange('D'+(sellRow+shift)).setNote('Sold lots from row '+
            '??? on ????-??-??'+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.');  

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
            sheet.getRange('D'+(sellRow+shift)).setValue(originalCoin * (1 - splitFactor));
            sheet.getRange('E'+(sellRow+shift)).setValue(originalCost * (1 - splitFactor));
            sheet.getRange('F'+(sellRow+shift)).setValue('Short-term');

            // update lots after the split transaction to account for the inserted row
            for (var lotAfterSplit = 0; lotAfterSplit < lots.length; lotAfterSplit++) {
              if (lots[lotAfterSplit][3] >= (sellRow+shift)) {
                lots[lotAfterSplit][3]++;
              }
            }
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
        sheet.getRange('F'+lotRow).setValue('100% Sold');
        lotCount++;
        lotCoinRemain = lots[lotCount][1];
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
  if (validate(activeSheet)) {
  
    // clear previously calculated values
    activeSheet.getRange('F3:H').setValue("");
    
    // add freshly calculated values
    var lots = getLots(activeSheet);
    Logger.log('Detected ' + lots.length + ' purchases of '+activeSheet.getName().replace(/ *\([^)]*\) */g, "")+'.');
    var sales = getSales(activeSheet);
    Logger.log('Detected ' + sales.length + ' sales of '+activeSheet.getName().replace(/ *\([^)]*\) */g, "")+'.');
    
    calculateFifo(activeSheet, lots, sales);
    
    // output the current date and time as the time last completed
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('I1').setValue('Last calculation succeeded '+now);
    Logger.log('Last calculation succeeded '+now);
    
  } else {
    // record failures too
    var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    activeSheet.getRange('I1').setValue('Data validation failed '+now);
    Logger.log('Data validation failed '+now);
  }
  
  // autosize the column widths to fit content
  activeSheet.autoResizeColumns(1, 9);  
}
