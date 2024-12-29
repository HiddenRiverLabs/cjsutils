/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * excludeMin and excludeMax are optional and default to false and true respectively as sane default for chaining intervals for something like tiers.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: Interval = { a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' };
 */
export class Interval {
    /**
     * Creates a new Interval object.
     * @param interval - The interval object as IInterval or valid string representation.
     * @example
     * const interval: Interval = new Interval({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' });
     */
    constructor(interval) {
        var _a, _b, _c;
        this.excludeMin = false;
        this.excludeMax = true;
        this.name = 'Not Specified';
        //  validate the interval
        if (typeof interval === 'string') {
            if (!Interval.validIntervalString(interval)) {
                throw new Error('Invalid interval string.');
            }
            interval = Interval.toInterval(interval);
        }
        if (interval.a === interval.b && (interval.excludeMin || interval.excludeMax)) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.a = interval.a;
        this.b = interval.b;
        this.excludeMin = (_a = interval.excludeMin) !== null && _a !== void 0 ? _a : this.excludeMin;
        this.excludeMax = (_b = interval.excludeMax) !== null && _b !== void 0 ? _b : this.excludeMax;
        this.name = (_c = interval.name) !== null && _c !== void 0 ? _c : this.name;
    }
    /**
     * Returns the minimum value of the interval.
     */
    get min() {
        return Math.min(this.a, this.b);
    }
    /**
     * Returns the maximum value of the interval.
     */
    get max() {
        return Math.max(this.a, this.b);
    }
    /**
     * Returns the range of the interval.
     * The range is the difference between the maximum and minimum values.
     * Note that if using numbers smaller than 1 can result in floating point errors.
     */
    get range() {
        return this.max - this.min;
    }
    /**
     * Returns true if the interval contains the given number.
     */
    contains(x) {
        const lowerBound = this.excludeMin ? this.min < x : this.min <= x;
        const upperBound = this.excludeMax ? this.max > x : this.max >= x;
        return lowerBound && upperBound;
    }
    /**
     * Returns true if the interval overlaps with the given interval.
     */
    overlaps(interval) {
        return this.contains(interval.a) || this.contains(interval.b) || interval.contains(this.a) || interval.contains(this.b);
    }
    /**
     * Returns a string representation of the interval.
     * @example
     * const interval: Interval = new Interval({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString() {
        const minChar = this.excludeMin ? '(' : '[';
        const maxChar = this.excludeMax ? ')' : ']';
        return `${minChar}${this.min}, ${this.max}${maxChar}`;
    }
    /**
     * Returns true if the given string is a valid interval.
     * Supports the use of -Infinity and Infinity.
     * @param interval - The string representation of the interval.
     * @example
     * console.log(Interval.validIntervalString('(1, 10]')); // true
     * console.log(Interval.validIntervalString('1, 10]')); // false
     * @returns A boolean indicating if the string is a valid interval.
     */
    static validIntervalString(interval) {
        try {
            const parts = interval.split(',').map((part) => part.trim());
            if (parts.length !== 2) {
                return false;
            }
            const a = Number(parts[0].substring(1));
            const b = Number(parts[1].substring(0, parts[1].length - 1));
            const startSymbolValid = parts[0].startsWith('(') || parts[0].startsWith('[');
            const endSymbolValid = parts[1].endsWith(')') || parts[1].endsWith(']');
            return !isNaN(a) && !isNaN(b) && startSymbolValid && endSymbolValid && (a !== b || (a === b && parts[0].startsWith('[') && parts[1].endsWith(']')));
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Takes a string representation of an interval and returns an Interval object.
     * @param interval - The string representation of the interval.
     * @returns An Interval object.
     * @example
     * const interval: Interval = Interval.toInterval('(1, 10]');
     * console.log(interval.toString()); // (1, 10]
     */
    static toInterval(interval) {
        if (!Interval.validIntervalString(interval)) {
            throw new Error('Invalid interval string.');
        }
        const parts = interval.split(',').map((part) => part.trim());
        const a = Number(parts[0].substring(1));
        const b = Number(parts[1].substring(0, parts[1].length - 1));
        const excludeMin = Math.min(a, b) === a ? parts[0].startsWith('(') : parts[1].endsWith(')');
        const excludeMax = Math.max(a, b) === a ? parts[0].startsWith('(') : parts[1].endsWith(')');
        return new Interval({ a, b, excludeMin, excludeMax });
    }
}
