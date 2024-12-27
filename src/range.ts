/**
 * Represents a range of numbers.
 * a or b can be greater than the other.
 * excludeMin and excludeMax are optional.
 * name is optional.
 * @example
 * const range: IRange = { a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Range 1' };
 */
export type IRange = { a: number, b: number, excludeMin?: boolean, excludeMax?: boolean, name?: string };

/**
 * Represents a range of numbers.
 * a or b can be greater than the other.
 * excludeMin and excludeMax are optional.
 * name is optional.
 * @example
 * const range: Range = new Range({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Range 1' });
 */
export class Range implements IRange {
    a: number;
    b: number;
    excludeMin: boolean = false;
    excludeMax: boolean = true;
    name: string = 'Not Specified';

    /**
     * Creates a new Range object.
     * @param range - The range object.
     * @example
     * const range: Range = new Range({ a: 1, b: 10, excludeMin: true, excludeMax: false, name: 'Range 1' });
     */
    constructor(range: IRange) {
        this.a = range.a;
        this.b = range.b;
        this.excludeMin = range.excludeMin ?? this.excludeMin;
        this.excludeMax = range.excludeMax ?? this.excludeMax;
        this.name = range.name ?? this.name;
    }

    /**
     * Returns the minimum value of the range.
     */
    get min(): number {
        return Math.min(this.a, this.b);
    }

    /**
     * Returns the maximum value of the range.
     */
    get max(): number {
        return Math.max(this.a, this.b);
    }

    /**
     * Returns the length of the range.
     */
    get length(): number {
        return Math.abs(this.b - this.a);
    }

    /**
     * Returns true if the range contains the given number.
     */
    contains(x: number): boolean {
        const lowerBound: boolean = this.excludeMin ? this.min < x : this.min <= x;
        const upperBound: boolean = this.excludeMax ? this.max > x : this.max >= x;
        return lowerBound && upperBound;
    }

    /**
     * Returns true if the range overlaps with the given range.
     */
    overlaps(range: Range): boolean {
        return this.contains(range.min) || this.contains(range.max) || range.contains(this.min) || range.contains(this.max);
    }

    /**
     * Returns an array representing the range. [a, b]
     */
    toArray(): number[] {
        return [this.a, this.b];
    }
}