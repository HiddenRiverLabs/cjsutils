import { IInterval, Interval } from './interval.ts';

/**
 * Represents interval set options.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 */
export class IntervalSetOptions {
    mergeAddedInterval: boolean = true;
}

/**
 * Represents a set of intervals.
 * intervals is optional and defaults to an empty array.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 * @example
 * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 5, b: 15 })], options: { mergeAddedInterval: true });
 */
export class IntervalSet {
    intervals: Interval[] = [];
    private mergeAddedInterval: boolean = true;

    /**
     * Creates a new IntervalSet object.
     * intervalSet is optional and defaults to undefined.
     * @param intervalSet - The interval set object.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 5, b: 15 })], options: { mergeAddedInterval: true });
     */
    constructor(intervalSet?: { intervals?: (IInterval | string)[], options?: IntervalSetOptions }) {
        if (intervalSet?.intervals) {
            for (const interval of intervalSet.intervals) {
                const intervalObject = new Interval(interval);
                this.intervals.push(intervalObject);
            }
        }
        this.mergeAddedInterval = intervalSet?.options?.mergeAddedInterval ?? true;
        if (this.mergeAddedInterval) {
            this.mergeIntervals();
        }
        this.sort();
    }

    /**
     * Sorts the intervals in the interval set, ascending based on the minimum value of each interval.
     */
    sort(): void {
        this.intervals.sort((a: Interval, b: Interval): number => a.min - b.min);
    }

    /**
     * Adds an interval to the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.addInterval(new Interval({ a: 1, b: 10 }));
     * @example
     * intervalSet.addInterval('[1, 10)');
     */
    addInterval(interval: IInterval | string): void {
        const intervalObject = new Interval(interval);
        this.intervals.push(intervalObject);
        if (this.mergeAddedInterval) {
            this.mergeIntervals();
        }
        this.sort();
    }

    /**
     * Merge overlapping intervals in the interval set.
     */
    mergeIntervals(): void {
        this.sort();
        for (let i: number = 0; i < this.intervals.length - 1; i++) {
            const current: Interval = this.intervals[i];
            const next: Interval = this.intervals[i + 1];
            if (current.overlaps(next)) {
                current.a = Math.min(current.a, next.a);
                current.b = Math.max(current.b, next.b);
                this.intervals.splice(i + 1, 1);
                i--;
            }
        }
    }

    /**
     * Returns the gaps between the intervals in the interval set.
     * interval is optional and defaults to undefined.
     * If interval is provided, the gaps are calculated based on the given interval.
     * If interval is not provided, the gaps are calculated based on the intervals in the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const gaps: Interval[] = intervalSet.getRangeGaps();
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const gaps: Interval[] = intervalSet.getRangeGaps(new Interval({ a: 5, b: 25 }));
     * @returns An array of Interval objects representing the gaps.
     */
    getIntervalGaps(interval?: IInterval | string): Interval[] {
        const intervalObject = interval ? new Interval(interval) : undefined;
        const gaps: Interval[] = [];
        // make sure the intervals are sorted for the following logic to work
        this.sort();
        if (intervalObject) {
            // get all intervals that overlap with the given interval
            const overlappingIntervals: Interval[] = this.intervals.filter((r: Interval): boolean => r.overlaps(intervalObject));
            // if there are no overlapping intervals, return the given interval
            if (overlappingIntervals.length === 0) {
                return [intervalObject];
            } else {
                // sort the overlapping intervals
                overlappingIntervals.sort((a: Interval, b: Interval): number => a.min - b.min);
                // check if the given range's min is in the first overlapping range
                if (!overlappingIntervals[0].contains(intervalObject.min)) {
                    gaps.push(new Interval({ a: intervalObject.min, b: overlappingIntervals[0].min, excludeMin: intervalObject.excludeMin, excludeMax: !overlappingIntervals[0].excludeMin } as IInterval));
                }
                // loop through the overlapping intervals and find the gaps between them
                for (let i: number = 0; i < overlappingIntervals.length - 1; i++) {
                    const current: Interval = overlappingIntervals[i];
                    const next: Interval = overlappingIntervals[i + 1];
                    // If the intervals are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Interval({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin } as IInterval));
                    }
                }
                // check if the given interval's max is in the last overlapping interval
                if (!overlappingIntervals[overlappingIntervals.length - 1].contains(intervalObject.max)) {
                    gaps.push(new Interval({ a: overlappingIntervals[overlappingIntervals.length - 1].max, b: intervalObject.max, excludeMin: !overlappingIntervals[overlappingIntervals.length - 1].excludeMax, excludeMax: intervalObject.excludeMax } as IInterval));
                }
            }
        } else {
            if (this.intervals.length > 1) {
                for (let i: number = 0; i < this.intervals.length - 1; i++) {
                    const current: Interval = this.intervals[i];
                    const next: Interval = this.intervals[i + 1];
                    // If the intervals are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Interval({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin } as IInterval));
                    }
                }
            }
        }
        return gaps;
    }

    /**
     * Returns the interval in the interval set that contain the given number.
     * @param x - The number to check.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const intervals: Interval[] = intervalSet.getIntervalsContaining(5);
     * @returns An array of Interval objects that contain the provided number.
     */
    getIntervalsContaining(x: number): Interval[] {
        return this.intervals.filter((r: Interval): boolean => r.contains(x));
    }
}