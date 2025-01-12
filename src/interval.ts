/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: IInterval = { a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' };
 */
export type IInterval = { a: IntervalNumber, b: IntervalNumber, name?: string };

/**
 * Represents an interval number
 * isClosed is optional and defaults to true.
 * isClosed represents if the number is included in the interval.
 */
export class IntervalNumber {
    number: number;
    isClosed: boolean;

    constructor(number: number, isClosed: boolean = true) {
        this.number = number;
        this.isClosed = isClosed;
    }

    /**
     * Returns true if the given IntervalNumber is equal to this IntervalNumber.
     */
    equals(x: IntervalNumber | number): boolean {
        if (typeof x === 'number') {
            x = new IntervalNumber(x);
        }
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
    #a: IntervalNumber;
    #b: IntervalNumber;
    public name: string = 'Not Specified';

    constructor(interval: IInterval | string) {
        if (typeof interval === 'string') {
            interval = Interval.toInterval(interval);
        }
        if (interval.a === interval.b && (!interval.a.isClosed || !interval.b.isClosed)) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.#a = interval.a;
        this.#b = interval.b;
        this.name = interval.name ?? this.name;
    }

    get a(): IntervalNumber {
        // return a copy of the interval number
        return new IntervalNumber(this.#a.number, this.#a.isClosed);
    }
    set a(value: IntervalNumber | number) {
        if (typeof value === 'number') {
            value = new IntervalNumber(value);
        }
        if (this.#b.number === value.number && !this.#b.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.#a = value;
    }

    get b(): IntervalNumber {
        // return a copy of the interval number
        return new IntervalNumber(this.#b.number, this.#b.isClosed);
    }
    set b(value: IntervalNumber | number) {
        if (typeof value === 'number') {
            value = new IntervalNumber(value);
        }
        if (this.#a.number === value.number && !this.#a.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.#b = value;
    }

    get min(): IntervalNumber {
        return this.#a.number < this.#b.number ? this.a : this.b;
    }
    set min(value: IntervalNumber | number) {
        if (typeof value === 'number') {
            value = new IntervalNumber(value);
        }
        if (this.#a.number === this.min.number) {
            this.a = value;
        } else {
            this.b = value;
        }
    }

    get max(): IntervalNumber {
        return this.#a.number > this.#b.number ? this.a : this.b;
    }
    set max(value: IntervalNumber | number) {
        if (typeof value === 'number') {
            value = new IntervalNumber(value);
        }
        if (this.#a.number === this.max.number) {
            this.a = value;
        } else {
            this.b = value;
        }
    }

    /**
     * Returns true if the interval contains the given IntervalNumber or Interval.
     */
    contains(x: IntervalNumber | Interval): boolean {
        if (x instanceof Interval) {
            return this.contains(x.a) && this.contains(x.b);
        }
        const lowerBound: boolean = this.min.number < x.number || (this.min.number === x.number && this.min.isClosed && x.isClosed);
        const upperBound: boolean = this.max.number > x.number || (this.max.number === x.number && this.max.isClosed && x.isClosed);
        return lowerBound && upperBound;
    }

    /**
     * Returns true if the interval overlaps with the given interval.
     */
    overlaps(interval: Interval): boolean {
        return this.contains(interval.a) || this.contains(interval.b) || interval.contains(this.#a) || interval.contains(this.#b);
    }

    /**
     * Returns a string representation of the interval.
     * @example
     * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString(): string {
        const aIsClosedChar: string = this.#a.isClosed ? '[' : '(';
        const bIsClosedChar: string = this.#b.isClosed ? ']' : ')';
        return `${aIsClosedChar}${this.#a.number}, ${this.#b.number}${bIsClosedChar}`;
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
            console.error('Error validating interval string:', error);
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
        const aIsClosed: boolean = parts[0].startsWith('[');
        const b: number = Number(parts[1].substring(0, parts[1].length - 1));
        const bIsClosed: boolean = parts[1].endsWith(']');
        return new Interval({ a: new IntervalNumber(a, aIsClosed), b: new IntervalNumber(b, bIsClosed) });
    }
}
