/**
 * Utility class for managing ranges.
 * Ranges are stored as an array of arrays where each sub-array contains two numbers representing the start and end of the range.
 * The ranges are sorted by the start value.
 * A range can have a null value representing +/- infinity.
 */
export class RangeUtil {
    #name = 'Not Specified';
    #dataRanges = [];
    #autoMergeAddedRanges = true;

    /**
     * Creates an instance of RangeUtil.
     * @param {Object} [options] - The options for the range.
     * @param {string} [options.name='Not Specified'] - The name of the range.
     * @param {boolean} [options.autoMergeAddedRanges=true] - Whether to automatically merge overlapping ranges.
     */
    constructor({ name, autoMergeAddedRanges }) {
        this.#name ??= name;
        this.#autoMergeAddedRanges ??= autoMergeAddedRanges;
    }

    /**
     * Adds a range to the list of data ranges.
     * @param {Object} options - The options for the range.
     * @param {number} options.start - The start of the range.
     * @param {number} options.end - The end of the range.
     * @throws {Error} Throws an error if the start or end values are not numbers, or both are null.
     */
    addRange({ start, end }) {
        if (start === null && end === null) {
            throw new Error('Cannot add null start and end range. That\'s not a range.');
        }

        if (typeof start !== 'number' && typeof end !== 'number') {
            throw new Error('Start or end value must be a number.');
        }
        if (typeof start !== 'number') {
            start = null;
        }
        if (typeof end !== 'number') {
            end = null;
        }
        if (start !== null && end !== null && start > end) {
            const temp = start;
            start = end;
            end = temp;
        }
        this.#dataRanges.push([start, end]);
        if (this.#autoMergeAddedRanges) {
            this.#mergeRanges();
        }
    }

    /**
     * Merges overlapping ranges in the list of data ranges.
     * @private
     */
    #mergeRanges() {
        // make sure all ranges are sorted by start value with null values at the beginning.
        this.#dataRanges.sort((a, b) => a[0] === null ? -1 : b[0] === null ? 1 : a[0] - b[0]);
        // Merge overlapping ranges where start is inclusive and end is exclusive. So [1, 3] and [3, 5] would merge to [1, 5], but [1, 3] and [4, 5] would not merge.
        for (let i = 0; i < this.#dataRanges.length - 1; i++) {
            // check to see if we can merge based on first range end being > second range start, or the second range start being null.
            if (this.#dataRanges[i + 1][0] === null || (this.#dataRanges[i + 1][0] !== null && this.#dataRanges[i][1] > this.#dataRanges[i + 1][0])) {
                // throw an error if second range end is null and first range start is null.
                if (this.#dataRanges[i + 1][1] === null && this.#dataRanges[i][1] === null) {
                    throw new Error('Cannot merge ranges resulting in null start and end values.');
                }
                this.#dataRanges[i][1] = Math.max(this.#dataRanges[i][1], this.#dataRanges[i + 1][1]);
                this.#dataRanges.splice(i + 1, 1);
                i--;
            }
        }
    }

    /**
     * Returns the total length of all the ranges.
     * @type {number}
     */
    get length() {
        return this.#dataRanges.reduce((acc, range) => range.length > 1 && range[0] !== null && range[1] !== null ? acc + (range[1] - range[0]) : acc + 0, 0);
    }

    /**
     * Returns the minimum value in the ranges.
     * @type {number}
     */
    get min() {
        return this.#dataRanges.reduce((acc, range) => range.length > 1 && range[0] !== null ? Math.min(acc, range[0]) : acc, Infinity);
    }

    /**
     * Returns the maximum value in the ranges.
     * @type {number}
     */
    get max() {
        return this.#dataRanges.reduce((acc, range) => range.length > 1 && range[1] !== null ? Math.max(acc, range[1]) : acc, -Infinity);
    }

    /**
     * Returns the gaps between the ranges.
     * @param {Object} options - The options for the range.
     * @param {Array} options.range - Uses this range to find gaps when refrencing the data ranges.
     * @type {Array<Array<number>>}
     */
    rangeGaps({ start, end }) {
        const gaps = [];
        if (this.#autoMergeAddedRanges && this.#dataRanges.length > 0) {
            // If a range is provided, use that to find the gaps.
            if (typeof start === 'number' && typeof end === 'number' && isNaN(start) === false && isNaN(end) === false) {
                const range = [Math.min(start, end), Math.max(start, end)];
                // if dataRanges is [[1, 3]] and the passed in range is [0, 5], then the gap is [0, 1] and [3, 5]
                // another example is [[1, 3], [5, 7]] and the passed in range is [0, 8], then the gap is [0, 1], [3, 5], [7, 8]
                // check the first range to see if start is before the first range start.
                if (this.#dataRanges[0][0] !== null && this.#dataRanges[0][0] > range[0]) {
                    gaps.push([range[0], this.#dataRanges[0][0]]);
                }
                // loop through the data ranges.
                for (let i = 0; i < this.#dataRanges.length - 1; i++) {
                    // if range end is greater than the passed in start, then push range end to min of next range start and passed in end.
                    if (this.#dataRanges[i][1] > range[0]) {
                        const gapEnd = Math.min(this.#dataRanges[i + 1][0], range[1]);
                        gaps.push([this.#dataRanges[i][1], gapEnd]);
                        // if the gap end is the same as the passed in end, then break out of the loop.
                        if (gapEnd === range[1]) {
                            break;
                        }
                    }
                }
                // check the last range to see if end is after the last range end.
                if (this.#dataRanges[this.#dataRanges.length - 1][1] !== null && this.#dataRanges[this.#dataRanges.length - 1][1] < range[1]) {
                    gaps.push([this.#dataRanges[this.#dataRanges.length - 1][1], range[1]]);
                }
            } else {
                if (this.#dataRanges.length > 1) {
                    for (let i = 0; i < this.#dataRanges.length - 1; i++) {
                        gaps.push([this.#dataRanges[i][1], this.#dataRanges[i + 1][0]]);
                    }
                }
            }
        }
        return gaps;
    }

    /**
     * Returns the name of the range.
     * @type {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * Sets the name of the range.
     * @param {string} _name - The new name for the range.
     */
    set name(_name) {
        if (typeof _name === 'string') {
            this.#name = _name;
        }
    }

    /**
     * Returns an array of ranges with the specified value.
     * @param {string} value - The value to be found in the ranges.
     * @returns {Array<Array<number>>} An array of ranges with the specified value. (Start <= value < End)
     * @throws {Error} Throws an error if the value is not a number.
     */
    getRangesContainingValue(value) {
        if (typeof value !== 'number') {
            throw new Error('Value must be a number');
        }
        return this.#dataRanges.filter(range => range[0] === value || (range[0] <= value && value < range[1]));
    }
}
/**
 * Utility class for working with date ranges.
 */
export class DateRangeUtil {
    #rangeUtil;

    /**
     * Creates an instance of DateRangeUtil.
     * @param {Object} [options] - The options for the date range.
     * @param {string} [options.name='Not Specified'] - The name of the date range.
     * @param {boolean} [options.autoMergeAddedRanges=true] - Whether to automatically merge overlapping ranges.
     */
    constructor({ name, autoMergeAddedRanges }) {
        this.#rangeUtil = new RangeUtil({ name, autoMergeAddedRanges });
    }

    /**
     * Adds a date range to the utility.
     * If no start date is provided, the current local date at midnight is used.
     * If no end date is provided, the start date is used.
     * @param {Object} options - The options for the date range.
     * @param {Date} options.startDate - The start date of the range.
     * @param {Date} options.endDate - The end date of the range
     */
    addRange({ startDate, endDate }) {
        this.#rangeUtil.addRange({ start: startDate?.valueOf(), end: endDate?.valueOf() });
    }

    /**
     * Gets the length of the date ranges in milliseconds.
     * @returns {number} The length of the date range in milliseconds.
     */
    get lengthInMs() {
        return this.#rangeUtil.length;
    }

    /**
     * Gets the minimum date in the date ranges.
     * @returns {Date} The minimum date in the date range.
     */
    get minDate() {
        return new Date(this.#rangeUtil.min);
    }

    /**
     * Gets the maximum date in the date ranges.
     * @returns {Date} The maximum date in the date range.
     */
    get maxDate() {
        return new Date(this.#rangeUtil.max);
    }

    /**
     * Gets the gap dates between the date ranges.
     * @returns {Array<Array<Date>>} An array of gap dates between the ranges in the date range.
     */
    rangeGapDates({ start, end }) {
        return this.#rangeUtil.rangeGaps({ start: start?.valueOf(), end: end?.valueOf() }).map(([start, end]) => [new Date(start), new Date(end)]);
    }

    /**
     * Returns an array of ranges with the specified value.
     * @param {Date} value - The JS Date to be found in the ranges.
     * @returns {Array<Array<Date>>} An array of JS Date ranges with the specified value. (Start <= value < End)
     */
    getRangesContainingValue(value) {
        if (value instanceof Date) {
            return this.#rangeUtil.getRangesContainingValue(value.valueOf()).map(([start, end]) => {
                return [start ? new Date(start) : null, end ? new Date(end) : null];
            });
        }
        return [];
    }
}