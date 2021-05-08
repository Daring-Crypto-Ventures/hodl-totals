/**
 * Debuggable testbed for Crypto Tools that can execute outside of a sheet.
 *
 */
function runTests() {
  // original example data
  var initialDataTest0 = [
    ['2017/01/01','0.20000000','2000.00',            ,         , , , ,''],
    ['2018/02/01','0.60000000','6000.00',            ,         , , , ,''],
    ['2018/02/01',            ,         ,'0.05000000','1000.00', , , ,''],
    ['2018/03/01',            ,         ,'0.05000000','1000.00', , , ,''],
    ['2018/03/01',            ,         ,'0.30000000','6000.00', , , ,''], 
    ['2018/03/02','0.40000000','4000.00',            ,         , , , ,''],
    ['2018/03/03','0.80000000','8000.00',            ,         , , , ,''],
    ['2018/03/04','0.60000000','6000.00',            ,         , , , ,''],
    ['2018/03/05',            ,         ,'0.10000000', '500.00', , , ,''],
    ['2018/03/06',            ,         ,'0.10000000','1000.00', , , ,''],
    ['2018/03/07',            ,         ,'0.10000000','2000.00', , , ,''],
    ['', , , , , , , , , ]];
    
  // bug p0 data
  var initialDataTest1 = [
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
    ['2019-09-08',  '7.60000000', '1.34',         ,        , , , ,''],
    ['2019-10-09', '49.40000000','10.18',         ,        , , , ,''],
    ['2019-11-08', '25.65000000', '6.20',         ,        , , , ,''],
    ['2019-12-07', '43.46250000', '8.40',         ,        , , , ,''],
    ['2020-01-07',  '4.50000000', '0.88',         ,        , , , ,''],
    ['2020-02-01', '61.91077800','13.76',         ,        , , , ,''],
    ['2020-02-09', '23.51250000', '6.24',         ,        , , , ,''],
    ['2020-02-09', '20.35000000', '5.40',         ,        , , , ,''],
    ['2020-03-06', '22.05640000', '5.23',         ,        , , , ,''],
    ['2020-03-09', '75.76250000','14.54',         ,        , , , ,''],
    ['2020-04-06', '24.21220000', '3.73',         ,        , , , ,''],
    ['2020-04-08',   '25.650000', '4.23',         ,        , , , ,''],
    ['2020-05-04',              ,       , '829.14','151.26', , , ,''],
    ['', , , , , , , , , ]];
  
  
  // execute the tests based on the test dataset
  var result0 = FIFOCalc(initialDataTest0);
  console.log('FIFOCalc() Test0 result '+ result0);
  var result1 = FIFOCalc(initialDataTest1);
  console.log('FIFOCalc() Test1 result '+ result1);
  
  return result0 || result1;
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
    
  var year = Number(+dateStr.substring(0, 4));
  var month = Number(+dateStr.substring(5, 7));
  var day = Number(+dateStr.substring(8, 10));

  return new Date(year + incYear, month - 1, day);
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
      orderList[order][0] = dateDisplayValues[row][0]; // date of order
      orderList[order][1] = coinAndPriceData[row][0];  // amount of coin bought or sold
      orderList[order][2] = coinAndPriceData[row][1];  // purchase price or sale price
      orderList[order][3] = row+1;
      order++;
    }
  }

  return orderList;
}

/**
 * Test the FIFO Calculation function outside of the spreadsheet context
 *
 * @return true = passm, false = fail .
 */
function FIFOCalc(data) {
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
  console.log('Detected ' + lots.length + ' purchases of TESTCOIN.');
  
  var sales = getOrderList(dateArray, data.length, salesArray);
  console.log('Detected ' + sales.length + ' sales of TESTCOIN.');
    
  calculateFIFO(data, lots, sales);
    
  // TODO - check calculated columns in data to see if they matched expected
  // if didn't match, return false
  // else continue on
  
  // output the current date and time as the time last completed
  // Google Apps Script API can do this with Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
  const date = new Date(Date.now());
  var now = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  console.log('Last calculation succeeded '+now);
    
  return true; // pass 
}
    
/**
 * Using the FIFO method calculate short and long term gains from the data in this sheet.
 * 
 * @param sheet the google sheet with the crypto data
 */
function calculateFIFO(data, lots, sales) {
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
    data[0][5] = '0% Sold';
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
          data[lotRow][5] = '100% Sold';

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

          data[lotRow][5] = (percentSold * 100).toFixed(0) + '% Sold';
        }    

        // if sale more than 1 year and 1 day from purchase date mark as long-term gains        
        if (!termSplit) {
          if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) {
            data[sellRow+shift][5] = 'Long-term';
          } else {
            data[sellRow+shift][5] ='Short-term';
          }
        }

        if (!prevSplitRow) {
        // calculate and post results 
        totalCoin = totalCoin + sellCoinRemain;
        totalCost = totalCost + (lotCost * (sellCoinRemain / lotCoin));
        costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
        gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;       

        data[sellRow+shift][6] = costBasis;
        data[sellRow+shift][7] = gainLoss;

          // take note note of which lots were sold and when
          if (startingLotCount === lot) {
            data[sellRow+shift][8] = 'Sold lot from row '+lots[lot][3]+' on '+lots[lot][0]+'.';
          } else {
            data[sellRow+shift][8] = 'Sold lots from row '+
              lots[startingLotCount][3]+' on '+lots[startingLotCount][0]+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.';  
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

          originalDate = dateFromString(data[sellRow+shift][0], 0);
          originalCoin = Number(data[sellRow+shift][3]);
          originalCost = Number(data[sellRow+shift][4]);
          
          // post the long-term split       
          data[sellRow+shift][3] = originalCoin * splitFactor;
          data[sellRow+shift][4] = originalCost * splitFactor;
          data[sellRow+shift][5] = 'Long-term';
          data[sellRow+shift][6] = costBasis;
          data[sellRow+shift][7] = gainLoss;
          
          // take note note of which lots were sold and when
          if (startingLotCount === lot) {
            data[sellRow+shift][8] = 'Sold lot from row '+lots[lot][3]+' on '+lots[lot][0]+'.';
          } else {
            data[sellRow+shift][8] = 'Sold lots from row '+
              lots[startingLotCount][3]+' on '+lots[startingLotCount][0]+' to row '+lots[lot][3]+' on '+lots[lot][0]+'.';  
          }

          // Don't create note/new row if there is negligable value left in the short-term part
          // likely caused by rounding errors repeating the cost basis calc on the same sheet
          if (originalCoin * (1 - splitFactor) >= ONE_SATOSHI) {
            
            var splitNoteText = 'Originally '+originalCoin.toFixed(8)+' '+
               ' TESTCOIN was sold for $'+originalCost.toFixed(2)+
               ' and split into rows '+(sellRow+shift)+' and '+(sellRow+shift+1)+'.';
               console.log("Row "+(sellRow+shift)+": "+splitNoteText);
            // create the new row for the short-term part of the term split
            data.splice(sellRow+shift, 0, new Array(9));
		    // shift to the next row to post the short-term split
            shift++;
            console.log("Row "+(sellRow+shift)+": "+splitNoteText);
            data[sellRow+shift][3] = originalCoin * (1 - splitFactor);
            data[sellRow+shift][4] = originalCost * (1 - splitFactor);
            data[sellRow+shift][5] = 'Short-term';

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
        data[lotRow][5] = '100% Sold';
        lotCount++;
        if (lotCount < lots.length) {
          lotCoinRemain = lots[lotCount][1];
        }
      }
    }
  }
  
  console.log(data);
}
