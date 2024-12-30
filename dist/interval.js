/**
 * Represents an interval number
 * isClosed is optional and defaults to true.
 * isClosed represents if the number is included in the interval.
 */
export class IntervalNumber {
    constructor(number, isClosed = true) {
        this.number = number;
        this.isClosed = isClosed;
    }
    /**
     * Returns true if the given IntervalNumber is equal to this IntervalNumber.
     */
    equals(x) {
        return this.number === x.number && this.isClosed === x.isClosed;
    }
}
/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
 * console.log(interval.toString()); // (1, 10]
 */
export class Interval {
    constructor(interval) {
        var _a;
        this.name = 'Not Specified';
        if (typeof interval === 'string') {
            if (!Interval.validIntervalString(interval)) {
                throw new Error('Invalid interval string.');
            }
            interval = Interval.toInterval(interval);
        }
        if (interval.a === interval.b && (!interval.a.isClosed || !interval.b.isClosed)) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.a = interval.a;
        this.b = interval.b;
        this.name = (_a = interval.name) !== null && _a !== void 0 ? _a : this.name;
    }
    get min() {
        return this.a.number < this.b.number ? this.a : this.b;
    }
    set min(value) {
        if (this.a.number === this.min.number) {
            this.a = value;
        }
        else {
            this.b = value;
        }
    }
    get max() {
        return this.a.number > this.b.number ? this.a : this.b;
    }
    set max(value) {
        if (this.a.number === this.max.number) {
            this.a = value;
        }
        else {
            this.b = value;
        }
    }
    /**
     * Returns true if the interval contains the given IntervalNumber.
     */
    contains(x) {
        const lowerBound = this.min.number < x.number || (this.min.number === x.number && this.min.isClosed && x.isClosed);
        const upperBound = this.max.number > x.number || (this.max.number === x.number && this.max.isClosed && x.isClosed);
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
     * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString() {
        const aIsClosedChar = this.a.isClosed ? '[' : '(';
        const bIsClosedChar = this.b.isClosed ? ']' : ')';
        return `${aIsClosedChar}${this.a.number}, ${this.b.number}${bIsClosedChar}`;
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
        const aIsClosed = parts[0].startsWith('[');
        const b = Number(parts[1].substring(0, parts[1].length - 1));
        const bIsClosed = parts[1].endsWith(']');
        return new Interval({ a: new IntervalNumber(a, aIsClosed), b: new IntervalNumber(b, bIsClosed) });
    }
}
