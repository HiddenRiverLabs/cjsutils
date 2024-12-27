export type IRange = { a: number, b: number, excludeMin?: boolean, excludeMax?: boolean, name?: string };

/**
 * Represents a range of numbers.
 * a or b can be greater than the other.
 */
export class Range implements IRange {
    a: number;
    b: number;
    excludeMin: boolean = false;
    excludeMax: boolean = true;
    name: string = 'Not Specified';

    constructor(range: IRange) {
        this.a = range.a;
        this.b = range.b;
        this.excludeMin = range.excludeMin ?? this.excludeMin;
        this.excludeMax = range.excludeMax ?? this.excludeMax;
        this.name = range.name ?? this.name;
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

    contains(x: number): boolean {
        const lowerBound = this.excludeMin ? this.min < x : this.min <= x;
        const upperBound = this.excludeMax ? this.max > x : this.max >= x;
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