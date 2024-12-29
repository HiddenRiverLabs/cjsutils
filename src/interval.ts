/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * excludeMin and excludeMax are optional and default to false and true respectively as sane default for chaining intervals for something like tiers.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: IInterval = { a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' };
 */
export type IInterval = { a: number, b: number, excludeMin?: boolean, excludeMax?: boolean, name?: string };

/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * excludeMin and excludeMax are optional and default to false and true respectively as sane default for chaining intervals for something like tiers.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: Interval = { a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' };
 */
export class Interval implements IInterval {
    a: number;
    b: number;
    excludeMin: boolean = false;
    excludeMax: boolean = true;
    name: string = 'Not Specified';

    /**
     * Creates a new Interval object.
     * @param interval - The interval object as IInterval or valid string representation.
     * @example
     * const interval: Interval = new Interval({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' });
     */
    constructor(interval: IInterval | string) {
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
        this.excludeMin = interval.excludeMin ?? this.excludeMin;
        this.excludeMax = interval.excludeMax ?? this.excludeMax;
        this.name = interval.name ?? this.name;
    }

    /**
     * Returns the minimum value of the interval.
     */
    get min(): number {
        return Math.min(this.a, this.b);
    }

    /**
     * Returns the maximum value of the interval.
     */
    get max(): number {
        return Math.max(this.a, this.b);
    }

    /**
     * Returns the range of the interval.
     * The range is the difference between the maximum and minimum values.
     * Note that if using numbers smaller than 1 can result in floating point errors.
     */
    get range(): number {
        return this.max - this.min;
    }

    /**
     * Returns true if the interval contains the given number.
     */
    contains(x: number): boolean {
        const lowerBound: boolean = this.excludeMin ? this.min < x : this.min <= x;
        const upperBound: boolean = this.excludeMax ? this.max > x : this.max >= x;
        return lowerBound && upperBound;
    }

    /**
     * Returns true if the interval overlaps with the given interval.
     */
    overlaps(interval: Interval): boolean {
        return this.contains(interval.a) || this.contains(interval.b) || interval.contains(this.a) || interval.contains(this.b);
    }

    /**
     * Returns a string representation of the interval.
     * @example
     * const interval: Interval = new Interval({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString(): string {
        const minChar: string = this.excludeMin ? '(' : '[';
        const maxChar: string = this.excludeMax ? ')' : ']';
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
    static validIntervalString(interval: string): boolean {
        try {
            const parts: string[] = interval.split(',').map((part: string): string => part.trim());
            if (parts.length !== 2) {
                return false;
            }
            const a: number = Number(parts[0].substring(1));
            const b: number = Number(parts[1].substring(0, parts[1].length - 1));
            const startSymbolValid: boolean = parts[0].startsWith('(') || parts[0].startsWith('[');
            const endSymbolValid: boolean = parts[1].endsWith(')') || parts[1].endsWith(']');
            return !isNaN(a) && !isNaN(b) && startSymbolValid && endSymbolValid && (a !== b || (a === b && parts[0].startsWith('[') && parts[1].endsWith(']')));
        } catch (error) {
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
    static toInterval(interval: string): Interval {
        if (!Interval.validIntervalString(interval)) {
            throw new Error('Invalid interval string.');
        }
        const parts: string[] = interval.split(',').map((part: string): string => part.trim());
        const a: number = Number(parts[0].substring(1));
        const b: number = Number(parts[1].substring(0, parts[1].length - 1));
        const excludeMin: boolean = parts[0].startsWith('(');
        const excludeMax: boolean = parts[1].endsWith(')');
        return new Interval({ a, b, excludeMin, excludeMax });
    }
}