import { IntervalNumber, Interval } from "./interval.js";
/**
 * Represents interval set options.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 */
export class IntervalSetOptions {
    constructor() {
        this.mergeAddedInterval = true;
    }
}
/**
 * Represents a set of intervals.
 * intervals is optional and defaults to an empty array.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 * @example
 * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }), new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(15, false) })], options: { mergeAddedInterval: true });
 */
export class IntervalSet {
    /**
     * Creates a new IntervalSet object.
     * intervalSet is optional and defaults to undefined.
     * @param intervalSet - The interval set object.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }), new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(15, false) })], options: { mergeAddedInterval: true });
     */
    constructor(intervalSet) {
        var _a, _b;
        this.intervals = [];
        this.mergeAddedInterval = true;
        if (intervalSet === null || intervalSet === void 0 ? void 0 : intervalSet.intervals) {
            for (const interval of intervalSet.intervals) {
                const intervalObject = new Interval(interval);
                this.intervals.push(intervalObject);
            }
        }
        this.mergeAddedInterval = (_b = (_a = intervalSet === null || intervalSet === void 0 ? void 0 : intervalSet.options) === null || _a === void 0 ? void 0 : _a.mergeAddedInterval) !== null && _b !== void 0 ? _b : true;
        if (this.mergeAddedInterval) {
            this.mergeIntervals();
        }
        this.sort();
    }
    /**
     * Sorts the intervals in the interval set, ascending based on the minimum value of each interval and isClosed is before !isClosed.
     */
    sort() {
        this.intervals.sort((a, b) => {
            if (a.min.number < b.min.number) {
                return -1;
            }
            else if (a.min.number > b.min.number) {
                return 1;
            }
            else {
                if (a.min.isClosed && !b.min.isClosed) {
                    return -1;
                }
                else if (!a.min.isClosed && b.min.isClosed) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
    }
    /**
     * Adds an interval to the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.addInterval(new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }));
     * @example
     * intervalSet.addInterval('[1, 10)');
     */
    addInterval(interval) {
        const intervalObject = new Interval(interval);
        this.intervals.push(intervalObject);
        if (this.mergeAddedInterval) {
            this.mergeIntervals();
        }
        this.sort();
    }
    /**
     * Removes an interval from the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.removeInterval(new Interval({ a: 1, b: 10 }));
     * @example
     * intervalSet.removeInterval('[1, 10)');
     */
    removeInterval(interval) {
        const intervalObject = new Interval(interval);
        this.intervals = this.intervals.filter((r) => r.toString() !== intervalObject.toString());
    }
    /**
     * Remove interval by name.
     * @param name - The name of the interval.
     * @example
     * intervalSet.removeIntervalByName('Interval 1');
     */
    removeIntervalByName(name) {
        this.intervals = this.intervals.filter((r) => r.name !== name);
    }
    /**
     * Removes all intervals from the interval set.
     */
    clear() {
        this.intervals = [];
    }
    /**
     * Merge overlapping intervals in the interval set.
     */
    mergeIntervals() {
        this.sort();
        for (let i = 0; i < this.intervals.length - 1; i++) {
            const current = this.intervals[i];
            const next = this.intervals[i + 1];
            if (current.contains(next.min) || (current.max.number === next.min.number && current.max.isClosed === !next.min.isClosed)) {
                current.max = current.max.number > next.max.number ? current.max : next.max;
                this.intervals.splice(i + 1, 1);
                i--;
            }
        }
    }
    /**
     * Returns the gaps between the intervals in the passed in interval..
     * If interval is provided, the gaps are calculated based on the given interval.
     * If interval is not provided, the gaps are calculated based on the intervals in the interval set.
     * @param interval - The interval object or string representation.
     * @returns An array of Interval objects representing the gaps.
     */
    getIntervalGaps(interval) {
        const intervalObject = interval ? new Interval(interval) : undefined;
        const gaps = [];
        // make sure the intervals are sorted for the following logic to work
        this.sort();
        if (intervalObject) {
            // get all intervals that overlap with the given interval
            const overlappingIntervals = this.intervals.filter((r) => r.overlaps(intervalObject));
            // if there are no overlapping intervals, return the given interval
            if (overlappingIntervals.length === 0) {
                return [intervalObject];
            }
            else {
                // sort the overlapping intervals
                overlappingIntervals.sort((a, b) => {
                    if (a.min.number < b.min.number) {
                        return -1;
                    }
                    else if (a.min.number > b.min.number) {
                        return 1;
                    }
                    else {
                        if (a.min.isClosed && !b.min.isClosed) {
                            return -1;
                        }
                        else if (!a.min.isClosed && b.min.isClosed) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                });
                // if the given interval's min is not contained in the first overlapping interval, then it's assumed that the given min is before the first overlapping interval
                if (!overlappingIntervals[0].contains(intervalObject.min)) {
                    gaps.push(new Interval({ a: intervalObject.min, b: new IntervalNumber(overlappingIntervals[0].min.number, !overlappingIntervals[0].min.isClosed) }));
                }
                // loop through the overlapping intervals and find the gaps between them
                for (let i = 0; i < overlappingIntervals.length - 1; i++) {
                    const current = overlappingIntervals[i];
                    const next = overlappingIntervals[i + 1];
                    // If the intervals are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Interval({ a: new IntervalNumber(current.max.number, !current.max.isClosed), b: new IntervalNumber(next.min.number, !next.min.isClosed) }));
                    }
                }
                // check if the given interval's max is not in the last overlapping interval, assuming that the given max is after the last overlapping interval
                if (!overlappingIntervals[overlappingIntervals.length - 1].contains(intervalObject.max)) {
                    gaps.push(new Interval({ a: new IntervalNumber(overlappingIntervals[overlappingIntervals.length - 1].max.number, !overlappingIntervals[overlappingIntervals.length - 1].max.isClosed), b: new IntervalNumber(intervalObject.max.number, intervalObject.max.isClosed) }));
                }
            }
        }
        else {
            if (this.intervals.length > 1) {
                for (let i = 0; i < this.intervals.length - 1; i++) {
                    const current = this.intervals[i];
                    const next = this.intervals[i + 1];
                    // If the intervals are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Interval({ a: new IntervalNumber(current.max.number, !current.max.isClosed), b: new IntervalNumber(next.min.number, !next.min.isClosed) }));
                    }
                }
            }
        }
        return gaps;
    }
    /**
     * Returns the interval in the interval set that contain the given number.
     * @param x - The IntervalNumber to check.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const intervals: Interval[] = intervalSet.getIntervalsContaining(5);
     * @returns An array of Interval objects that contain the provided number.
     */
    getIntervalsContaining(x) {
        return this.intervals.filter((r) => r.contains(x));
    }
}
