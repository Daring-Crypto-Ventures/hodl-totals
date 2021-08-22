import { completeDataRow, formulaDataRow } from './types';

/**
 * Using the FIFO method calculate short and long term gains from the data.
 *
 */
export default function calculateFIFO(
    coinname: string,
    data: completeDataRow[],
    formulaData: formulaDataRow[], // TODO don't pass this in, find a better way for caller to track what rows got added
    lots: [string, number, number, number][],
    sales: [string, number, number, number][]
): [string, string][] {
    let shift: number; // Integer
    let lotCnt: number; // Integer
    let lotCoinRemain: number; // Double
    let costBasis: number; // Double
    let gainLoss: number; // Double
    let sellCoinRemain: number; // Double
    let sellDate: Date;
    let sellCoin: number; // Double
    let sellRecd: number; // Double
    let sellRow: number; // Integer
    const annotations: [string, string][] = [];
    const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
    const ONE_SATOSHI = 0.00000001;

    shift = 0;
    lotCnt = 0;

    // start with num coins that were necessarily bought in "lot 0'
    lotCoinRemain = lots[0][1];

    // if no sales yet, mark the status of the first lot as 0% sold
    if (sales.length === 0) {
        if (data.length === 2) {
            data.push(['', '', '', 0, 0, 0, 0, '', 0, 0, '', '', '', '']);
        }
        data[2][7] = '0% Sold';
    }

    for (const sale of sales) {
        let termSplit: boolean;
        let prevSplitRow: boolean;
        let splitFactor: number; // Double
        let totalCoin: number; // Double
        let totalCost: number; // Double
        let stLotCnt: number;
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
            let nextTerm: Date;
            let originalDate: Date;
            let originalCoin: number;
            let originalCost: number;
            const lotCoin = lots[lot][1];
            const lotCost = lots[lot][2];
            const lotRow = lots[lot][3];

            // mark 1 year from the lotDate, to use in gains calculations later
            const thisTerm = dateFromString(lots[lot][0], 1);

            // if the remaining coin to sell is less than what is in the lot,
            // calculate and post the cost basis and the gain or loss
            if ((sellCoinRemain <= lotCoinRemain) || (Math.abs(sellCoinRemain - lotCoinRemain) <= ONE_SATOSHI)) {
                if (Math.abs(sellCoinRemain - lotCoinRemain) <= ONE_SATOSHI) {
                    // all of this lot was sold
                    data[lotRow][7] = '100% Sold';

                    // if there are more lots to process, advance the lot count before breaking out
                    if ((lotCnt + 1) < lots.length) {
                        lotCnt += 1;
                        lotCoinRemain = lots[lotCnt][1];
                    }
                } else {
                    // only some of the lot remains
                    lotCoinRemain -= sellCoinRemain;
                    const percentSold = 1 - (lotCoinRemain / lotCoin);

                    data[lotRow][7] = `${(percentSold * 100).toFixed(0)}% Sold`;
                }

                // if sale more than 1 year and 1 day from purchase date mark as long-term gains
                if (!termSplit) {
                    if ((sellDate.getTime() - thisTerm.getTime()) / MILLIS_PER_DAY > 0) {
                        data[sellRow + shift][7] = 'Long-term';
                    } else {
                        data[sellRow + shift][7] = 'Short-term';
                    }
                }

                if (!prevSplitRow) {
                    // calculate and post results
                    totalCoin += sellCoinRemain;
                    totalCost += (lotCost * (sellCoinRemain / lotCoin));
                    costBasis = sellCoin * (totalCost / totalCoin) * (1 - splitFactor);
                    gainLoss = (sellRecd * (1 - splitFactor)) - costBasis;

                    data[sellRow + shift][3] = 0;
                    data[sellRow + shift][4] = 0;
                    data[sellRow + shift][8] = costBasis;
                    data[sellRow + shift][9] = gainLoss;
                    // Row numbers are based on the Google Sheet row which includes a +1 offset
                    annotations.push([`F${sellRow + shift + 1}`, soldNoteString(lots[stLotCnt][3], lots[stLotCnt][0], lots[lot][3], lots[lot][0])]);
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

                    originalDate = data[sellRow + shift][0] as unknown as Date; // TODO clean this TS mess up
                    originalCoin = Number(data[sellRow + shift][5]);
                    originalCost = Number(data[sellRow + shift][6]);

                    // post the long-term split
                    data[sellRow + shift][5] = originalCoin * splitFactor;
                    data[sellRow + shift][6] = originalCost * splitFactor;
                    data[sellRow + shift][7] = 'Long-term';
                    data[sellRow + shift][8] = costBasis;
                    data[sellRow + shift][9] = gainLoss;
                    // Row numbers are based on the Google Sheet row which includes a +1 offset
                    annotations.push([`F${sellRow + shift + 1}`, soldNoteString(lots[stLotCnt][3], lots[stLotCnt][0], lots[lot][3], lots[lot][0])]);

                    // Don't create note/new row if there is negligable value left in the short-term part
                    // likely caused by rounding errors repeating the cost basis calc on the same sheet
                    if (originalCoin * (1 - splitFactor) >= ONE_SATOSHI) {
                        // Row numbers are based on the Google Sheet row which includes a +3 offset
                        const splitNoteText = `Originally ${originalCoin.toFixed(8)} `
                            + `${coinname} was sold for $${originalCost.toFixed(2)} and split into rows ${sellRow + shift + 1} and ${sellRow + shift + 2}.`;
                        annotations.push([`A${sellRow + shift + 1}`, splitNoteText]);

                        // shift to the next row to post the short-term split
                        shift += 1;
                        // create the new row for the short-term part of the term split
                        data.splice(sellRow + shift, 0, [...data[sellRow + shift - 1]]);
                        formulaData.splice(sellRow + shift, 0, [...formulaData[sellRow + shift - 1]]);

                        // TODO copy any attached FMV notes over from old row to new row also
                        // TODO copy any FMV cell formatting over from old row to new row also
                        // Row numbers are based on the Google Sheet row which includes a +3 offset
                        annotations.push([`A${sellRow + shift + 1}`, splitNoteText]);
                        data[sellRow + shift][0] = originalDate as unknown as string; // TODO clean this TS mess up
                        data[sellRow + shift][5] = originalCoin * (1 - splitFactor);
                        data[sellRow + shift][6] = originalCost * (1 - splitFactor);
                        data[sellRow + shift][7] = 'Short-term';

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
                data[lotRow][7] = '100% Sold';
                lotCnt += 1;
                if (lotCnt < lots.length) {
                    lotCoinRemain = lots[lotCnt][1];
                }
            }
        }
    }
    return annotations;
}

/**
 * Helper function to parse the date string to return a Date object
 *
 * @param dateStr is a yyyy-mm-dd formatted string
 * @param incYear will increment the year value by specified amount
 *
 * @return Date object corresponding to that string input.
 */
function dateFromString(dateStr: string, incYear: number): Date {
    const year = Number(dateStr.substring(0, 4));
    const month = Number(dateStr.substring(5, 7));
    const day = Number(dateStr.substring(8, 10));

    return new Date(year + incYear, month - 1, day);
}

/**
* Helper function to create the text telling the user which lots were sold
* Row numbers are based on the Google Sheet row which includes a +1 offset
*    because Sheets are not zero index based, like the data array
*
* @return string
*/
function soldNoteString(rowStart: number, rowStartDate: string, rowEnd: number, rowEndDate: string): string {
    // denote which lots were sold on the date they were sold
    const fromStr = (rowStart === rowEnd) ? ' from' : `s from row ${rowStart + 1} on ${rowStartDate} to`;
    return `Sold lot${fromStr} row ${rowEnd + 1} on ${rowEndDate}.`;
}
