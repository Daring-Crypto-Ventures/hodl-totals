/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * test0: Populates with spreadsheet with sample data including instructions
 *
 */

function loadExample0_() {
  var newSheet = newCurrencySheet_();
  if (newSheet !== null) { 
    example0(newSheet);
  }
}

function example0(sheet) {

  // sample data set for test0
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
     ['2018/03/07',            ,         ,'0.10000000','2000.00', , , ,'The notes column is a great place to keep track of fees,'],
	 [            ,            ,         ,            ,         , , , ,'trades between coins, or any other relevant information.']
    ];
  
  for (var i = 0; i < initialData.length; i++) {
    sheet.getRange('A'+(i+3)+':I'+(i+3)).setValues([initialData[i]]);
  }
  
  // trigger a Cost Basis calculation
  calculateFIFO_();
}
