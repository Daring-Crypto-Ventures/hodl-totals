import calculateFIFO from './calc-fifo';
import getOrderList from './orders';

/**
 * jest unit tests
 * https://medium.com/@wesvdl1995/testing-nodejs-code-with-jest-28267a69324
 *
 */
test('Check calculations on Example', () => {
    const initialData: [string, number, number, number, number, string, number, number, string ][] = [
        ['2017/01/01', 0.20000000, 2000.00, 0, 0, '', 0, 0, ''],
        ['2018/02/01', 0.60000000, 6000.00, 0, 0, '', 0, 0, ''],
        ['2018/02/01', 0, 0, 0.05000000, 1000.00, '', 0, 0, ''],
        ['2018/03/01', 0, 0, 0.05000000, 1000.00, '', 0, 0, ''],
        ['2018/03/01', 0, 0, 0.30000000, 6000.00, '', 0, 0, ''],
        ['2018/03/02', 0.40000000, 4000.00, 0, 0, '', 0, 0, ''],
        ['2018/03/03', 0.80000000, 8000.00, 0, 0, '', 0, 0, ''],
        ['2018/03/04', 0.60000000, 6000.00, 0, 0, '', 0, 0, ''],
        ['2018/03/05', 0, 0, 0.10000000, 500.00, '', 0, 0, ''],
        ['2018/03/06', 0, 0, 0.10000000, 1000.00, '', 0, 0, ''],
        ['2018/03/07', 0, 0, 0.10000000, 2000.00, '', 0, 0, '']];

    // execute the tests based on the test dataset
    const result = FIFOCalc(initialData);
    console.log(`FIFOCalc() Test0 result ${result}`);
    expect(result).toBeTruthy();
});

test('Check calculations on p0 Bug Fix', () => {
    const initialData: [string, number, number, number, number, string, number, number, string ][] = [
        ['2019-02-14', 201.89592700, 25.30, 0, 0, '', 0, 0, ''],
        ['2019-03-13', 104.50000000, 20.25, 0, 0, '', 0, 0, ''],
        ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-13', 5.55555600, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-13', 38.88888900, 7.00, 0, 0, '', 0, 0, ''],
        ['2019-03-30', 3.55968800, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-30', 3.56238300, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-30', 3.56293500, 1.00, 0, 0, '', 0, 0, ''],
        ['2019-03-30', 24.93663400, 6.98, 0, 0, '', 0, 0, ''],
        ['2019-04-09', 14.25000000, 4.14, 0, 0, '', 0, 0, ''],
        ['2019-05-09', 14.25000000, 4.22, 0, 0, '', 0, 0, ''],
        ['2019-06-10', 19.00000000, 6.19, 0, 0, '', 0, 0, ''],
        ['2019-09-08', 7.60000000, 1.34, 0, 0, '', 0, 0, ''],
        ['2019-10-09', 49.40000000, 10.18, 0, 0, '', 0, 0, ''],
        ['2019-11-08', 25.65000000, 6.20, 0, 0, '', 0, 0, ''],
        ['2019-12-07', 43.46250000, 8.40, 0, 0, '', 0, 0, ''],
        ['2020-01-07', 4.50000000, 0.88, 0, 0, '', 0, 0, ''],
        ['2020-02-01', 61.91077800, 13.76, 0, 0, '', 0, 0, ''],
        ['2020-02-09', 23.51250000, 6.24, 0, 0, '', 0, 0, ''],
        ['2020-02-09', 20.35000000, 5.40, 0, 0, '', 0, 0, ''],
        ['2020-03-06', 22.05640000, 5.23, 0, 0, '', 0, 0, ''],
        ['2020-03-09', 75.76250000, 14.54, 0, 0, '', 0, 0, ''],
        ['2020-04-06', 24.21220000, 3.73, 0, 0, '', 0, 0, ''],
        ['2020-04-08', 25.650000, 4.23, 0, 0, '', 0, 0, ''],
        ['2020-05-04', 0, 0, 829.14, 151.26, '', 0, 0, '']];

    // execute the tests based on the test dataset
    const result = FIFOCalc(initialData);
    console.log(`FIFOCalc() Test1 result ${result}`);
    expect(result).toBeTruthy();
});

/**
 * Test the FIFO Calculation function outside of the spreadsheet context
 *
 * TODO - reimplement to avoid array copies
 * https://stackoverflow.com/questions/51383031/slice-section-of-two-dimensional-array-in-javascript
 *
 * @return true = passm, false = fail
 */
function FIFOCalc(data: [string, number, number, number, number, string, number, number, string ][]): boolean {
    const dateArray = new Array(data.length);
    const lotsArray = new Array(data.length);
    const salesArray = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
        dateArray[i] = data[i]; // order date
        lotsArray[i] = new Array(2);
        lotsArray[i][0] = Number(data[i][1]); // amount purchased
        lotsArray[i][1] = Number(data[i][2]); // purchase price
        salesArray[i] = new Array(2);
        salesArray[i][0] = Number(data[i][3]); // amount sold
        salesArray[i][1] = Number(data[i][4]); // sale price
        data[i][5] = ''; // status
        data[i][6] = 0; // costBasis
        data[i][7] = 0; // gain(Loss)
        data[i][8] = ''; // note
    }

    // add freshly calculated values
    const lots = getOrderList(dateArray, data.length, lotsArray);
    console.log(`Detected ${lots.length} purchases of TESTCOIN.`);

    const sales = getOrderList(dateArray, data.length, salesArray);
    console.log(`Detected ${sales.length} sales of TESTCOIN.`);

    const annotations = calculateFIFO('TESTCOIN', data, lots, sales);
    console.table(data);
    console.log('Annotations to make at each (Row, Col) location:');
    console.table(annotations);

    // TODO - check calculated columns in data to see if they matched expected
    // if didn't match, return false
    // else continue on

    // output the current date and time as the time last completed
    // Google Apps Script API can do this with Utilities.formatDate(new Date(), 'CST', 'MMMM dd, yyyy HH:mm');
    const date = new Date(Date.now());
    const now = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    console.log(`Last calculation succeeded ${now}`);

    return true; // pass
}
