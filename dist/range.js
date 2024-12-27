/**
 * Represents a range of numbers.
 * a or b can be greater than the other.
 */
export class Range {
    constructor(range) {
        var _a, _b, _c;
        this.excludeMin = false;
        this.excludeMax = true;
        this.name = 'Not Specified';
        this.a = range.a;
        this.b = range.b;
        this.excludeMin = (_a = range.excludeMin) !== null && _a !== void 0 ? _a : this.excludeMin;
        this.excludeMax = (_b = range.excludeMax) !== null && _b !== void 0 ? _b : this.excludeMax;
        this.name = (_c = range.name) !== null && _c !== void 0 ? _c : this.name;
    }
    get min() {
        return Math.min(this.a, this.b);
    }
    get max() {
        return Math.max(this.a, this.b);
    }
    get length() {
        return Math.abs(this.b - this.a);
    }
    contains(x) {
        const lowerBound = this.excludeMin ? this.min < x : this.min <= x;
        const upperBound = this.excludeMax ? this.max > x : this.max >= x;
        return lowerBound && upperBound;
    }
    /**
     * Returns true if the range overlaps with the given range.
     */
    overlaps(range) {
        return this.contains(range.min) || this.contains(range.max) || range.contains(this.min) || range.contains(this.max);
    }
    /**
     * Returns an array representing the range. [a, b]
     */
    toArray() {
        return [this.a, this.b];
    }
}
