/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */

/**
 * A function that adds columns and headers to the spreadsheet.
 * 
 * @return the newly created sheet, for function chaining purposes.
 */
function newCategorySheet() {
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Categories'); 
  
  // populate the header cells
  var header = ['Categories', 'Type','Tax Status', 'Inflow Categories','Outflow Categories'];
  sheet.getRange('A1:E1').setValues([header]).setFontWeight('bold');
    
  // Initial set of categories provided out of the box
  var initialData = [
    ['USD Deposit',     'Cash In', 'Not Taxable','=IF(EXACT(B2,\"Inflow\"), A2, \"\")', '=IF(AND(EXACT(B2,\"Outflow\"),NOT(EXACT(A2,\"Traded\")),NOT(EXACT(A2,\"Tx Fee\"))), A2, \"\")'],
    ['USD Withdrawal',   'Cash Out','Taxable',    '=IF(EXACT(B3,\"Inflow\"), A3, \"\")', '=IF(AND(EXACT(B3,\"Outflow\"),NOT(EXACT(A3,\"Traded\")),NOT(EXACT(A3,\"Tx Fee\"))), A3, \"\")'],
    ['Active Airdrop',  'Inflow',  'Taxable',    '=IF(EXACT(B4,\"Inflow\"), A4, \"\")', '=IF(AND(EXACT(B4,\"Outflow\"),NOT(EXACT(A4,\"Traded\")),NOT(EXACT(A4,\"Tx Fee\"))), A4, \"\")'],
    ['Passive Airdrop', 'Inflow',  'Not Taxable','=IF(EXACT(B5,\"Inflow\"), A5, \"\")', '=IF(AND(EXACT(B5,\"Outflow\"),NOT(EXACT(A5,\"Traded\")),NOT(EXACT(A5,\"Tx Fee\"))), A5, \"\")'],
    ['Bounty Fulfilled','Inflow',  'Taxable',    '=IF(EXACT(B6,\"Inflow\"), A6, \"\")', '=IF(AND(EXACT(B6,\"Outflow\"),NOT(EXACT(A6,\"Traded\")),NOT(EXACT(A6,\"Tx Fee\"))), A6, \"\")'],
    ['Fork',            'Inflow',  'Taxable',    '=IF(EXACT(B7,\"Inflow\"), A7, \"\")', '=IF(AND(EXACT(B7,\"Outflow\"),NOT(EXACT(A7,\"Traded\")),NOT(EXACT(A7,\"Tx Fee\"))), A7, \"\")'],
    ['Gift Received',   'Inflow',  'Not Taxable','=IF(EXACT(B8,\"Inflow\"), A8, \"\")', '=IF(AND(EXACT(B8,\"Outflow\"),NOT(EXACT(A8,\"Traded\")),NOT(EXACT(A8,\"Tx Fee\"))), A8, \"\")'],
    ['Interest',        'Inflow',  'Taxable',    '=IF(EXACT(B9,\"Inflow\"), A9, \"\")', '=IF(AND(EXACT(B9,\"Outflow\"),NOT(EXACT(A9,\"Traded\")),NOT(EXACT(A9,\"Tx Fee\"))), A9, \"\")'],
    ['Mining',          'Inflow',  'Taxable',    '=IF(EXACT(B10,\"Inflow\"), A10, \"\")', '=IF(AND(EXACT(B10,\"Outflow\"),NOT(EXACT(A10,\"Traded\")),NOT(EXACT(A10,\"Tx Fee\"))), A10, \"\")'],
    ['Reward/Prize',    'Inflow',  'Taxable',    '=IF(EXACT(B11,\"Inflow\"), A11, \"\")', '=IF(AND(EXACT(B11,\"Outflow\"),NOT(EXACT(A11,\"Traded\")),NOT(EXACT(A11,\"Tx Fee\"))), A11, \"\")'],
    ['Promotion',       'Inflow',  'Taxable',    '=IF(EXACT(B12,\"Inflow\"), A12, \"\")', '=IF(AND(EXACT(B12,\"Outflow\"),NOT(EXACT(A12,\"Traded\")),NOT(EXACT(A12,\"Tx Fee\"))), A12, \"\")'],
    ['Sales Revenue',   'Inflow',  'Taxable',    '=IF(EXACT(B13,\"Inflow\"), A13, \"\")', '=IF(AND(EXACT(B13,\"Outflow\"),NOT(EXACT(A13,\"Traded\")),NOT(EXACT(A13,\"Tx Fee\"))), A13, \"\")'],
    ['Staking',         'Inflow',  'Taxable',    '=IF(EXACT(B14,\"Inflow\"), A14, \"\")', '=IF(AND(EXACT(B14,\"Outflow\"),NOT(EXACT(A14,\"Traded\")),NOT(EXACT(A14,\"Tx Fee\"))), A14, \"\")'],
    ['Tip Income',      'Inflow',  'Not Taxable','=IF(EXACT(B15,\"Inflow\"), A15, \"\")', '=IF(AND(EXACT(B15,\"Outflow\"),NOT(EXACT(A15,\"Traded\")),NOT(EXACT(A15,\"Tx Fee\"))), A15, \"\")'],
    ['Unknown Inflow',  'Inflow',  'Taxable',    '=IF(EXACT(B16,\"Inflow\"), A16, \"\")', '=IF(AND(EXACT(B16,\"Outflow\"),NOT(EXACT(A16,\"Traded\")),NOT(EXACT(A16,\"Tx Fee\"))), A16, \"\")'],
    ['Lost/Stolen',     'Outflow', 'Taxable',    '=IF(EXACT(B17,\"Inflow\"), A17, \"\")', '=IF(AND(EXACT(B17,\"Outflow\"),NOT(EXACT(A17,\"Traded\")),NOT(EXACT(A17,\"Tx Fee\"))), A17, \"\")'],
    ['Given Away',      'Outflow', 'Not Taxable','=IF(EXACT(B18,\"Inflow\"), A18, \"\")', '=IF(AND(EXACT(B18,\"Outflow\"),NOT(EXACT(A18,\"Traded\")),NOT(EXACT(A18,\"Tx Fee\"))), A18, \"\")'],
    ['Project Ended',   'Outflow', 'Taxable',    '=IF(EXACT(B19,\"Inflow\"), A19, \"\")', '=IF(AND(EXACT(B19,\"Outflow\"),NOT(EXACT(A19,\"Traded\")),NOT(EXACT(A19,\"Tx Fee\"))), A19, \"\")'],
    ['Sold for Goods',  'Outflow', 'Taxable',    '=IF(EXACT(B20,\"Inflow\"), A20, \"\")', '=IF(AND(EXACT(B20,\"Outflow\"),NOT(EXACT(A20,\"Traded\")),NOT(EXACT(A20,\"Tx Fee\"))), A20, \"\")'],
    ['Spent',           'Outflow', 'Taxable',    '=IF(EXACT(B21,\"Inflow\"), A21, \"\")', '=IF(AND(EXACT(B21,\"Outflow\"),NOT(EXACT(A21,\"Traded\")),NOT(EXACT(A21,\"Tx Fee\"))), A21, \"\")'],
    ['Traded',          'Outflow', 'Taxable',    '=IF(EXACT(B22,\"Inflow\"), A22, \"\")', '=IF(AND(EXACT(B22,\"Outflow\"),NOT(EXACT(A22,\"Traded\")),NOT(EXACT(A22,\"Tx Fee\"))), A22, \"\")'],
    ['Tx Fee',          'Outflow', 'Taxable',    '=IF(EXACT(B23,\"Inflow\"), A23, \"\")', '=IF(AND(EXACT(B23,\"Outflow\"),NOT(EXACT(A23,\"Traded\")),NOT(EXACT(A23,\"Tx Fee\"))), A23, \"\")'],
    ['Unknown Outflow', 'Outflow', 'Taxable',    '=IF(EXACT(B24,\"Inflow\"), A24, \"\")', '=IF(AND(EXACT(B24,\"Outflow\"),NOT(EXACT(A24,\"Traded\")),NOT(EXACT(A24,\"Tx Fee\"))), A24, \"\")']
   ];
 
  for (var i = 0; i < initialData.length; i++) {
    sheet.getRange('A'+(i+2)+':E'+(i+2)).setValues([initialData[i]]);
  }

  // autosize the 5 columns' widths to fit content
  sheet.autoResizeColumns(1, 5);  

  // draw border around the rows that will fed into dropdowns in other sheets
  sheet.getRange('A2:C35').setBorder(true,true,true,true,false,false);

  SpreadsheetApp.flush();
  return sheet;
}


