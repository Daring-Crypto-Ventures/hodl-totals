/**
 * Debuggable testbed for Crypto Tools that can execute outside of a sheet.
 *
 */
function runTests() {
  // original example data
  var initialData = [
    ['2017/01/01','0.20000000','2000.00',            ,         , , , ,'Enter coin buys in the left-hand columns. Include fees in the cost.'],
    ['2018/02/01','0.60000000','6000.00',            ,         , , , ,'Enter everything in chronological order.'],
    ['2018/02/01',            ,         ,'0.05000000','1000.00', , , ,'Enter coin sales in the right-hand columns, again, including fees.'],
    ['2018/03/01',            ,         ,'0.05000000','1000.00', , , ,'The status column provides useful information for each transaction.'],
    ['2018/03/01',            ,         ,'0.30000000','6000.00', , , ,'If a sale includes short and long-term components, it is split.'], 
    ['2018/03/02','0.40000000','4000.00',            ,         , , , ,''],
    ['2018/03/03','0.80000000','8000.00',            ,         , , , ,'If you would like to sort or filter to analyze your results, it is'],
    ['2018/03/04','0.60000000','6000.00',            ,         , , , ,'recommended that you copy the results to a blank spreadsheet.'],
    ['2018/03/05',            ,         ,'0.10000000', '500.00', , , ,''],
    ['2018/03/06',            ,         ,'0.10000000','1000.00', , , ,'Create a copy of the blank spreadsheet for each coin you trade'],
    ['2018/03/07',            ,         ,'0.10000000','2000.00', , , ,'The notes column is a great place to keep track of fees,']];
    
  // bug p0 data
  var initialData = [
    ['2019-02-14','201.89592700','25.30',         ,        , , , ,''],
    ['2019-03-13','104.50000000','20.25',         ,        , , , ,''],
    ['2019-03-13',  '5.55555600', '1.00',         ,        , , , ,''],
    ['2019-03-13',  '5.55555600', '1.00',         ,        , , , ,''],
    ['2019-03-13',  '5.55555600', '1.00',         ,        , , , ,''],
    ['2019-03-13', '38.88888900', '7.00',         ,        , , , ,''],
    ['2019-03-30',  '3.55968800', '1.00',         ,        , , , ,''],
    ['2019-03-30',  '3.56238300', '1.00',         ,        , , , ,''],
    ['2019-03-30',  '3.56293500', '1.00',         ,        , , , ,''],
    ['2019-03-30', '24.93663400', '6.98',         ,        , , , ,''],
    ['2019-04-09', '14.25000000', '4.14',         ,        , , , ,''],
    ['2019-05-09', '14.25000000', '4.22',         ,        , , , ,''],
    ['2019-06-10', '19.00000000', '6.19',         ,        , , , ,''],
    ['2019-09-08',  '7.60000000', '1.34',         ,        , , , ,'Expecting 100% Sold'],
    ['2019-10-09', '49.40000000','10.18',         ,        , , , ,'Expecting 100% Sold'],
    ['2019-11-08', '25.65000000', '6.20',         ,        , , , ,'Expecting 100% Sold'],
    ['2019-12-07', '43.46250000', '8.40',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-01-07',  '4.50000000', '0.88',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-02-01', '61.91077800','13.76',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-02-09', '23.51250000', '6.24',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-02-09', '20.35000000', '5.40',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-03-06', '22.05640000', '5.23',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-03-09', '75.76250000','14.54',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-04-06', '24.21220000', '3.73',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-04-08',   '25.650000', '4.23',         ,        , , , ,'Expecting 100% Sold'],
    ['2020-05-04',              ,       , '829.14','151.26', , , ,'Expecting Split-Into-Short-Term Cost Basis to be $90.54']];
  
  
  // execute the tests based on the test dataset
  var result = test_FIFOCalc(initialData);
  
  Logger.log('testFIFOCalc() test result '+ result);
  
  return result;
}

/**
 * Parse the date string to return a Date object
 * 
 * @param dateStr is a yyyy-mm-dd formatted string
 * @param incYear will increment the year value by specified amount
 *
 * @return Date object corresponding to that string input.
 */
function test_dateFromString(dateStr, incYear) {
    
  var year = Number(+dateStr.substring(0, 4));
  var month = Number(+dateStr.substring(5, 7));
  var day = Number(+dateStr.substring(8, 10));

  return new Date(year + incYear, month - 1, day);
}

/**
 * Test the FIFO Calculation function outside of the spreadsheet context
 *
 * @return true = passm, false = fail .
 */
function test_FIFOCalc(data) {
  var dateArray;
  var lotsArray;
  var salesArray;
  dateArray = new Array(data.length);
  lotsArray = new Array(data.length);
  salesArray = new Array(data.length);

  for (var i = 0; i < data.length; i++) {
    dateArray[i] = data[i][0];              //order date
    lotsArray[i] = new Array(2);
    lotsArray[i][0] = Number(data[i][1]);   //amount purchased
    lotsArray[i][1] = Number(data[i][2]);   //purchase price
    salesArray[i] = new Array(2);
    salesArray[i][0] = Number(data[i][3]);  //amount sold
    salesArray[i][1] = Number(data[i][4]);  //sale price
    data[i][5] = '';                        //status
    data[i][6] = '';                        //costBasis
    data[i][7] = '';                        //gain(Loss)
  }
    
    // add freshly calculated values
  var lots = getOrderList(dateArray, data.length, lotsArray);
  Logger.log('Detected ' + lots.length + ' purchases of TESTCOIN.');
  
  var sales = getOrderList(dateArray, data.length, salesArray);
  Logger.log('Detected ' + sales.length + ' sales of TESTCOIN.');
    
  test_calculateFIFO(data, lots, sales);
    
  // TODO - check calculated columns in data to see if they matched expected
  // if didn't match, return false
  // else continue on
  
  // output the current date and time as the time last completed
  var now = Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
  Logger.log('Last calculation succeeded '+now);
    
  return true; // pass 
}
    
/**
 * Using the FIFO method calculate short and long term gains from the data in this sheet.
 * 
 * @param sheet the google sheet with the crypto data
 */
function test_calculateFIFO(data, lots, sales) {
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
  const MILLIS_PER_DAY = 1000 * 60 * 60 * 24; // not needed?

  shift = 0;
  lotCount = 0;

  // start with num coins that were necessarily bought in "lot 0'
  lotCoinRemain = lots[0][1];

  for (var sale = 0; sale < sales.length; sale++) {
    var termSplit; // Boolean
    var splitFactor; // Double
    var totalCoin; // Double
    var totalCost; // Double
    termSplit = false; // flag if sale involved both short-term and long-term holdings
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
      var lotDate; // Date
      var lotCoin; // Double
      var lotCost; // Double
      var lotRow; // Integer
      lotDate = dateFromString(lots[lot][0],0);
      lotCoin = lots[lot][1];
      lotCost = lots[lot][2];
      lotRow = lots[lot][3];
      
      // mark 1 year from the lotDate, to use in gains calculations later
      thisTerm = dateFromString(lots[lot][0], 1);

      // if the remaining coin to sell is less than what is in the lot,
      // calculate and post the cost basis and the gain or loss
      if (sellCoinRemain <= lotCoinRemain) {
        
        if (Math.abs(sellCoinRemain - lotCoinRemain) <= .00000001) {
          // all of this lot was sold
          data[lotRow][5] = '100% Sold';

          // if there are more lots to process, advance the lotCount before breaking out
          if (lotCount < lots.length) {
            lotCount++;  
            lotCoinRemain = lots[lotCount][1];
          }
        } else {
          var percentSold; // Double
          
          // only some of the lot remains
          lotCoinRemain = lotCoinRemain - sellCoinRemain;
          percentSold = 1 - (lotCoinRemain / lotCoin);

          data[lotRow][5] = (percentSold * 100).toFixed(0) + '% Sold';
        }    

        // if sale more than 1 year and 1 day from purchase date mark as long-term gains        
        if (!termSplit) {
          if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY >= 0) {
            data[sellRow+shift][5] = 'Long-term';
          } else {
            data[sellRow+shift][5] ='Short-term';
          }
        }

        // calculate and post results 
        totalCoin = totalCoin + sellCoinRemain;
        totalCost = totalCost + (lotCost * (sellCoinRemain / lotCoin));
        costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
        gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;       
        data[sellRow+shift][6] = costBasis;
        data[sellRow+shift][7] = gainLoss;
        
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
        
        // look ahead for a term split, and if a split exists,
        // set the split factor (% to allocate to either side of the split),
        // and calculate and post the first half of the split
        if (((sellDate.getTime() - thisTerm.getTime()) >= 0) && ((sellDate.getTime() - nextTerm.getTime()) < 0)) {
         
          termSplit = true;

          totalCoin = totalCoin + lotCoinRemain;
          totalCost = totalCost + (lotCost * (lotCoinRemain / lotCoin));

          // calculate the split factor
          splitFactor = totalCoin / sellCoin;

          // post the long-term split and continue
          costBasis = sellCoin * (totalCost / totalCoin) * splitFactor; // average price
          gainLoss = (sellRecd * splitFactor) - costBasis;

          originalDate = dateFromString(data[sellRow+shift][0], 0);
          originalCoin = Number(data[sellRow+shift][3]);
          originalCost = Number(data[sellRow+shift][4]);
          
          data[sellRow+shift][6] = costBasis;
          data[sellRow+shift][7] = gainLoss;
          
          Logger.log('Split into (rows '+(sellRow+shift)+
              ' and '+(sellRow+shift+1)+'). Amount of coin sold was '+originalCoin.toFixed(8)+
              ', and original amount was $'+originalCost.toFixed(2)+'.');
          
          data[sellRow+shift][3] = originalCoin * splitFactor;
          data[sellRow+shift][4] = originalCost * splitFactor;
          data[sellRow+shift][5] = 'Long-term';
          
          // create the new row to handle second part of the term split
          data.splice(sellRow+shift, 0, new Array(9));
          shift++;
          
          Logger.log('A'+(sellRow+shift)+
             'Sale split into (rows '+(sellRow+shift-1)+' and '+(sellRow+shift)+
             '). Original amount of coin sold was '+originalCoin.toFixed(8)+
             ', and original amount was $'+originalCost.toFixed(2)+'.');
          
          data[sellRow+shift][3] = originalCoin * (1 - splitFactor);
          data[sellRow+shift][4] = originalCost * (1 - splitFactor);
          data[sellRow+shift][5] = 'Short-term';
          
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
        
        data[lotRow][5] = '100% Sold';
        lotCount++;
        if (lotCount < lots.length) {
          lotCoinRemain = lots[lotCount][1];
        }
      }
    }
  }
  
  Logger.log(data);
}
