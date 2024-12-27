/**
 * This class defines a range of numbers as a string using mathematical notation.
 * The range can be represented with [] or () to indicate if the range includes or excludes the endpoints.
 * The range can also be represented with an infinity symbol to indicate an unbounded range.Ranges are tracked with an index, which can be used to update the range with option to prevent overlapping ranges, cascading range updates to prevent overlap.
 * The range can be converted to a string using the toString() method.
 */
export class Range {
    /**
     * Precompiled regular expression for range validation.
     */
    static rangeRegex = /^[\[\(]-?(?:\d+|Infinity),-?(?:\d+|Infinity)[\]\)]$/;

    /**
     * The stored range as a string.
     */
    range;
    startInclusive;
    endInclusive;
    /**
     * Creates a new Range object.
     * @param {string} range The range as a string.
     */
    constructor(range) {
        // validate range syntax
        if (!this.validate(range)) {
            throw new Error('Invalid range syntax.');
        }
        this.range = range;
        // Parse the range string to get the start and end symbols.
        this.startInclusive = this.range[0] === '[';
        this.endInclusive = this.range[this.range.length - 1] === ']';
    }

    /**
     * Validate range syntax.
     * @param {string} range The range as a string.
     */
    static validate(range) {
        // Check for valid range syntax using precompiled regular expression.
        if (!Range.rangeRegex.test(range.trim())) {
            return false;
        }
        return true;
    }

    /**
     * Returns the range as a string.
     */
    toString() {
        return this.range;
    }

    /**
     * Returns the range as an array of numbers.
     */
    toArray() {
        // Parse the range string to get the start and end values.
        const rangeStr = this.range;
        const startStr = rangeStr.substring(1, rangeStr.indexOf(','));
        const endStr = rangeStr.substring(rangeStr.indexOf(',') + 1, rangeStr.length - 1);
        return [Number(startStr), Number(endStr)];
    }
}