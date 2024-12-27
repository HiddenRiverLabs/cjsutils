import { IRange, Range } from './range.ts';

/**
 * Represents range set options.
 * mergeAddedRanges is optional and defaults to true.
 * mergeAddedRanges, when true, is used to merge overlapping ranges when adding a new range.
 */
export class RangeSetOptions {
    mergeAddedRanges: boolean = true;
}

/**
 * Represents a set of ranges.
 * ranges is an array of Range objects.
 * mergeAddedRanges is optional and defaults to true.
 * @example
 * const rangeSet: RangeSet = new RangeSet({ ranges: [new Range({ a: 1, b: 10 }), new Range({ a: 5, b: 15 })], options: { mergeAddedRanges: true });
 */
export class RangeSet {
    ranges: Range[] = [];
    private mergeAddedRanges: boolean = true;

    /**
     * Creates a new RangeSet object.
     * rangeSet is optional and defaults to an empty object.
     * rangeSet.ranges is optional and defaults to an empty array.
     * rangeSet.options is optional and defaults to an empty object.
     * rangeSet.options.mergeAddedRanges is optional and defaults to true.
     * @param rangeSet - The range set object.
     * @example
     * const rangeSet: RangeSet = new RangeSet({ ranges: [new Range({ a: 1, b: 10 }), new Range({ a: 5, b: 15 })], options: { mergeAddedRanges: true });
     */
    constructor(rangeSet?: { ranges?: Range[], options?: RangeSetOptions }) {
        this.ranges = rangeSet?.ranges ?? [];
        this.mergeAddedRanges = rangeSet?.options?.mergeAddedRanges ?? true;
        if (this.mergeAddedRanges) {
            this.mergeRanges();
        }
        this.sort();
    }

    /**
     * Sorts the ranges in the range set, ascending based on the minimum value of each range.
     */
    sort(): void {
        this.ranges.sort((a: Range, b: Range): number => a.min - b.min);
    }

    /**
     * Adds a range to the range set.
     * range is a Range object.
     * @param range - The range object.
     * @example
     * rangeSet.addRange(new Range({ a: 1, b: 10 }));
     */
    addRange(range: Range): void {
        this.ranges.push(range);
        if (this.mergeAddedRanges) {
            this.mergeRanges();
        }
        this.sort();
    }

    /**
     * Merge overlapping ranges in the range set.
     */
    mergeRanges(): void {
        this.sort();
        for (let i: number = 0; i < this.ranges.length - 1; i++) {
            const current: Range = this.ranges[i];
            const next: Range = this.ranges[i + 1];
            if (current.overlaps(next)) {
                current.a = Math.min(current.a, next.a);
                current.b = Math.max(current.b, next.b);
                this.ranges.splice(i + 1, 1);
                i--;
            }
        }
    }

    /**
     * Returns the gaps between the ranges in the range set.
     * range is optional and defaults to undefined.
     * If range is provided, the gaps are calculated based on the given range.
     * If range is not provided, the gaps are calculated based on the ranges in the range set.
     * @param range - The range object.
     * @example
     * const gaps: Range[] = rangeSet.getRangeGaps();
     * @example
     * const gaps: Range[] = rangeSet.getRangeGaps(new Range({ a: 1, b: 10 }));
     * @returns An array of Range objects representing the gaps.
     */
    getRangeGaps(range?: Range): Range[] {
        const gaps: Range[] = [];
        // make sure the ranges are sorted for the following logic to work
        this.sort();
        if (range) {
            // get all ranges that overlap with the given range
            const overlappingRanges: Range[] = this.ranges.filter((r: Range): boolean => r.overlaps(range));
            // if there are no overlapping ranges, return the given range
            if (overlappingRanges.length === 0) {
                return [range];
            } else {
                // sort the overlapping ranges
                overlappingRanges.sort((a: Range, b: Range): number => a.min - b.min);
                // check if the given range's min is in the first overlapping range
                if (!overlappingRanges[0].contains(range.min)) {
                    gaps.push(new Range({ a: range.min, b: overlappingRanges[0].min, excludeMin: range.excludeMin, excludeMax: !overlappingRanges[0].excludeMin } as IRange));
                }
                // loop through the overlapping ranges and find the gaps between them
                for (let i: number = 0; i < overlappingRanges.length - 1; i++) {
                    const current: Range = overlappingRanges[i];
                    const next: Range = overlappingRanges[i + 1];
                    // If the ranges are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Range({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin } as IRange));
                    }
                }
                // check if the given range's max is in the last overlapping range
                if (!overlappingRanges[overlappingRanges.length - 1].contains(range.max)) {
                    gaps.push(new Range({ a: overlappingRanges[overlappingRanges.length - 1].max, b: range.max, excludeMin: !overlappingRanges[overlappingRanges.length - 1].excludeMax, excludeMax: range.excludeMax } as IRange));
                }
            }
        } else {
            if (this.ranges.length > 1) {
                for (let i: number = 0; i < this.ranges.length - 1; i++) {
                    const current = this.ranges[i];
                    const next = this.ranges[i + 1];
                    // If the ranges are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Range({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin } as IRange));
                    }
                }
            }
        }
        return gaps;
    }

    /**
     * Returns the ranges in the range set that contain the given number.
     * x is the number to check.
     * @param x - The number to check.
     * @example
     * const ranges: Range[] = rangeSet.getRangesContaining(5);
     * @returns An array of Range objects.
     */
    getRangesContaining(x: number): Range[] {
        return this.ranges.filter((r: Range): boolean => r.contains(x));
    }
}