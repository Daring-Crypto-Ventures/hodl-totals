/**
 * Algo described here:
 * https://yagisanatode.com/2019/05/11/google-apps-script-get-the-last-row-of-a-data-range-
 * when-other-columns-have-content-like-hidden-formulas-and-check-boxes/
 *
 * Gets the last row number based on a selected column range values
 *
 * @param {array} range : takes a 2d array of a single column's values
 * @returns {number} : the last row number with a value.
 *
 */
export default function getLastRowWithDataPresent(range: string[][]): number {
    let rowNum = 0;
    let blank = false;
    for (let row = 0; row < range.length; row++) {
        if (range[row][0] === '' && !blank) {
            rowNum = row;
            blank = true;
        } else if (range[row][0] !== '') {
            blank = false;
        }
    }
    return rowNum;
}
