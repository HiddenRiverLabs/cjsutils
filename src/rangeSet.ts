import { Range } from './range.ts';

export class RangeSetOptions {
    mergeAddedRanges: boolean = true;
}

export class RangeSet {
    ranges: Range[] = [];
    private mergeAddedRanges: boolean = true;

    constructor({ ranges, options }: { ranges?: Range[], options?: RangeSetOptions }) {
        this.ranges = ranges ?? [];
        this.mergeAddedRanges = options?.mergeAddedRanges ?? true;
        if (this.mergeAddedRanges) {
            this.mergeRanges();
        }
        this.sort();
    }

    sort() {
        this.ranges.sort((a, b) => a.min - b.min);
    }

    addRange(range: Range) {
        this.ranges.push(range);
        if (this.mergeAddedRanges) {
            this.mergeRanges();
        }
        this.sort();
    }

    mergeRanges() {
        this.ranges.sort((a, b) => a.min - b.min);
        for (let i = 0; i < this.ranges.length - 1; i++) {
            const current = this.ranges[i];
            const next = this.ranges[i + 1];
            if (current.overlaps(next)) {
                current.a = Math.min(current.a, next.a);
                current.b = Math.max(current.b, next.b);
                this.ranges.splice(i + 1, 1);
                i--;
            }
        }
    }

    getRangeGaps(range?: Range): Range[] {
        const gaps: Range[] = [];
        // make sure the ranges are sorted for the following logic to work
        this.sort();
        if (range) {
            // get all ranges that overlap with the given range
            const overlappingRanges = this.ranges.filter(r => r.overlaps(range));
            // if there are no overlapping ranges, return the given range
            if (overlappingRanges.length === 0) {
                return [range];
            } else {
                // sort the overlapping ranges
                overlappingRanges.sort((a, b) => a.min - b.min);
                // check if the given range's min is in the first overlapping range
                if (!overlappingRanges[0].contains(range.min)) {
                    gaps.push(new Range({ a: range.min, b: overlappingRanges[0].min, excludeMin: range.excludeMin, excludeMax: !overlappingRanges[0].excludeMin }));
                }
                // loop through the overlapping ranges and find the gaps between them
                for (let i = 0; i < overlappingRanges.length - 1; i++) {
                    const current = overlappingRanges[i];
                    const next = overlappingRanges[i + 1];
                    // If the ranges are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Range({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin }));
                    }
                }
                // check if the given range's max is in the last overlapping range
                if (!overlappingRanges[overlappingRanges.length - 1].contains(range.max)) {
                    gaps.push(new Range({ a: overlappingRanges[overlappingRanges.length - 1].max, b: range.max, excludeMin: !overlappingRanges[overlappingRanges.length - 1].excludeMax, excludeMax: range.excludeMax }));
                }
            }
        } else {
            if (this.ranges.length > 1) {
                for (let i = 0; i < this.ranges.length - 1; i++) {
                    const current = this.ranges[i];
                    const next = this.ranges[i + 1];
                    // If the ranges are not overlapping, there is a gap between them.
                    if (!current.overlaps(next)) {
                        gaps.push(new Range({ a: current.max, b: next.min, excludeMin: !current.excludeMax, excludeMax: !next.excludeMin }));
                    }
                }
            }
        }
        return gaps;
    }

    getRangesContaining(x: number): Range[] {
        return this.ranges.filter(r => r.contains(x));
    }
}