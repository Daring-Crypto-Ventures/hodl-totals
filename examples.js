/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * example0: Populates spreadsheet with Bitcoin data, no complex FMV calcs
 * example1: Populates spreadsheet with Altcoin data, more complex FMV calcs
 *
 */

function loadExample0_() {
  var newSheet = newCurrencySheet_();
  if (newSheet !== null) { 
    example0(newSheet);
  }
}

function example0(sheet) {

  // sample data set
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

function loadExample1_() {
  var newSheet = newCurrencySheet_();
  if (newSheet !== null) { 
    example1(newSheet);
  }
}

function example1(sheet) {

  // sample data set
  var initialData = [
    ['2015-12-01', '1.00000000','=B3*L3',             ,        , , , ,                      'Grab High/Lows from historical values tab on https://coinmarketcap.com',             '1.111100',            '0.992222','=AVERAGE(J3,K3)'],
    ['2016-02-29', '1.00000000',     '1',             ,        , , , ,'If USD amount paid to receive the coin is known, enter in col C and \'value known\' in col J',          'value known',         'value known',    'value known'],
    ['2016-03-01',             ,        , '1.00000000',     '5', , , ,   'If USD amount received for the coin is known, enter in col E and \'value known\' in col J',          'value known',         'value known',    'value known'],
    ['2018-02-28','23.00000000','=B6*L6',		 	        ,        , , , ,   'If USD purchase/sale price per coin is known, enter in col L and \'price known\' in col J',          'price known',         'price known',             '34'],
    ['2020-04-01',             ,		    , '2.00000000','=D7*L7', , , ,            'High/Low cells can contain formulas that translate sales of coin to BTC, to USD.',             '2.312002',              '1.8222','=AVERAGE(J7,K7)'],
    ['2020-04-02',             ,		    ,'20.00000000','=D8*L8', , , ,                        'i.e. Sale Outcome Known: binance.us traded 20 TEST for 0.0003561 BTC',   '=0.0003561*7088.25',  '=0.0003561*6595.92','=AVERAGE(J8,K8)'],
    ['2020-05-31','26.92000000','=B9*L9',             ,		 	 	 , , , ,               'i.e. Purchase Price Known: coinbase.com traded BTC for 26.92 TEST @ 0.0069319','=0.0069319*9700.34/B9','=0.0069319*9432.3/B9','=AVERAGE(J9,K9)']
    ];
  
  for (var i = 0; i < initialData.length; i++) {
    sheet.getRange('A'+(i+3)+':L'+(i+3)).setValues([initialData[i]]);
  }
  
  // trigger a Cost Basis calculation and sheet reformat
  calculateFIFO_();
  formatSheet_();
}
