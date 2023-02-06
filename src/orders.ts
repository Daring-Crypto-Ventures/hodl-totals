/**
 * Extract non-empty rows of either coin purchase data or sale data from the sheet
 *
 * @return lots 2D array of {date, amt coin, price}
 */
export default function getOrderList(dateDisplayValues: Date[], coinAndPriceData: [number, number][]): [Date, number, number, number][] {
    const orderList: [Date, number, number, number][] = [];
    let order = 0;

    // compact the data into a contiguous array
    coinAndPriceData.forEach((row, rowIdx) => {
        if (row[0] > 0) {
            orderList[order] = new Array(4) as [Date, number, number, number];
            orderList[order][0] = dateDisplayValues[rowIdx]; // date of order
            orderList[order][1] = row[0]; // amount of coin bought or sold
            orderList[order][2] = row[1]; // purchase price or sale price
            orderList[order][3] = rowIdx;
            order += 1;
        }
    });

    return orderList;
}
