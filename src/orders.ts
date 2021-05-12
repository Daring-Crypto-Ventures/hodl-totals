/**
 * Extract non-empty rows of either coin purchase data or sale data from the sheet
 *
 * @return lots 2D array of {date, amt coin, price}
 */
export default function getOrderList(dateDisplayValues: [string][], lastRow: number, coinAndPriceData: [number, number][]): [string, number, number, number][] {
    const orderList = [];
    let order;
    order = 0;

    // compact the data into a contiguous array
    for (let row = 0; row < lastRow; row++) {
        if (coinAndPriceData[row][0] > 0) {
            orderList[order] = new Array(4);
            orderList[order][0] = dateDisplayValues[row][0]; // date of order  TODO - [0] needed when running in Sheet, but the [0] breaks calculations when running locally (this causes bad date)
            orderList[order][1] = coinAndPriceData[row][0]; // amount of coin bought or sold
            orderList[order][2] = coinAndPriceData[row][1]; // purchase price or sale price
            orderList[order][3] = row;
            order += 1;
        }
    }

    return orderList;
}
