/**
 * Utility class for managing ranges.
 */
export class RangeUtil {
    #name;
    #dataRanges = [];
    #autoMergeAddedRanges;
    #defaultRangeName = 'Not Specified';

    /**
     * Creates an instance of RangeUtil.
     * @param {Object} [options] - The options for the range.
     * @param {string} [options.name='Not Specified'] - The name of the range.
     * @param {boolean} [options.autoMergeAddedRanges=true] - Whether to automatically merge overlapping ranges.
     */
    constructor({ name, autoMergeAddedRanges }) {
        this.#name = name || this.#defaultRangeName;
        this.#autoMergeAddedRanges = autoMergeAddedRanges || true;
    }

    /**
     * Adds a range to the list of data ranges.
     * @param {Object} options - The options for the range.
     * @param {number} options.start - The start of the range.
     * @param {number} [options.end=options.start] - The end of the range.
     * @throws {Error} Throws an error if the start or end values are not numbers.
     */
    addRange({ start, end = start }) {
        if (typeof start !== 'number' || typeof end !== 'number') {
            throw new Error('Number ranges must be numbers');
        }
        if (start > end) {
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
        this.#dataRanges.sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < this.#dataRanges.length - 1; i++) {
            if (this.#dataRanges[i][1] >= this.#dataRanges[i + 1][0]) {
                this.#dataRanges[i][1] = this.#dataRanges[i + 1][1];
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
        return this.#dataRanges.reduce((acc, range) => range.length > 1 ? acc + (range[1] - range[0]) : acc + 0, 0);
    }

    /**
     * Returns the minimum value in the ranges.
     * @type {number}
     */
    get min() {
        return this.#dataRanges.reduce((acc, range) => range.length > 1 ? Math.min(acc, range[0]) : acc, Infinity);
    }

    /**
     * Returns the maximum value in the ranges.
     * @type {number}
     */
    get max() {
        return this.#dataRanges.reduce((acc, range) => range.length > 1 ? Math.max(acc, range[1]) : acc, -Infinity);
    }

    /**
     * Returns the gaps between the ranges.
     * @type {Array<Array<number>>}
     */
    get rangeGaps() {
        const gaps = [];
        for (let i = 0; i < this.#dataRanges.length - 1; i++) {
            if (this.#dataRanges[i]?.length > 1 && this.#dataRanges[i + 1]?.length > 0) {
                gaps.push([this.#dataRanges[i][1], this.#dataRanges[i + 1][0]]);
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
        return this.#dataRanges.filter(range => (range[0] === value && range[1] === value) || (range[0] <= value && value < range[1]));
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
    constructor({ name, autoMergeAddedRanges = true }) {
        this.#rangeUtil = new RangeUtil({ name, autoMergeAddedRanges });
    }

    /**
     * Adds a date range to the utility.
     * If no start date is provided, the current local date at midnight is used.
     * If no end date is provided, the start date is used.
     * @param {Object} options - The options for the date range.
     * @param {Date} options.startDate - The start date of the range.
     * @param {Date} [options.endDate=options.startDate] - The end date of the range.
     */
    addRange({ startDate, endDate = startDate }) {
        const today = new Date();
        if (!(startDate instanceof Date)) {
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        }
        if (!(endDate instanceof Date)) {
            endDate = startDate;
        }
        this.#rangeUtil.addRange({ start: startDate.valueOf(), end: endDate.valueOf() });
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
    get rangeGapDates() {
        return this.#rangeUtil.rangeGaps.map(([start, end]) => [new Date(start), new Date(end)]);
    }

    /**
     * Returns an array of ranges with the specified value.
     * @param {Date} value - The JS Date to be found in the ranges.
     * @returns {Array<Array<Date>>} An array of JS Date ranges with the specified value. (Start <= value < End)
     */
    getRangesContainingValue(value) {
        if (value instanceof Date) {
            return this.#rangeUtil.getRangesContainingValue(value.valueOf()).map(([start, end]) => [new Date(start), new Date(end)]);
        }
        return [];
    }
}