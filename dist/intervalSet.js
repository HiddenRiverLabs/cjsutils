import { IntervalNumber, Interval } from "./interval.js";
/**
 * Represents interval set options.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 */
export class IntervalSetOptions {
    mergeAddedInterval = true;
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
    _intervals = [];
    _mergeAddedInterval = true;
    /**
     * Returns a copy of the intervals in the interval set.
     */
    get intervals() {
        return this._intervals.map((r) => new Interval(r));
    }
    /**
     * Gets or sets the mergeAddedInterval option.
     * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
     * Setting this option to true will merge the intervals in the interval set.
     */
    get mergeAddedInterval() {
        return this._mergeAddedInterval;
    }
    set mergeAddedInterval(value) {
        this._mergeAddedInterval = value;
        if (this.mergeAddedInterval) {
            IntervalSet.mergeIntervals(this._intervals);
        }
    }
    /**
     * Creates a new IntervalSet object.
     * intervalSet is optional and defaults to undefined.
     * @param intervalSet - The interval set object.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }), new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(15, false) })], options: { mergeAddedInterval: true });
     */
    constructor(intervalSet) {
        if (intervalSet?.intervals) {
            for (const interval of intervalSet.intervals) {
                const intervalObject = new Interval(interval);
                this._intervals.push(intervalObject);
            }
        }
        this.mergeAddedInterval = intervalSet?.options?.mergeAddedInterval ?? this._mergeAddedInterval;
    }
    /**
     * Sorts the intervals in the interval set, ascending based on the minimum value of each interval and isClosed is before !isClosed.
     */
    static sort(intervals) {
        intervals.sort((a, b) => {
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
        this._intervals.push(intervalObject);
        if (this._mergeAddedInterval) {
            IntervalSet.mergeIntervals(this._intervals);
        }
    }
    /**
     * Removes an interval from the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.removeInterval(new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }));
     * @example
     * intervalSet.removeInterval('[1, 10)');
     */
    removeInterval(interval) {
        const intervalObject = new Interval(interval);
        this._intervals = this._intervals.filter((r) => r.toString() !== intervalObject.toString());
    }
    /**
     * Remove interval by name.
     * @param name - The name of the interval.
     * @example
     * intervalSet.removeIntervalByName('Interval 1');
     */
    removeIntervalByName(name) {
        this._intervals = this._intervals.filter((r) => r.name !== name);
    }
    /**
     * Removes all intervals from the interval set.
     */
    clear() {
        this._intervals = [];
    }
    /**
     * Merge overlapping intervals in the interval set.
     */
    static mergeIntervals(intervals) {
        IntervalSet.sort(intervals);
        for (let i = 0; i < intervals.length - 1; i++) {
            const current = intervals[i];
            const next = intervals[i + 1];
            if (current.overlaps(next) || (current.max.number === next.min.number && current.max.isClosed !== next.min.isClosed)) {
                current.min = current.min.number < next.min.number || current.min.isClosed ? current.min : next.min;
                current.max = current.max.number > next.max.number || current.max.isClosed ? current.max : next.max;
                intervals.splice(i + 1, 1);
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
        // make a copy of the intervals array
        let intervalsCopy = this._intervals.map((r) => new Interval(r));
        // need to merge if not already merged and sort
        if (!this._mergeAddedInterval) {
            IntervalSet.mergeIntervals(intervalsCopy);
        }
        IntervalSet.sort(intervalsCopy);
        if (intervalObject) {
            // get all intervals that overlap with the given interval
            const overlappingIntervals = intervalsCopy.filter((r) => r.overlaps(intervalObject));
            // if there are no overlapping intervals, return the given interval
            if (overlappingIntervals.length === 0) {
                return [intervalObject];
            }
            else {
                // if the given interval's min is not contained in the first overlapping interval, then it's assumed that the given min is before the first overlapping interval
                if (!overlappingIntervals[0].contains(intervalObject.min)) {
                    gaps.push(new Interval({ a: intervalObject.min, b: new IntervalNumber(overlappingIntervals[0].min.number, !overlappingIntervals[0].min.isClosed) }));
                }
                // loop through the overlapping intervals and find the gaps between them
                for (let i = 0; i < overlappingIntervals.length - 1; i++) {
                    const current = overlappingIntervals[i];
                    const next = overlappingIntervals[i + 1];
                    // because we merged the intervals that fed the overlapping intervals, we can assume that the intervals are sorted and there are no overlapping intervals between them
                    gaps.push(new Interval({ a: new IntervalNumber(current.max.number, !current.max.isClosed), b: new IntervalNumber(next.min.number, !next.min.isClosed) }));
                }
                // check if the given interval's max is not in the last overlapping interval, assuming that the given max is after the last overlapping interval
                if (!overlappingIntervals[overlappingIntervals.length - 1].contains(intervalObject.max)) {
                    gaps.push(new Interval({ a: new IntervalNumber(overlappingIntervals[overlappingIntervals.length - 1].max.number, !overlappingIntervals[overlappingIntervals.length - 1].max.isClosed), b: intervalObject.max }));
                }
            }
        }
        else {
            if (intervalsCopy.length > 1) {
                for (let i = 0; i < intervalsCopy.length - 1; i++) {
                    const current = intervalsCopy[i];
                    const next = intervalsCopy[i + 1];
                    // because we merged the intervals that fed the overlapping intervals, we can assume that the intervals are sorted and there are no overlapping intervals between them
                    gaps.push(new Interval({ a: new IntervalNumber(current.max.number, !current.max.isClosed), b: new IntervalNumber(next.min.number, !next.min.isClosed) }));
                }
            }
        }
        return gaps;
    }
    /**
     * Create an interval gap in the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.createIntervalGap(new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(10, false) }));
     */
    createIntervalGap(interval) {
        const intervalObject = new Interval(interval);
        // use internal intervals array to properly update the intervals
        const overlappingIntervals = this._intervals.filter((r) => r.overlaps(intervalObject));
        if (overlappingIntervals.length > 0) {
            const overlappingIntervalSet = new IntervalSet({ intervals: overlappingIntervals, options: { mergeAddedInterval: false } });
            // get the overlapping intervals that contain the given interval's max but not min, and update their max
            const minIntervals = this._intervals.filter((r) => intervalObject.contains(r.max) && !intervalObject.contains(r.min));
            for (const minInterval of minIntervals) {
                minInterval.max = new IntervalNumber(intervalObject.min.number, !intervalObject.min.isClosed);
                overlappingIntervalSet.removeInterval(minInterval);
            }
            // get the overlapping intervals that contain the given interval's min but not max, and update their min
            const maxIntervals = this._intervals.filter((r) => intervalObject.contains(r.min) && !intervalObject.contains(r.max));
            for (const maxInterval of maxIntervals) {
                maxInterval.min = new IntervalNumber(intervalObject.max.number, !intervalObject.max.isClosed);
                overlappingIntervalSet.removeInterval(maxInterval);
            }
            // if there's only 1 overlapping interval and it contains the given interval, then split the overlapping interval into 2 intervals
            if (overlappingIntervalSet.intervals.length === 1 && overlappingIntervalSet.intervals[0].contains(intervalObject)) {
                this.clear();
                this.addInterval(new Interval({ a: overlappingIntervalSet.intervals[0].min, b: new IntervalNumber(intervalObject.min.number, !intervalObject.min.isClosed) }));
                this.addInterval(new Interval({ a: new IntervalNumber(intervalObject.max.number, !intervalObject.max.isClosed), b: overlappingIntervalSet.intervals[0].max }));
            }
            else {
                // remove the overlapping intervals that are contained in the given interval
                for (const overlappingInterval of overlappingIntervalSet.intervals) {
                    this.removeInterval(overlappingInterval);
                }
            }
        }
    }
    /**
     * Remove interval gaps in the interval set.
     * If interval set is already merged, then the gaps are removed depending on the replaceGapsWithNewIntervals parameter.
     * If interval set is not merged, then resolve the existing sets annd remove contained intervals, hen remove the gaps depending on the replaceGapsWithNewIntervals parameter.
     */
    chainIntervals() {
        let intervalsCopy = this.intervals;
        IntervalSet.sort(intervalsCopy);
        if (this._mergeAddedInterval) {
            for (let i = 0; i < intervalsCopy.length - 1; i++) {
                const current = intervalsCopy[i];
                const next = intervalsCopy[i + 1];
                // if current and next aren't already a chain, update the next interval's min
                if (current.max.number !== next.min.number || current.max.isClosed === next.min.isClosed) {
                    const localIntervalToUpdate = this._intervals.find((r) => r.toString() === next.toString());
                    if (localIntervalToUpdate) {
                        localIntervalToUpdate.min = new IntervalNumber(current.max.number, !current.max.isClosed);
                    }
                }
            }
            this.mergeAddedInterval = false;
        }
        else {
            for (let i = 0; i < intervalsCopy.length - 1; i++) {
                const current = intervalsCopy[i];
                const next = intervalsCopy[i + 1];
                // if the current interval contains the next interval's max or the next interval'smax is less than the current interval's max, remove the next interval
                if (current.contains(next.max) || next.max.number < current.max.number) {
                    intervalsCopy.splice(i + 1, 1);
                    i--;
                }
                else if (!current.contains(next.max) && current.max.number < next.max.number) {
                    // regardless of the next interval's min, as long as the next interval's max is not contained in the current interval
                    // and is larger than current interval's max, update the next interval's min
                    const localIntervalToUpdate = this._intervals.find((r) => r.toString() === next.toString());
                    if (localIntervalToUpdate) {
                        localIntervalToUpdate.min = new IntervalNumber(current.max.number, !current.max.isClosed);
                    }
                }
            }
        }
    }
    /**
     * Returns the interval in the interval set that contain the given number.
     * @param x - The IntervalNumber or number to check.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const intervals: Interval[] = intervalSet.getIntervalsContaining(5);
     * @returns An array of Interval objects that contain the provided number.
     */
    getIntervalsContaining(x) {
        if (typeof x === 'number') {
            x = new IntervalNumber(x);
        }
        return this._intervals.filter((r) => r.contains(x));
    }
}
