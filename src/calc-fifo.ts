/**
 * Using the FIFO method calculate short and long term gains from the data.
 *
 */
export default function calculateFIFO(
    data: [string, string, string, number, number, string, number, number, string ][],
    lots: [string, number, number, number][],
    sales: [string, number, number, number][]
): void {
    let shift; // Integer
    let lotCnt; // Integer
    let lotCoinRemain; // Double
    let costBasis; // Double
    let gainLoss; // Double
    let sellCoinRemain; // Double
    let sellDate; // Date
    let sellCoin; // Double
    let sellRecd; // Double
    let sellRow; // Integer
    const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
    const ONE_SATOSHI = 0.00000001;

    shift = 0;
    lotCnt = 0;

    // start with num coins that were necessarily bought in "lot 0'
    lotCoinRemain = lots[0][1];

    // if no sales yet, mark the status of the first lot as 0% sold
    if (sales.length === 0) {
        data[0][5] = '0% Sold';
    }

    for (const sale of sales) {
        let termSplit; // Boolean
        let prevSplitRow; // Boolean
        let splitFactor; // Double
        let totalCoin; // Double
        let totalCost; // Double
        let stLotCnt;
        termSplit = false; // flag if sale involved both short-term and long-term holdings
        prevSplitRow = false; // flag to avoid creating extra rows when running calc repeatedly on same sheet
        splitFactor = 0; // ratio of totalCoin to sellCoin
        totalCoin = 0; // running total of coins for basis
        totalCost = 0; // running total of dollar cost for basis
        sellDate = dateFromString(sale[0], 0);
        sellCoin = sale[1];
        sellCoinRemain = sale[1];
        sellRecd = sale[2];
        sellRow = sale[3];
        stLotCnt = lotCnt;

        for (let lot = lotCnt; lot < lots.length; lot++) {
            let nextTerm; // Date
            let originalDate; // Date
            let originalCoin; // Double
            let originalCost; // Double
            const lotCoin = lots[lot][1];
            const lotCost = lots[lot][2];
            const lotRow = lots[lot][3];

            // mark 1 year from the lotDate, to use in gains calculations later
            const thisTerm = dateFromString(lots[lot][0], 1);

            // if the remaining coin to sell is less than what is in the lot,
            // calculate and post the cost basis and the gain or loss
            if (sellCoinRemain <= lotCoinRemain) {
                if (Math.abs(sellCoinRemain - lotCoinRemain) <= ONE_SATOSHI) {
                    // all of this lot was sold
                    data[lotRow][5] = '100% Sold';

                    // if there are more lots to process, advance the lot count before breaking out
                    if ((lotCnt + 1) < lots.length) {
                        lotCnt += 1;
                        lotCoinRemain = lots[lotCnt][1];
                    }
                } else {
                    // only some of the lot remains
                    lotCoinRemain -= sellCoinRemain;
                    const percentSold = 1 - (lotCoinRemain / lotCoin);

                    data[lotRow][5] = `${(percentSold * 100).toFixed(0)}% Sold`;
                }

                // if sale more than 1 year and 1 day from purchase date mark as long-term gains
                if (!termSplit) {
                    if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) {
                        data[sellRow + shift][5] = 'Long-term';
                    } else {
                        data[sellRow + shift][5] = 'Short-term';
                    }
                }

                if (!prevSplitRow) {
                    // calculate and post results
                    totalCoin += sellCoinRemain;
                    totalCost += (lotCost * (sellCoinRemain / lotCoin));
                    costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
                    gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;

                    data[sellRow + shift][1] = '';
                    data[sellRow + shift][2] = '';
                    data[sellRow + shift][6] = costBasis;
                    data[sellRow + shift][7] = gainLoss;
                    data[sellRow + shift][8] = soldNoteString(lots[stLotCnt][3], lots[stLotCnt][0], lots[lot][3], lots[lot][0]);
                }

                break; // Exit the inner for loop
            } else {
                // if the remaining coin to sell is greater than what is in the lot,
                // determine if there is a term split, and calculate running totals

                // mark 1 year from the look-ahead lotDate
                if ((lot + 1) < lots.length) {
                    nextTerm = dateFromString(lots[lot + 1][0], 1);
                } else {
                    nextTerm = sellDate; // no look-ahead date, so no term-split, fall thru the next case
                }

                // look ahead for a term split, do additional calculations, and
                // split both sides of the split on two different rows
                if (((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0)
          && ((sellDate.getTime() - nextTerm.getTime()) / MILLIS_PER_DAY < 0)) {
                    termSplit = true;

                    // calculate the split factor
                    totalCoin += lotCoinRemain;
                    totalCost += (lotCost * (lotCoinRemain / lotCoin));
                    splitFactor = totalCoin / sellCoin;

                    costBasis = sellCoin * (totalCost / totalCoin) * splitFactor; // average price
                    gainLoss = (sellRecd * splitFactor) - costBasis;

                    originalDate = data[sellRow + shift][0];
                    originalCoin = Number(data[sellRow + shift][3]);
                    originalCost = Number(data[sellRow + shift][4]);

                    // post the long-term split
                    data[sellRow + shift][3] = originalCoin * splitFactor;
                    data[sellRow + shift][4] = originalCost * splitFactor;
                    data[sellRow + shift][5] = 'Long-term';
                    data[sellRow + shift][6] = costBasis;
                    data[sellRow + shift][7] = gainLoss;
                    data[sellRow + shift][8] = soldNoteString(lots[stLotCnt][3], lots[stLotCnt][0], lots[lot][3], lots[lot][0]);

                    // Don't create note/new row if there is negligable value left in the short-term part
                    // likely caused by rounding errors repeating the cost basis calc on the same sheet
                    if (originalCoin * (1 - splitFactor) >= ONE_SATOSHI) {
                        const splitNoteText = `Originally ${originalCoin.toFixed(8)} `
               + ` TESTCOIN was sold for $${originalCost.toFixed(2)
               } and split into rows ${sellRow + shift} and ${sellRow + shift + 1}.`;
                        console.log(`Row ${sellRow + shift}: ${splitNoteText}`);
                        // shift to the next row to post the short-term split
                        shift += 1;
                        // create the new row for the short-term part of the term split
                        data.splice(sellRow + shift, 0, ['', '', '', 0, 0, '', 0, 0, '']);
                        console.log(`Row ${sellRow + shift}: ${splitNoteText}`);
                        data[sellRow + shift][0] = originalDate;
                        data[sellRow + shift][3] = originalCoin * (1 - splitFactor);
                        data[sellRow + shift][4] = originalCost * (1 - splitFactor);
                        data[sellRow + shift][5] = 'Short-term';

                        // update lots after the split transaction to account for the inserted row
                        for (const lotAfterSplit of lots) {
                            if (lotAfterSplit[3] >= (sellRow + shift)) {
                                lotAfterSplit[3] += 1;
                            }
                        }

                        // reset the starting lot count to point at the lot after the lot sold via long-term split
                        // so that short-term part of split will get an accurate note attached
                        stLotCnt = lot + 1;
                    } else {
                        prevSplitRow = true;
                    }

                    totalCoin = 0;
                    totalCost = 0;
                } else {
                    // if there isn't a term split, add to the running totals
                    // and continue on to the next lot
                    totalCoin += lotCoinRemain;
                    totalCost += (lotCost * (lotCoinRemain / lotCoin));
                }
                // subtract the lot amount from the remaining coin to be sold,
                // and set up variables for the next lot, since this lot is completely used up
                sellCoinRemain -= lotCoinRemain;
                data[lotRow][5] = '100% Sold';
                lotCnt += 1;
                if (lotCnt < lots.length) {
                    lotCoinRemain = lots[lotCnt][1];
                }
            }
        }
    }
}

/**
 * Helper function to parse the date string to return a Date object
 *
 * @param dateStr is a yyyy-mm-dd formatted string
 * @param incYear will increment the year value by specified amount
 *
 * @return Date object corresponding to that string input.
 */
function dateFromString(dateStr, incYear): Date {
    const year = Number(dateStr.substring(0, 4));
    const month = Number(dateStr.substring(5, 7));
    const day = Number(dateStr.substring(8, 10));

    return new Date(year + incYear, month - 1, day);
}

/**
* Helper function to create the text telling the user which lots were sold
*
* @return string
*/
function soldNoteString(rowStart, rowStartDate, rowEnd, rowEndDate): string {
    // denote which lots were sold on the date they were sold
    const fromStr = (rowStart === rowEnd) ? ' from' : `s from row ${rowStart} on ${rowStartDate} to`;
    return `Sold lot${fromStr} row ${rowEnd} on ${rowEndDate}.`;
}
