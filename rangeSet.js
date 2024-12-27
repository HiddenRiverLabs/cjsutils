/**
 * Ranges in the set are tracked with an index, which can be used to update the range with option to prevent overlapping ranges, cascading range updates to prevent overlap.
 * Ranges can be merged using the merge() method.
 * New ranges can be added to the range using the add() method, and optionally merged with existing ranges
 *  and/or return a list of ranges that represent the difference between the new range and the existing ranges.
 */
export class RangeSet {
    /**
     * The stored ranges as an array of Range objects.
     */
    ranges;
    /**
     * RangeSetConfig object.
     */
    config;

    /**
     * Creates a new RangeSet object.
     * @param {RangeSetConfig} RangeSetConfig Optional constraints for the RangeSet.
     */
    constructor(rangeSetConfig) {
        this.ranges = [];
        this.config = rangeSetConfig;
        // If preventOverlappingRanges is true, set mergeNewRanges to false.
        if (this.config.preventOverlappingRanges) {
            this.config.mergeNewRanges = false;
        }
    }

    /**
     * Returns the ranges as an array of strings.
     */
    toString() {
        return this.ranges.map((range) => range.toString());
    }

    /**
     * Returns the ranges as an array of arrays of numbers.
     */
    toArray() {
        return this.ranges.map((range) => range.toArray());
    }

    /**
     * Add a new range to the set.
     * @param {string} range The range as a string.
     * @param {boolean} merge Whether to merge the new range with existing ranges.
     * @returns {string[]} The difference between the new range and the existing ranges.
     */
    add(range, merge = true) {
        // Validate the range syntax.
        if (!RangeSet.validate(range)) {
            throw new Error('Invalid range syntax.');
        }
        const newRange = new Range(range);
        // If merge is true, merge the new range with existing ranges.
        if (merge) {
            this.merge(newRange);
        }
        // Get the difference between the new range and existing ranges.
        return this.difference(newRange);
    }
    /**
     * Merge a range with existing ranges.
     * @param {Range} newRange The new range to merge.
     */
    merge(newRange) {
        // Check if the new range overlaps with existing ranges.
        const overlapIndex = this.ranges.findIndex((range) => {
            const [start, end] = range.toArray();
            const [newStart, newEnd] = newRange.toArray();
            return newStart <= end && start <= newEnd;
        });
        // If the new range overlaps with existing ranges, merge the new range with the overlapping range.
        if (overlapIndex !== -1) {
            const [start, end] = this.ranges[overlapIndex].toArray();
            const [newStart, newEnd] = newRange.toArray();
            this.ranges[overlapIndex] = new Range(`[${Math.min(start, newStart)},${Math.max(end, newEnd)}]`);
        }
        else {
            // If the new range does not overlap with existing ranges, add the new range to the set.
            this.ranges.push(newRange);
        }
    }
    /**
     * Get the difference between a new range and existing ranges.
     * @param {Range} newRange The new range to compare.
     * @returns {string[]} The difference between the new range and existing ranges.
     */
    difference(newRange) {
        const difference = [];
        // Iterate through existing ranges to get the difference between the new range and existing ranges.
        this.ranges.forEach((range) => {
            const [start, end] = range.toArray();
            const [newStart, newEnd] = newRange.toArray();
            // If the new range overlaps with the existing range, update the new range to exclude the overlapping range.
            if (newStart <= end && start <= newEnd) {
                if (newStart < start) {
                    difference.push(new Range(`[${newStart},${start - 1}]`));
                }
                if (newEnd > end) {
                    newRange = new Range(`[${end + 1},${newEnd}]`);
                }
            }
        });
        // Add the remaining new range to the difference.
        difference.push(newRange);
        return difference.map((range) => range.toString());
    }
}

/**
 * Optional contraints for the RangeSet.
 */
export class RangeSetConfig {
    /**
     * Whether to merge new ranges with existing ranges.
     */
    mergeNewRanges;
    /**
     * Whether to return the difference between the new range and existing ranges.
     */
    addRangeReturnsDifference;
    /**
     * Whether to prevent overlapping ranges.
     * If true, mergeNewRanges will be set to false.
     */
    preventOverlappingRanges;
}